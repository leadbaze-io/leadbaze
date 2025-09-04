import { supabase } from './supabaseClient'

export interface WhatsAppInstance {
  id: string
  user_id: string
  instance_name: string
  status: 'disconnected' | 'connecting' | 'connected' | 'qrcode'
  whatsapp_number?: string
  last_connection_at?: string
  created_at: string
  updated_at: string
}

export class WhatsAppInstanceService {
  /**
   * Busca a instância ativa do usuário
   */
  static async getUserInstance(userId: string): Promise<WhatsAppInstance | null> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      return data
    } catch (error) {
      console.error('Erro ao buscar instância do usuário:', error)
      return null
    }
  }

  /**
   * Cria uma nova instância para o usuário
   */
  static async createInstance(userId: string, instanceName: string): Promise<WhatsAppInstance> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .insert({
          user_id: userId,
          instance_name: instanceName,
          status: 'qrcode'
        })
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Erro ao criar instância:', error)
      throw error
    }
  }

  /**
   * Atualiza o status da instância
   */
  static async updateInstanceStatus(
    instanceName: string, 
    status: WhatsAppInstance['status'],
    whatsappNumber?: string
  ): Promise<void> {
    try {
      const updateData: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString()
      }

      if (status === 'connected' && whatsappNumber) {
        updateData.whatsapp_number = whatsappNumber
        updateData.last_connection_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('whatsapp_instances')
        .update(updateData)
        .eq('instance_name', instanceName)

      if (error) throw error
    } catch (error) {
      console.error('Erro ao atualizar status da instância:', error)
      throw error
    }
  }

  /**
   * Remove uma instância
   */
  static async deleteInstance(instanceName: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('whatsapp_instances')
        .delete()
        .eq('instance_name', instanceName)

      if (error) throw error
    } catch (error) {
      console.error('Erro ao deletar instância:', error)
      throw error
    }
  }

  /**
   * Verifica se o usuário tem uma instância conectada
   */
  static async hasConnectedInstance(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .select('status')
        .eq('user_id', userId)
        .eq('status', 'connected')
        .limit(1)

      if (error) throw error

      return data && data.length > 0
    } catch (error) {
      console.error('Erro ao verificar instância conectada:', error)
      return false
    }
  }
} 