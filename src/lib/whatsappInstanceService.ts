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

      if (error) {
        console.error('Erro ao buscar instância do usuário:', error)
        return null
      }

      // Se a instância está marcada como "connected", manter como connected
      // A conexão permanece ativa até o usuário desconectar manualmente
      // Não há timeout automático

      return data && data.length > 0 ? data[0] : null
    } catch (error) {
      console.error('Erro inesperado ao buscar instância:', error)
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

      if (status === 'connected') {
        // Para marcar como connected, sempre definir last_connection_at
        updateData.last_connection_at = new Date().toISOString()

        // Se whatsappNumber foi fornecido, salvar também
        if (whatsappNumber) {
          updateData.whatsapp_number = whatsappNumber
        }
      } else if (status === 'disconnected') {
        // Quando desconectar, limpar dados de conexão
        updateData.whatsapp_number = null
        updateData.last_connection_at = null
      }

      const { error } = await supabase
        .from('whatsapp_instances')
        .update(updateData)
        .eq('instance_name', instanceName)

      if (error) throw error
    } catch (error) {

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

      return false
    }
  }
}
