import { supabase } from './supabaseClient'
import { LeadDeduplicationService } from '../services/LeadDeduplicationService'

export interface BulkOperationResult {
  success: boolean
  message: string
  data?: any
}

export class BulkCampaignService {
  /**
   * Adiciona todas as listas disponíveis a uma campanha de uma vez
   */
  static async addAllListsToCampaign(
    campaignId: string,
    availableLists: any[],
    currentSelectedLists: string[],
    currentIgnoredLists: string[],
    currentLeads: any[]
  ): Promise<BulkOperationResult> {
    try {
      // Validar campaignId
      if (!campaignId || campaignId.trim() === '') {
        return {
          success: false,
          message: 'ID da campanha é obrigatório'
        }
      }

      // Adicionando todas as listas

      if (availableLists.length === 0) {
        return {
          success: true,
          message: 'Nenhuma lista disponível para adicionar'
        }
      }

      // Preparar dados para adicionar todas as listas de uma vez
      const newListIds = availableLists.map(list => list.id)
      const newSelectedLists = [...new Set([...currentSelectedLists, ...newListIds])] // Remove duplicatas

      // Processar todos os leads de uma vez
      let newLeads = [...currentLeads]
      let totalDuplicates = 0

      for (const list of availableLists) {
        const { uniqueLeads, duplicatesCount } = LeadDeduplicationService.deduplicateLeadsWithCount(list.leads, list.id)
        newLeads = LeadDeduplicationService.addLeadsWithDeduplication(newLeads, uniqueLeads)
        totalDuplicates += duplicatesCount
      }

      // Salvar todas as listas de uma vez no banco
      await this.updateCampaignLists(campaignId, newSelectedLists, currentIgnoredLists)
      await this.addLeadsToCampaign(campaignId, newLeads)
      await this.updateDuplicatesCount(campaignId, totalDuplicates)

      // Todas as listas adicionadas com sucesso

      return {
        success: true,
        message: `${availableLists.length} listas adicionadas com sucesso`,
        data: {
          selectedLists: newSelectedLists,
          leads: newLeads
        }
      }
    } catch (error) {

      return {
        success: false,
        message: `Erro ao adicionar listas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }
    }
  }

  /**
   * Remove todas as listas selecionadas de uma campanha de uma vez
   */
  static async removeAllListsFromCampaign(
    campaignId: string,
    currentIgnoredLists: string[]
  ): Promise<BulkOperationResult> {
    try {
      // Validar campaignId
      if (!campaignId || campaignId.trim() === '') {
        return {
          success: false,
          message: 'ID da campanha é obrigatório'
        }
      }

      // Removendo todas as listas

      // Salvar no banco - remover todas as listas de uma vez
      await this.updateCampaignLists(campaignId, [], currentIgnoredLists)
      // Remover todos os leads da campanha
      await this.removeAllLeadsFromCampaign(campaignId)

      // Todas as listas removidas com sucesso

      return {
        success: true,
        message: 'Todas as listas removidas com sucesso',
        data: {
          selectedLists: [],
          leads: []
        }
      }
    } catch (error) {

      return {
        success: false,
        message: `Erro ao remover listas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }
    }
  }

  /**
   * Atualiza as listas de uma campanha no banco
   */
  private static async updateCampaignLists(
    campaignId: string,
    selectedLists: string[],
    ignoredLists: string[]
  ): Promise<void> {
    // Primeiro, remover todas as associações existentes
    const { error: deleteError } = await supabase
      .from('campaign_lists')
      .delete()
      .eq('campaign_id', campaignId)

    if (deleteError) {
      throw new Error(`Erro ao remover listas existentes: ${deleteError.message}`)
    }

    // Adicionar novas associações para listas selecionadas
    if (selectedLists.length > 0) {
      const listAssociations = selectedLists.map(listId => ({
        campaign_id: campaignId,
        list_id: listId,
        status: 'selected'
      }))

      const { error: insertError } = await supabase
        .from('campaign_lists')
        .insert(listAssociations)

      if (insertError) {
        throw new Error(`Erro ao adicionar listas selecionadas: ${insertError.message}`)
      }
    }

    // Adicionar associações para listas ignoradas
    if (ignoredLists.length > 0) {
      const ignoredAssociations = ignoredLists.map(listId => ({
        campaign_id: campaignId,
        list_id: listId,
        status: 'ignored'
      }))

      const { error: insertIgnoredError } = await supabase
        .from('campaign_lists')
        .insert(ignoredAssociations)

      if (insertIgnoredError) {
        throw new Error(`Erro ao adicionar listas ignoradas: ${insertIgnoredError.message}`)
      }
    }

    // Atualizar contadores na tabela campaigns
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({
        selected_lists_count: selectedLists.length,
        ignored_lists_count: ignoredLists.length
      })
      .eq('id', campaignId)

    if (updateError) {
      throw new Error(`Erro ao atualizar contadores: ${updateError.message}`)
    }
  }

  /**
   * Remove todos os leads de uma campanha
   */
  private static async removeAllLeadsFromCampaign(campaignId: string): Promise<void> {
    const { error: deleteError } = await supabase
      .from('campaign_unique_leads')
      .delete()
      .eq('campaign_id', campaignId)

    if (deleteError) {
      throw new Error(`Erro ao remover leads existentes: ${deleteError.message}`)
    }

    // Atualizar contadores para zero
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({
        total_leads: 0,
        unique_leads: 0,
        duplicates_count: 0
      })
      .eq('id', campaignId)

    if (updateError) {
      throw new Error(`Erro ao atualizar contadores de leads: ${updateError.message}`)
    }
  }

  /**
   * Adiciona leads a uma campanha no banco
   */
  private static async addLeadsToCampaign(
    campaignId: string,
    leads: any[]
  ): Promise<void> {
    // Processar leads válidos
    const validLeads = leads.filter(lead => {
      // Filtrar leads sem telefone válido
      const normalizedPhone = LeadDeduplicationService.normalizePhone(lead.phone)
      return normalizedPhone && normalizedPhone.length > 0
    })

    // Adicionar novos leads se houver leads válidos
    if (validLeads.length > 0) {
      const leadRecords = validLeads.map(lead => {
        // Garantir que phoneHash existe, se não, gerar um
        const phoneHash = lead.phoneHash || LeadDeduplicationService.generatePhoneHash(lead.phone || '')

        return {
          campaign_id: campaignId,
          list_id: lead.listId,
          lead_name: lead.name,
          lead_phone: lead.phone || '',
          lead_email: lead.email || '',
          lead_company: lead.company || '',
          lead_position: lead.position || '',
          phone_hash: phoneHash
        }
      })

      // Deduplicar leads por phone_hash para evitar conflitos no UPSERT
      const uniqueLeadRecords = leadRecords.reduce((acc, current) => {
        const key = `${current.campaign_id}_${current.phone_hash}`
        if (!acc.has(key)) {
          acc.set(key, current)
        }
        return acc
      }, new Map())

      const deduplicatedRecords = Array.from(uniqueLeadRecords.values())
      const { error: insertError } = await supabase
        .from('campaign_unique_leads')
        .upsert(deduplicatedRecords, {

          onConflict: 'campaign_id,phone_hash',
          ignoreDuplicates: false

        })

      if (insertError) {
        throw new Error(`Erro ao adicionar leads: ${insertError.message}`)
      }
    }

    // Atualizar contadores na tabela campaigns - buscar contagem real
    const { data: campaignData, error: countError } = await supabase
      .from('campaign_unique_leads')
      .select('id', { count: 'exact' })
      .eq('campaign_id', campaignId)

    if (countError) {
      throw new Error(`Erro ao contar leads: ${countError.message}`)
    }

    const totalLeads = campaignData?.length || 0

    const { error: updateError } = await supabase
      .from('campaigns')
      .update({
        total_leads: totalLeads,
        unique_leads: totalLeads,
        duplicates_count: 0 // Será atualizado pelo método que chama
      })
      .eq('id', campaignId)

    if (updateError) {
      throw new Error(`Erro ao atualizar contadores de leads: ${updateError.message}`)
    }
  }

  /**
   * Atualizar contador de duplicados
   */
  private static async updateDuplicatesCount(campaignId: string, duplicatesCount: number): Promise<void> {
    const { error } = await supabase
      .from('campaigns')
      .update({ duplicates_count: duplicatesCount })
      .eq('id', campaignId)

    if (error) {
      throw new Error(`Erro ao atualizar contador de duplicados: ${error.message}`)
    }
  }
}
