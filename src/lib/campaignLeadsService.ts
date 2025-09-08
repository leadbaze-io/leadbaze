import { supabase } from './supabaseClient'
import type { CampaignLead, CampaignLeadsOperation, UsedListSummary, Lead } from '../types'

export class CampaignLeadsService {
  // ==============================================
  // OPERAÇÕES PRINCIPAIS
  // ==============================================

  /**
   * Adicionar leads de uma lista à campanha
   */
  static async addLeadsFromList(
    campaignId: string, 
    listId: string, 
    leads: Lead[]
  ): Promise<CampaignLeadsOperation> {
    try {
      // Validar parâmetros de entrada
      if (!campaignId || !listId || !Array.isArray(leads)) {
        throw new Error('Parâmetros inválidos: campaignId, listId e leads são obrigatórios')
      }

      // Filtrar leads válidos (não null/undefined)
      const validLeads = leads.filter(lead => lead && typeof lead === 'object')
      
      if (validLeads.length === 0) {
        return {
          success: true,
          message: 'Nenhum lead válido encontrado para adicionar',
          added_leads: 0,
          removed_leads: 0,
          duplicate_leads: 0,
          total_campaign_leads: await this.getCampaignLeadsCount(campaignId)
        }
      }

      // Gerar hashes únicos para cada lead válido
      const leadsWithHashes = validLeads.map(lead => ({
        campaign_id: campaignId,
        list_id: listId,
        lead_data: lead,
        lead_hash: this.generateLeadHash(lead)
      }))

      console.log('🔍 DEBUG addLeadsFromList:')
      console.log('- Total de leads para inserir:', leadsWithHashes.length)
      console.log('- Hashes únicos gerados:', new Set(leadsWithHashes.map(l => l.lead_hash)).size)
      console.log('- Primeiro hash:', leadsWithHashes[0]?.lead_hash || 'N/A')
      
      // Verificar se há leads com dados similares
      const phoneGroups = new Map()
      validLeads.forEach((lead, index) => {
        const phone = (lead?.phone || '').replace(/\D/g, '')
        if (!phoneGroups.has(phone)) {
          phoneGroups.set(phone, [])
        }
        const group = phoneGroups.get(phone)
        if (group) {
          group.push({ index, lead })
        }
      })
      
      console.log('- Grupos por telefone:', phoneGroups.size)
      phoneGroups.forEach((group, phone) => {
        if (group && group.length > 1) {
          console.log(`- Telefone ${phone} tem ${group.length} leads:`)
          group.forEach((g: { lead: Lead }, i: number) => {
            const lead = g?.lead
            if (lead) {
              const hash = this.generateLeadHash(lead)
              console.log(`  ${i + 1}. Nome: "${lead?.name || 'N/A'}", Endereço: "${lead?.address || 'N/A'}", Hash: "${hash}"`)
            }
          })
        }
      })


      // Filtrar leads únicos na lista atual
      const uniqueLeadsInList = leadsWithHashes.filter((lead, index, self) => 
        index === self.findIndex(l => l.lead_hash === lead.lead_hash)
      )

      console.log(`- Leads únicos na lista: ${uniqueLeadsInList.length} (${leadsWithHashes.length - uniqueLeadsInList.length} duplicatas na lista removidas)`)

      // Verificar quais leads já existem no banco de dados
      const existingHashes = await this.getExistingLeadHashes(campaignId)
      console.log(`- Hashes existentes no banco: ${existingHashes.size}`)

      // Filtrar leads que não existem no banco
      const newLeadsToInsert = uniqueLeadsInList.filter(lead => 
        !existingHashes.has(lead.lead_hash)
      )

      console.log(`- Leads novos para inserir: ${newLeadsToInsert.length} (${uniqueLeadsInList.length - newLeadsToInsert.length} já existem no banco)`)

      if (newLeadsToInsert.length === 0) {
        console.log('Nenhum lead novo para inserir')
        return {
          success: true,
          message: 'Todos os leads já existem na campanha',
          added_leads: 0,
          removed_leads: 0,
          duplicate_leads: uniqueLeadsInList.length,
          total_campaign_leads: await this.getCampaignLeadsCount(campaignId)
        }
      }

      // Inserir apenas leads novos
      const { error: insertError } = await supabase
        .from('campaign_leads')
        .insert(newLeadsToInsert)
        .select('*')

      if (insertError) {
        console.error('Erro detalhado ao inserir leads:', insertError)
        console.error('Código do erro:', insertError.code)
        console.error('Mensagem do erro:', insertError.message)
        console.error('Detalhes do erro:', insertError.details)
        
        // Se houver erro de constraint unique, alguns leads já existem
        if (insertError.code === '23505') { // Violação de constraint unique
          // Tentar inserir um por vez para identificar duplicatas
          const results = await this.insertLeadsIndividually(newLeadsToInsert)
          return {
            success: true,
            message: `Leads processados com sucesso`,
            added_leads: results.added,
            removed_leads: 0,
            duplicate_leads: results.duplicates,
            total_campaign_leads: await this.getCampaignLeadsCount(campaignId)
          }
        }
        throw insertError
      }

      const totalAfterInsert = await this.getCampaignLeadsCount(campaignId)
      const duplicatesInList = leads.length - uniqueLeadsInList.length
      const duplicatesInDatabase = uniqueLeadsInList.length - newLeadsToInsert.length
      const totalDuplicates = duplicatesInList + duplicatesInDatabase
      
      // Atualizar total_leads na campanha
      await this.updateCampaignTotalLeads(campaignId)
      
      console.log('🔍 DEBUG após inserção:')
      console.log('- Leads originais:', leads.length)
      console.log('- Leads únicos na lista:', uniqueLeadsInList.length)
      console.log('- Leads novos inseridos:', newLeadsToInsert.length)
      console.log('- Duplicatas na lista:', duplicatesInList)
      console.log('- Duplicatas no banco:', duplicatesInDatabase)
      console.log('- Total na campanha após inserção:', totalAfterInsert)

      return {
        success: true,
        message: `${newLeadsToInsert.length} leads únicos adicionados com sucesso${totalDuplicates > 0 ? ` (${totalDuplicates} duplicatas ignoradas)` : ''}`,
        added_leads: newLeadsToInsert.length,
        removed_leads: 0,
        duplicate_leads: totalDuplicates,
        total_campaign_leads: totalAfterInsert
      }
    } catch (error) {
      console.error('Erro ao adicionar leads à campanha:', error)
      return {
        success: false,
        message: 'Erro ao adicionar leads à campanha',
        added_leads: 0,
        removed_leads: 0,
        duplicate_leads: 0,
        total_campaign_leads: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Remover todos os leads de uma lista específica da campanha
   */
  static async removeLeadsFromList(
    campaignId: string, 
    listId: string
  ): Promise<CampaignLeadsOperation> {
    try {
      // Fazer DELETE completo para permitir reutilização da lista
      const { data: deletedLeads, error: deleteError } = await supabase
        .from('campaign_leads')
        .delete()
        .eq('campaign_id', campaignId)
        .eq('list_id', listId)
        .select('*')

      if (deleteError) throw deleteError

      const removedCount = deletedLeads?.length || 0

      // Atualizar total_leads na campanha
      await this.updateCampaignTotalLeads(campaignId)

      return {
        success: true,
        message: `${removedCount} leads removidos com sucesso`,
        added_leads: 0,
        removed_leads: removedCount,
        duplicate_leads: 0,
        total_campaign_leads: await this.getCampaignLeadsCount(campaignId)
      }
    } catch (error) {
      console.error('Erro ao remover leads da lista:', error)
      return {
        success: false,
        message: 'Erro ao remover leads da lista',
        added_leads: 0,
        removed_leads: 0,
        duplicate_leads: 0,
        total_campaign_leads: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Remover leads específicos da campanha
   */
  static async removeSpecificLeads(
    campaignId: string, 
    leadIds: string[]
  ): Promise<CampaignLeadsOperation> {
    try {
      const { data: deletedLeads, error: deleteError } = await supabase
        .from('campaign_leads')
        .delete()
        .eq('campaign_id', campaignId)
        .in('id', leadIds)
        .select('*')

      if (deleteError) throw deleteError

      const removedCount = deletedLeads?.length || 0

      // Atualizar total_leads na campanha
      await this.updateCampaignTotalLeads(campaignId)

      return {
        success: true,
        message: `${removedCount} leads removidos com sucesso`,
        added_leads: 0,
        removed_leads: removedCount,
        duplicate_leads: 0,
        total_campaign_leads: await this.getCampaignLeadsCount(campaignId)
      }
    } catch (error) {
      console.error('Erro ao remover leads específicos:', error)
      return {
        success: false,
        message: 'Erro ao remover leads específicos',
        added_leads: 0,
        removed_leads: 0,
        duplicate_leads: 0,
        total_campaign_leads: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
      }
  }

  /**
   * Obter todos os leads de uma campanha
   */
  static async getCampaignLeads(campaignId: string): Promise<CampaignLead[]> {
    try {
      const { data: leads, error } = await supabase
        .from('campaign_leads')
        .select(`
          *,
          lead_lists!inner(name, total_leads),
          bulk_campaigns!inner(name, status)
        `)
        .eq('campaign_id', campaignId)
        .order('added_at', { ascending: true })

      if (error) throw error

      return leads?.map(lead => ({
        id: lead.id,
        campaign_id: lead.campaign_id,
        list_id: lead.list_id,
        lead_data: lead.lead_data,
        lead_hash: lead.lead_hash,
        added_at: lead.added_at,
        list_name: (lead.lead_lists as { name: string })?.name,
        list_total_leads: (lead.lead_lists as { total_leads: number })?.total_leads,
        campaign_name: (lead.bulk_campaigns as { name: string })?.name,
        campaign_status: (lead.bulk_campaigns as { status: string })?.status
      })) || []
    } catch (error) {
      console.error('Erro ao obter leads da campanha:', error)
      return []
    }
  }

  /**
   * Obter resumo das listas utilizadas em uma campanha
   */
  static async getUsedListsSummary(campaignId: string): Promise<UsedListSummary[]> {
    try {
      const { data: summary, error } = await supabase
        .from('campaign_leads')
        .select(`
          list_id,
          lead_lists!inner(name, total_leads),
          added_at
        `)
        .eq('campaign_id', campaignId)
        .order('added_at', { ascending: false })

      if (error) throw error


      // Agrupar por lista e contar leads únicos realmente adicionados
      const listMap = new Map<string, UsedListSummary>()
      
      summary?.forEach(item => {
        const listId = item.list_id
        if (!listMap.has(listId)) {
          listMap.set(listId, {
            list_id: listId,
            list_name: (item.lead_lists as { name: string }[])?.[0]?.name || 'Lista desconhecida',
            total_leads: (item.lead_lists as { total_leads: number }[])?.[0]?.total_leads || 0, // Total da lista original
            leads_in_campaign: 0, // Será contado abaixo
            added_at: item.added_at
          })
        }
        // Contar apenas leads únicos (cada registro na tabela campaign_leads é um lead único)
        listMap.get(listId)!.leads_in_campaign++
      })

      return Array.from(listMap.values())
    } catch (error) {
      console.error('Erro ao obter resumo das listas utilizadas:', error)
      return []
    }
  }

  /**
   * Obter contagem total de leads em uma campanha
   */
  static async getCampaignLeadsCount(campaignId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('campaign_leads')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId)

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Erro ao contar leads da campanha:', error)
      return 0
    }
  }

  /**
   * Obter hashes dos leads que já existem na campanha
   */
  static async getExistingLeadHashes(campaignId: string): Promise<Set<string>> {
    try {
      const { data, error } = await supabase
        .from('campaign_leads')
        .select('lead_hash')
        .eq('campaign_id', campaignId)

      if (error) throw error
      return new Set(data?.map(item => item.lead_hash) || [])
    } catch (error) {
      console.error('Erro ao obter hashes existentes:', error)
      return new Set()
    }
  }

  // ==============================================
  // FUNÇÕES AUXILIARES
  // ==============================================

  /**
   * Gerar hash único para um lead baseado PRINCIPALMENTE no telefone
   * (telefone é o identificador único real para evitar duplicatas)
   */
  private static generateLeadHash(lead: Lead): string {
    // Verificação de segurança para lead
    if (!lead || typeof lead !== 'object') {
      console.warn('⚠️ Lead inválido recebido:', lead)
      return this.simpleHash('invalid_lead_' + Date.now())
    }

    // Normalizar telefone (com verificação de segurança)
    const phone = lead?.phone || ''
    const normalizedPhone = phone.replace(/\D/g, '') // Apenas números
    
    // Se há telefone, usar APENAS o telefone como identificador único
    if (normalizedPhone) {
      const finalHash = this.simpleHash(normalizedPhone)
      
      // Log detalhado para debug (apenas para telefones específicos)
      if (normalizedPhone === '31987264531') {
        console.log('🔍 DEBUG generateLeadHash para telefone 31987264531:')
        console.log('- Nome original:', lead?.name || 'N/A')
        console.log('- Telefone original:', phone)
        console.log('- Endereço original:', lead?.address || 'N/A')
        console.log('- Telefone normalizado:', normalizedPhone)
        console.log('- Hash final (baseado APENAS no telefone):', finalHash)
        console.log('- ✅ Mesmo telefone = Mesmo contato (duplicata)')
      }
      
      return finalHash
    }
    
    // Fallback: Se não há telefone, usar nome + endereço
    const name = lead?.name || ''
    const normalizedName = name.toLowerCase().trim().replace(/\s+/g, ' ')
    const address = lead?.address || ''
    const normalizedAddress = address.toLowerCase().trim().replace(/\s+/g, ' ')
    
    const combinedData = `${normalizedName}|${normalizedAddress}`
    const fallbackHash = this.simpleHash(combinedData)
    
    console.log('⚠️ Lead sem telefone usando fallback:', {
      name: name || 'N/A',
      address: address || 'N/A',
      hash: fallbackHash
    })
    
    return fallbackHash
  }

  /**
   * Função auxiliar para gerar hash simples
   */
  private static simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36).substring(0, 64)
  }

  /**
   * Atualizar total_leads na campanha baseado na contagem real
   */
  private static async updateCampaignTotalLeads(campaignId: string): Promise<void> {
    try {
      const totalLeads = await this.getCampaignLeadsCount(campaignId)
      
      const { error } = await supabase
        .from('bulk_campaigns')
        .update({ 
          total_leads: totalLeads,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)

      if (error) {
        console.error('Erro ao atualizar total_leads da campanha:', error)
      } else {
        console.log(`✅ Total de leads da campanha ${campaignId} atualizado para: ${totalLeads}`)
      }
    } catch (error) {
      console.error('Erro ao atualizar total_leads da campanha:', error)
    }
  }

  /**
   * Verificar se um número de telefone específico já existe em qualquer campanha
   */
  static async checkPhoneExists(phone: string): Promise<{
    exists: boolean
    totalOccurrences: number
    campaigns: Array<{
      campaign_id: string
      campaign_name: string
      list_name: string
      lead_name: string
      lead_phone: string
      lead_address: string
      added_at: string
    }>
  }> {
    try {
      const normalizedPhone = phone.replace(/\D/g, '')
      if (!normalizedPhone) {
        return { exists: false, totalOccurrences: 0, campaigns: [] }
      }

      const phoneHash = this.simpleHash(normalizedPhone)
      
      const { data, error } = await supabase
        .from('campaign_leads')
        .select(`
          campaign_id,
          lead_data,
          added_at,
          bulk_campaigns!inner(name),
          lead_lists!inner(name)
        `)
        .eq('lead_hash', phoneHash)
        .order('added_at', { ascending: false })

      if (error) throw error

      const campaigns = data?.map(item => ({
        campaign_id: item.campaign_id,
        campaign_name: Array.isArray(item.bulk_campaigns) 
          ? (item.bulk_campaigns[0] as { name: string })?.name || 'Campanha desconhecida'
          : (item.bulk_campaigns as { name: string })?.name || 'Campanha desconhecida',
        list_name: Array.isArray(item.lead_lists)
          ? (item.lead_lists[0] as { name: string })?.name || 'Lista desconhecida'
          : (item.lead_lists as { name: string })?.name || 'Lista desconhecida',
        lead_name: (item.lead_data as any)?.name || 'Lead sem nome',
        lead_phone: (item.lead_data as any)?.phone || phone,
        lead_address: (item.lead_data as any)?.address || 'Endereço não disponível',
        added_at: item.added_at
      })) || []

      return {
        exists: campaigns.length > 0,
        totalOccurrences: campaigns.length,
        campaigns
      }
    } catch (error) {
      console.error('Erro ao verificar telefone:', error)
      return { exists: false, totalOccurrences: 0, campaigns: [] }
    }
  }

  /**
   * Inserir leads individualmente para identificar duplicatas
   */
  private static async insertLeadsIndividually(
    leadsWithHashes: Array<{
      campaign_id: string
      list_id: string
      lead_data: Lead
      lead_hash: string
    }>
  ): Promise<{ added: number; duplicates: number }> {
    let added = 0
    let duplicates = 0

    for (const leadData of leadsWithHashes) {
      try {
        const { error } = await supabase
          .from('campaign_leads')
          .insert(leadData)

        if (error) {
          if (error.code === '23505') { // Duplicata
            duplicates++
          } else {
            console.error('Erro ao inserir lead individual:', error)
          }
        } else {
          added++
        }
      } catch (error) {
        console.error('Erro ao inserir lead individual:', error)
      }
    }

    return { added, duplicates }
  }


}
