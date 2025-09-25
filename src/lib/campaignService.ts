import { supabase } from './supabaseClient'
import type { BulkCampaign } from '../types'

export class CampaignService {
  /**
   * Carrega todas as campanhas do usuário
   */
  static async getUserCampaigns(): Promise<BulkCampaign[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {

      return []
    }
  }

  /**
   * Cria uma nova campanha
   */
  static async createCampaign(campaign: Omit<BulkCampaign, 'id' | 'created_at' | 'updated_at'>): Promise<BulkCampaign | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const newCampaign = {
        ...campaign,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('campaigns')
        .insert([newCampaign])
        .select()
        .single()

      if (error) {

        throw new Error(`Erro ao criar campanha: ${error.message}`)
      }
      return data
    } catch (error) {

      throw error
    }
  }

  /**
   * Atualiza uma campanha existente
   */
  static async updateCampaign(campaignId: string, updates: Partial<BulkCampaign>): Promise<BulkCampaign | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      // Log de debug removido

      // Usar uma abordagem mais segura para evitar conflitos com triggers
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      }
      const { data, error } = await supabase
        .from('campaigns')
        .update(updateData)
        .eq('id', campaignId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {

        throw error
      }

      // Campanha atualizada no banco

      return data
    } catch (error) {

      return null
    }
  }

  /**
   * Deleta uma campanha
   */
  static async deleteCampaign(campaignId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId)
        .eq('user_id', user.id)

      if (error) throw error
      return true
    } catch (error) {

      return false
    }
  }

  /**
   * Busca uma campanha específica
   */
  static async getCampaign(campaignId: string): Promise<BulkCampaign | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      // Log de debug removido

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .eq('user_id', user.id)
        .single()

      if (error) {

        throw error
      }

      // Log removido para limpeza

      return data
    } catch (error) {

      return null
    }
  }

  /**
   * Obter leads de uma campanha
   */
  static async getCampaignLeads(campaignId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('campaign_unique_leads')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(`Erro ao buscar leads: ${error.message}`)

    return (data || []).map(lead => ({
      id: lead.id,
      listId: lead.list_id,
      name: lead.lead_name,
      phone: lead.lead_phone,
      email: lead.lead_email,
      company: lead.lead_company,
      position: lead.lead_position,
      phoneHash: lead.phone_hash
    }))
  }

  /**
   * Obter listas de uma campanha
   */
  static async getCampaignLists(campaignId: string): Promise<{ selected: string[], ignored: string[] }> {
    const { data, error } = await supabase
      .from('campaign_lists')
      .select('list_id, status')
      .eq('campaign_id', campaignId)

    if (error) throw new Error(`Erro ao buscar listas: ${error.message}`)

    const selected = (data || []).filter(item => item.status === 'selected').map(item => item.list_id)
    const ignored = (data || []).filter(item => item.status === 'ignored').map(item => item.list_id)

    return { selected, ignored }
  }

  /**
   * Atualizar listas de uma campanha
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
   * Adicionar leads à campanha na tabela campaign_unique_leads
   */
  static async addLeadsToCampaign(campaignId: string, leads: any[]): Promise<void> {
    if (leads.length === 0) return

    try {
      const leadsData = leads.map(lead => ({
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
        .upsert(leadsData, {

          onConflict: 'campaign_id,phone_hash',
          ignoreDuplicates: false

        })

      if (error) {
        throw new Error(`Erro ao adicionar leads: ${error.message}`)
      }
    } catch (error) {

      throw error
    }
  }

  /**
   * Remover leads da campanha na tabela campaign_unique_leads
   */
  static async removeLeadsFromCampaign(campaignId: string, phoneHashes: string[]): Promise<void> {
    if (phoneHashes.length === 0) return

    try {
      const { error } = await supabase
        .from('campaign_unique_leads')
        .delete()
        .eq('campaign_id', campaignId)
        .in('phone_hash', phoneHashes)

      if (error) {
        throw new Error(`Erro ao remover leads: ${error.message}`)
      }
    } catch (error) {

      throw error
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

      // Gerar hash do telefone (mesmo método usado no LeadDeduplicationService)
      let hash = 0
      for (let i = 0; i < normalizedPhone.length; i++) {
        const char = normalizedPhone.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
      }
      const phoneHash = Math.abs(hash).toString(36)

      const { data, error } = await supabase
        .from('campaign_unique_leads')
        .select(`
          campaign_id,
          lead_name,
          lead_phone,
          lead_company,
          created_at,
          campaigns!inner(name),
          lead_lists!inner(name)
        `)
        .eq('phone_hash', phoneHash)
        .order('created_at', { ascending: false })

      if (error) throw error

      const campaigns = data?.map(item => ({
        campaign_id: item.campaign_id,
        campaign_name: Array.isArray(item.campaigns)

          ? (item.campaigns[0] as { name: string })?.name || 'Campanha desconhecida'
          : (item.campaigns as { name: string })?.name || 'Campanha desconhecida',
        list_name: Array.isArray(item.lead_lists)
          ? (item.lead_lists[0] as { name: string })?.name || 'Lista desconhecida'
          : (item.lead_lists as { name: string })?.name || 'Lista desconhecida',
        lead_name: item.lead_name || 'Lead sem nome',
        lead_phone: item.lead_phone || phone,
        lead_address: item.lead_company || 'Endereço não disponível',
        added_at: item.created_at
      })) || []

      return {
        exists: campaigns.length > 0,
        totalOccurrences: campaigns.length,
        campaigns
      }
    } catch (error) {

      return { exists: false, totalOccurrences: 0, campaigns: [] }
    }
  }
}
