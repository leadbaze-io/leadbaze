import { supabase } from '../lib/supabaseClient';
import type { LeadsAvailabilityResponse, ConsumeLeadsResponse } from '../types/subscription';

export class LeadsControlService {
  /**
   * Verifica se o usuário pode gerar leads
   */
  static async checkLeadsAvailability(leadsToGenerate: number = 1): Promise<LeadsAvailabilityResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          can_generate: false,
          reason: 'no_active_subscription',
          message: 'Usuário não autenticado',
          leads_remaining: 0,
          leads_limit: 0
        };
      }


      // Buscar assinatura atual diretamente da API (com timestamp anti-cache)
      const response = await fetch(`/api/perfect-pay/subscription/${user.id}?t=${Date.now()}`);
      const data = await response.json();

      if (data.success && data.data) {
        // Verificar se o acesso não expirou
        const accessUntil = new Date(data.data.access_until);
        const now = new Date();
        const isAccessExpired = now > accessUntil;


        // Se o acesso não expirou e tem leads suficientes
        if (!isAccessExpired && data.data.leads_remaining >= leadsToGenerate) {
          return {
            can_generate: true,
            reason: 'sufficient_subscription_leads',
            message: 'Leads da assinatura suficientes disponíveis',
            leads_remaining: data.data.leads_remaining,
            leads_limit: data.data.leads_limit
          };
        }

        // Se o acesso expirou, não usar leads da assinatura
        if (isAccessExpired) {
        }
      }

      // Se não tem assinatura ou não tem leads suficientes, verificar leads bônus
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('bonus_leads, bonus_leads_used')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil do usuário:', profileError);
        return {
          can_generate: false,
          reason: 'no_active_subscription',
          message: 'Erro ao verificar perfil do usuário',
          leads_remaining: 0,
          leads_limit: 0
        };
      }

      const bonusLeadsRemaining = (profile.bonus_leads || 0) - (profile.bonus_leads_used || 0);


      if (bonusLeadsRemaining >= leadsToGenerate) {
        return {
          can_generate: true,
          reason: 'sufficient_bonus_leads',
          message: 'Leads bônus suficientes disponíveis',
          leads_remaining: bonusLeadsRemaining,
          leads_limit: profile.bonus_leads || 0
        };
      }


      return {
        can_generate: false,
        reason: 'insufficient_leads',
        message: 'Leads insuficientes',
        leads_remaining: bonusLeadsRemaining,
        leads_limit: profile.bonus_leads || 0
      };
    } catch (error) {
      console.error('Erro inesperado ao verificar leads:', error);
      return {
        can_generate: false,
        reason: 'no_active_subscription',
        message: 'Erro inesperado ao verificar leads',
        leads_remaining: 0,
        leads_limit: 0
      };
    }
  }

  /**
   * Consome leads do saldo do usuário
   */
  static async consumeLeads(leadsToConsume: number, _reason: string = 'lead_generation'): Promise<ConsumeLeadsResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'no_auth',
          message: 'Usuário não autenticado'
        };
      }


      // Primeiro, tentar consumir leads da assinatura (se existir)
      const response = await fetch(`/api/perfect-pay/subscription/${user.id}?t=${Date.now()}`);
      const data = await response.json();

      if (data.success && data.data) {
        const subscription = data.data;

        // Verificar se o acesso não expirou
        const accessUntil = new Date(subscription.access_until);
        const now = new Date();
        const isAccessExpired = now > accessUntil;

        // Se o acesso não expirou e tem leads suficientes, consumir da assinatura
        if (!isAccessExpired && subscription.leads_remaining >= leadsToConsume) {

          // Atualizar leads_balance diretamente
          const { data: updateResult, error: updateError } = await supabase
            .from('user_payment_subscriptions')
            .update({
              leads_balance: subscription.leads_remaining - leadsToConsume,
              updated_at: new Date().toISOString()
            })
            .eq('id', subscription.id)
            .select()
            .single();

          if (updateError) {
            console.error('Erro ao atualizar leads da assinatura:', updateError);
            // Se falhar, tentar consumir bonus leads
          } else {

            // Registrar histórico de uso
            await supabase.from('leads_usage_history').insert({
              user_id: user.id,
              leads_generated: -leadsToConsume, // Negativo para consumo
              remaining_leads: updateResult.leads_balance,
              operation_reason: _reason || 'Consumo de Leads (Assinatura)',
              operation_type: 'generated'
            });

            return {
              success: true,
              leads_consumed: leadsToConsume,
              leads_remaining: updateResult.leads_balance,
              leads_limit: subscription.leads_limit,
              message: `${leadsToConsume} leads da assinatura consumidos com sucesso`
            };
          }
        }
      }

      // Se não conseguiu consumir da assinatura, tentar consumir bonus leads

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('bonus_leads, bonus_leads_used')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil do usuário:', profileError);
        return {
          success: false,
          error: 'profile_error',
          message: 'Erro ao verificar perfil do usuário'
        };
      }

      const bonusLeadsRemaining = (profile.bonus_leads || 0) - (profile.bonus_leads_used || 0);

      if (bonusLeadsRemaining < leadsToConsume) {
        return {
          success: false,
          error: 'insufficient_bonus_leads',
          message: 'Leads bônus insuficientes para consumir',
          leads_remaining: bonusLeadsRemaining,
          leads_limit: profile.bonus_leads || 0
        };
      }

      // Atualizar bonus leads usados
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          bonus_leads_used: (profile.bonus_leads_used || 0) + leadsToConsume,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Erro ao atualizar bonus leads:', updateError);
        return {
          success: false,
          error: 'update_error',
          message: 'Erro ao atualizar leads bônus'
        };
      }

      // Registrar histórico de uso para bônus
      await supabase.from('leads_usage_history').insert({
        user_id: user.id,
        leads_generated: -leadsToConsume, // Negativo para consumo
        remaining_leads: bonusLeadsRemaining - leadsToConsume,
        operation_reason: _reason || 'Consumo de Leads (Bônus)',
        operation_type: 'generated'
      });

      return {
        success: true,
        leads_consumed: leadsToConsume,
        leads_remaining: bonusLeadsRemaining - leadsToConsume,
        leads_limit: profile.bonus_leads || 0,
        message: `${leadsToConsume} leads bônus consumidos com sucesso`
      };

    } catch (error) {
      console.error('Erro inesperado ao consumir leads:', error);
      return {
        success: false,
        error: 'unexpected_error',
        message: 'Erro inesperado ao processar leads'
      };
    }
  }

  /**
   * Obtém o status completo da assinatura do usuário
   */
  static async getSubscriptionStatus() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          has_subscription: false,
          message: 'Usuário não autenticado'
        };
      }

      const { data, error } = await supabase.rpc('get_user_subscription_status_new_system', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Erro ao buscar status da assinatura:', error);
        return {
          has_subscription: false,
          message: 'Erro ao carregar dados da assinatura'
        };
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao buscar assinatura:', error);
      return {
        has_subscription: false,
        message: 'Erro inesperado ao carregar assinatura'
      };
    }
  }

  /**
   * Verifica se o usuário pode executar uma ação que consome leads
   * Retorna true se pode executar, false caso contrário
   */
  static async canExecuteAction(leadsRequired: number = 1): Promise<boolean> {
    const availability = await this.checkLeadsAvailability(leadsRequired);
    return availability.can_generate;
  }

  /**
   * Executa uma ação que consome leads, verificando disponibilidade primeiro
   * Retorna o resultado da ação e se os leads foram consumidos
   */
  static async executeWithLeadsConsumption<T>(
    action: () => Promise<T>,
    leadsRequired: number = 1,
    reason: string = 'lead_generation'
  ): Promise<{
    success: boolean;
    result?: T;
    leadsConsumed: boolean;
    error?: string;
  }> {
    try {
      // Verificar disponibilidade primeiro
      const availability = await this.checkLeadsAvailability(leadsRequired);
      if (!availability.can_generate) {
        return {
          success: false,
          leadsConsumed: false,
          error: availability.message
        };
      }

      // Executar a ação
      const result = await action();

      // Consumir leads após sucesso da ação
      const consumeResult = await this.consumeLeads(leadsRequired, reason);
      if (!consumeResult.success) {
        console.warn('Ação executada mas leads não foram consumidos:', consumeResult.message);
        return {
          success: true,
          result,
          leadsConsumed: false,
          error: 'Leads não foram consumidos corretamente'
        };
      }

      return {
        success: true,
        result,
        leadsConsumed: true
      };
    } catch (error) {
      console.error('Erro ao executar ação com consumo de leads:', error);
      return {
        success: false,
        leadsConsumed: false,
        error: 'Erro inesperado ao executar ação'
      };
    }
  }

  /**
   * Obtém estatísticas de uso do usuário
   */
  static async getUsageStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return null;
      }

      // Buscar assinatura ativa
      const subscriptionStatus = await this.getSubscriptionStatus();
      if (!subscriptionStatus.has_subscription) {
        return null;
      }

      // Buscar histórico de uso
      const { data: usageHistory, error } = await supabase
        .from('leads_usage_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Erro ao buscar histórico de uso:', error);
        return null;
      }

      return {
        subscription: subscriptionStatus,
        usageHistory: usageHistory || []
      };
    } catch (error) {
      console.error('Erro inesperado ao buscar estatísticas:', error);
      return null;
    }
  }

  /**
   * Adiciona leads bonus ao usuário (para promoções, etc.)
   */
  static async addBonusLeads(leadsAmount: number, reason: string = 'bonus'): Promise<ConsumeLeadsResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'no_auth',
          message: 'Usuário não autenticado'
        };
      }

      // Buscar assinatura ativa
      const subscriptionStatus = await this.getSubscriptionStatus();
      if (!subscriptionStatus.has_subscription) {
        return {
          success: false,
          error: 'no_subscription',
          message: 'Usuário não possui assinatura ativa'
        };
      }

      // Adicionar leads (usando valor negativo para "adicionar")
      const { data, error } = await supabase.rpc('consume_leads', {
        p_user_id: user.id,
        p_leads_consumed: -leadsAmount, // Negativo para adicionar
        p_operation_reason: reason
      });

      if (error) {
        console.error('Erro ao adicionar leads bonus:', error);
        return {
          success: false,
          error: 'bonus_error',
          message: 'Erro ao processar leads bonus'
        };
      }

      return {
        success: true,
        message: `${leadsAmount} leads adicionados com sucesso`,
        leads_consumed: leadsAmount,
        leads_remaining: data.leads_remaining
      };
    } catch (error) {
      console.error('Erro inesperado ao adicionar leads bonus:', error);
      return {
        success: false,
        error: 'unexpected_error',
        message: 'Erro inesperado ao processar leads bonus'
      };
    }
  }
}
