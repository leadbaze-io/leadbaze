/**
 * =====================================================
 * SERVIÇO DE CAMPANHAS - NOVA ARQUITETURA
 * =====================================================
 */

import { supabase } from '../lib/supabaseClient'
import type { Campaign, CampaignLead } from '../types/campaign'

export class CampaignService {
  /**
   * Criar nova campanha
   */
  static async createCampaign(name: string, message?: string): Promise<Campaign> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        user_id: user.id,
        name,
        message: message || ''
      })
      .select()
      .single()

    if (error) throw new Error(`Erro ao criar campanha: ${error.message}`)
    return data
  }

  /**
   * Buscar campanhas do usuário
   */
  static async getUserCampaigns(): Promise<Campaign[]> {
    console.log('🔍 CampaignService.getUserCampaigns() - Iniciando busca...')
    
    const { data: { user } } = await supabase.auth.getUser()
    console.log('👤 Usuário autenticado:', user ? { id: user.id, email: user.email } : 'NENHUM')
    
    if (!user) throw new Error('Usuário não autenticado')

    console.log('📡 Fazendo query no Supabase...')
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    console.log('📊 Resultado da query:', { data, error })
    
    if (error) {
      console.error('❌ Erro na query:', error)
      throw new Error(`Erro ao buscar campanhas: ${error.message}`)
    }
    
    console.log('✅ Campanhas encontradas:', data?.length || 0)
    return data || []
  }

  /**
   * Buscar campanha específica
   */
  static async getCampaign(campaignId: string): Promise<Campaign | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Erro ao buscar campanha: ${error.message}`)
    }
    return data
  }

  /**
   * Atualizar campanha
   */
  static async updateCampaign(campaignId: string, updates: Partial<Campaign>): Promise<Campaign> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from('campaigns')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw new Error(`Erro ao atualizar campanha: ${error.message}`)
    return data
  }

  /**
   * Deletar campanha
   */
  static async deleteCampaign(campaignId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId)
      .eq('user_id', user.id)

    if (error) throw new Error(`Erro ao deletar campanha: ${error.message}`)
  }

  /**
   * Adicionar leads únicos à campanha
   */
  static async addLeadsToCampaign(campaignId: string, leads: CampaignLead[]): Promise<void> {
    if (leads.length === 0) return

    // Preparar dados para inserção
    const leadsToInsert = leads.map(lead => ({
      campaign_id: campaignId,
      list_id: lead.listId,
      lead_name: lead.name,
      lead_phone: lead.phone,
      lead_email: lead.email || '',
      lead_company: lead.company || '',
      lead_position: lead.position || '',
      phone_hash: lead.phoneHash
    }))

    const { error } = await supabase
      .from('campaign_unique_leads')
      .upsert(leadsToInsert, {
        onConflict: 'campaign_id,phone_hash',
        ignoreDuplicates: false
      })

    if (error) throw new Error(`Erro ao adicionar leads: ${error.message}`)
  }

  /**
   * Remover leads da campanha
   */
  static async removeLeadsFromCampaign(campaignId: string, phoneHashes: string[]): Promise<void> {
    if (phoneHashes.length === 0) return

    const { error } = await supabase
      .from('campaign_unique_leads')
      .delete()
      .eq('campaign_id', campaignId)
      .in('phone_hash', phoneHashes)

    if (error) throw new Error(`Erro ao remover leads: ${error.message}`)
  }

  /**
   * Buscar leads únicos da campanha
   */
  static async getCampaignLeads(campaignId: string): Promise<CampaignLead[]> {
    console.log('🔍 CampaignService.getCampaignLeads - Buscando leads para campanha:', campaignId)
    
    const { data, error } = await supabase
      .from('campaign_unique_leads')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(`Erro ao buscar leads: ${error.message}`)

    console.log('📊 CampaignService.getCampaignLeads - Dados brutos:', data)

    const result = (data || []).map(lead => ({
      id: lead.id,
      listId: lead.list_id,
      name: lead.lead_name,
      phone: lead.lead_phone,
      email: lead.lead_email,
      company: lead.lead_company,
      position: lead.lead_position,
      phoneHash: lead.phone_hash
    }))

    console.log('✅ CampaignService.getCampaignLeads - Resultado:', result.length, 'leads')

    return result
  }

  /**
   * Gerenciar listas da campanha
   */
  static async updateCampaignLists(campaignId: string, selectedLists: string[], ignoredLists: string[]): Promise<void> {
    // Remover todas as listas existentes
    await supabase
      .from('campaign_lists')
      .delete()
      .eq('campaign_id', campaignId)

    // Inserir listas selecionadas
    if (selectedLists.length > 0) {
      const selectedData = selectedLists.map(listId => ({
        campaign_id: campaignId,
        list_id: listId,
        status: 'selected'
      }))

      await supabase
        .from('campaign_lists')
        .insert(selectedData)
    }

    // Inserir listas ignoradas
    if (ignoredLists.length > 0) {
      const ignoredData = ignoredLists.map(listId => ({
        campaign_id: campaignId,
        list_id: listId,
        status: 'ignored'
      }))

      await supabase
        .from('campaign_lists')
        .insert(ignoredData)
    }
  }

  /**
   * Buscar listas da campanha
   */
  static async getCampaignLists(campaignId: string): Promise<{ selected: string[], ignored: string[] }> {
    console.log('🔍 CampaignService.getCampaignLists - Buscando listas para campanha:', campaignId)
    
    const { data, error } = await supabase
      .from('campaign_lists')
      .select('list_id, status')
      .eq('campaign_id', campaignId)

    if (error) throw new Error(`Erro ao buscar listas: ${error.message}`)

    console.log('📊 CampaignService.getCampaignLists - Dados brutos:', data)

    const selected: string[] = []
    const ignored: string[] = []

    data?.forEach(item => {
      if (item.status === 'selected') {
        selected.push(item.list_id)
      } else if (item.status === 'ignored') {
        ignored.push(item.list_id)
      }
    })

    console.log('✅ CampaignService.getCampaignLists - Resultado:', { selected, ignored })

    return { selected, ignored }
  }

  /**
   * Atualizar contadores manualmente
   */
  static async updateCounters(campaignId: string): Promise<void> {
    const { error } = await supabase.rpc('update_campaign_counters', {
      campaign_uuid: campaignId
    })

    if (error) throw new Error(`Erro ao atualizar contadores: ${error.message}`)
  }
}
