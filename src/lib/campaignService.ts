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
        .from('bulk_campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error)
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('bulk_campaigns')
        .insert([newCampaign])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao criar campanha:', error)
      return null
    }
  }

  /**
   * Atualiza uma campanha existente
   */
  static async updateCampaign(campaignId: string, updates: Partial<BulkCampaign>): Promise<BulkCampaign | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('bulk_campaigns')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao atualizar campanha:', error)
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
        .from('bulk_campaigns')
        .delete()
        .eq('id', campaignId)
        .eq('user_id', user.id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erro ao deletar campanha:', error)
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

      const { data, error } = await supabase
        .from('bulk_campaigns')
        .select('*')
        .eq('id', campaignId)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao buscar campanha:', error)
      return null
    }
  }
} 