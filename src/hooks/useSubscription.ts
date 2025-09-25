import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { 
  UserSubscription, 
  LeadsAvailabilityResponse, 
  ConsumeLeadsResponse,
  UseSubscriptionReturn 
} from '../types/subscription';

export const useSubscription = (): UseSubscriptionReturn => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados da assinatura do usuário
  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSubscription(null);
        return;
      }

      // Buscar assinatura atual via Perfect Pay
      const response = await fetch(`/api/perfect-pay/subscription/${user.id}`);
      const data = await response.json();

      if (!response.ok) {
        console.error('Erro ao buscar assinatura:', data.message);
        setError('Erro ao carregar dados da assinatura');
        return;
      }

      if (!data.success || !data.data) {
        setSubscription(null);
        return;
      }

      setSubscription(data.data);
    } catch (err) {
      console.error('Erro inesperado ao buscar assinatura:', err);
      setError('Erro inesperado ao carregar assinatura');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verificar disponibilidade de leads
  const checkLeadsAvailability = useCallback(async (leadsToGenerate: number = 1): Promise<LeadsAvailabilityResponse> => {
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

      // Buscar assinatura atual diretamente
      const response = await fetch(`/api/perfect-pay/subscription/${user.id}`);
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

      // Se não temos assinatura ou não tem leads suficientes, verificar leads bônus
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

    } catch (err) {
      console.error('Erro inesperado ao verificar leads:', err);
      return {
        can_generate: false,
        reason: 'no_active_subscription',
        message: 'Erro inesperado ao verificar leads',
        leads_remaining: 0,
        leads_limit: 0
      };
    }
  }, []);

  // Consumir leads
  const consumeLeads = useCallback(async (leadsToConsume: number, _reason: string = 'lead_generation'): Promise<ConsumeLeadsResponse> => {
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
      const response = await fetch(`/api/perfect-pay/subscription/${user.id}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const subscriptionData = data.data;
        
        // Verificar se o acesso não expirou
        const accessUntil = new Date(subscriptionData.access_until);
        const now = new Date();
        const isAccessExpired = now > accessUntil;
        
        // Se o acesso não expirou e tem leads suficientes, consumir da assinatura
        if (!isAccessExpired && subscriptionData.leads_remaining >= leadsToConsume) {

          // Atualizar leads_balance diretamente
          const { data: updateResult, error: updateError } = await supabase
            .from('user_payment_subscriptions')
            .update({
              leads_balance: subscriptionData.leads_remaining - leadsToConsume,
              updated_at: new Date().toISOString()
            })
            .eq('id', subscriptionData.id)
            .select()
            .single();

          if (updateError) {
            console.error('Erro ao atualizar leads da assinatura:', updateError);
            // Se falhar, tentar consumir bonus leads
          } else {
            // Atualizar dados locais da assinatura
            setSubscription(prev => prev ? {
              ...prev,
              leads_used: prev.leads_used + leadsToConsume,
              leads_remaining: updateResult.leads_balance
            } : null);

            return {
              success: true,
              leads_consumed: leadsToConsume,
              leads_remaining: updateResult.leads_balance,
              leads_limit: subscriptionData.leads_limit,
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


      return {
        success: true,
        leads_consumed: leadsToConsume,
        leads_remaining: bonusLeadsRemaining - leadsToConsume,
        leads_limit: profile.bonus_leads || 0,
        message: `${leadsToConsume} leads bônus consumidos com sucesso`
      };

    } catch (err) {
      console.error('Erro inesperado ao consumir leads:', err);
      return {
        success: false,
        error: 'unexpected_error',
        message: 'Erro inesperado ao processar leads'
      };
    }
  }, [subscription]);

  // Refetch dos dados
  const refetch = useCallback(async () => {
    await fetchSubscription();
  }, [fetchSubscription]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    subscription,
    isLoading,
    error,
    refetch,
    checkLeadsAvailability,
    consumeLeads
  };
};
