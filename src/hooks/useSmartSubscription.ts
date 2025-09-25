import { useState, useEffect, useCallback, useRef } from 'react';
import { useSubscription } from './useSubscription';
import { supabase } from '../lib/supabaseClient';

interface SubscriptionCache {
  leads_balance: number;
  lastUpdated: number;
}

export const useSmartSubscription = () => {
  const { subscription, refetch, isLoading, error } = useSubscription();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const cacheRef = useRef<SubscriptionCache | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Função para verificar se houve mudanças significativas
  const hasSignificantChanges = useCallback((newData: any, cached: SubscriptionCache | null) => {
    if (!cached || !newData) return true;

    return (
      newData.leads_balance !== cached.leads_balance
    );
  }, []);

  // Função para atualizar com animação
  const updateWithAnimation = useCallback(async () => {
    if (isUpdating) return; // Evitar múltiplas atualizações simultâneas

    setIsUpdating(true);

    await refetch();
    setLastUpdate(new Date());

    // Remover indicador de atualização após 2 segundos
    setTimeout(() => {
      setIsUpdating(false);
    }, 2000);
  }, [refetch, isUpdating]);

  // Função para polling inteligente (apenas quando necessário)
  const startSmartPolling = useCallback(() => {
    if (pollIntervalRef.current) return; // Já está fazendo polling
    pollIntervalRef.current = setInterval(async () => {
      if (!subscription?.id) return;

      try {
        // Buscar apenas os dados essenciais
        const { data, error } = await supabase
          .from('user_payment_subscriptions')
          .select('leads_balance, updated_at')
          .eq('id', subscription.id)
          .single();

        if (error) {

          return;
        }

        // Verificar se houve mudanças significativas
        if (hasSignificantChanges(data, cacheRef.current)) {

          cacheRef.current = {
            leads_balance: data.leads_balance,
            lastUpdated: Date.now()
          };
          await updateWithAnimation();
        }
      } catch (err) {

      }
    }, 3000); // Polling a cada 3 segundos
  }, [subscription?.id, hasSignificantChanges, updateWithAnimation]);

  // Função para parar o polling
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {

      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Configurar Realtime para mudanças críticas
  useEffect(() => {
    if (!subscription?.id) return;
    // Channel para mudanças na assinatura
    const subscriptionChannel = supabase
      .channel(`subscription-${subscription.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_payment_subscriptions',
          filter: `id=eq.${subscription.id}`
        },
        async (payload) => {

          // Verificar se é uma mudança significativa
          const newData = payload.new;
          if (hasSignificantChanges(newData, cacheRef.current)) {
            cacheRef.current = {
              leads_balance: newData.leads_balance,
              lastUpdated: Date.now()
            };
            await updateWithAnimation();
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Status do Realtime (Assinatura):', status);
        setIsConnected(status === 'SUBSCRIBED');

        // Se Realtime não funcionar, usar polling como fallback
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {

          startSmartPolling();
        } else if (status === 'SUBSCRIBED') {

          stopPolling(); // Parar polling se Realtime funcionar
        }
      });

    // Channel para mudanças no histórico de leads
    const historyChannel = supabase
      .channel(`leads-history-${subscription.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads_usage_history',
          filter: `subscription_id=eq.${subscription.id}`
        },
        async (_payload) => {

          await updateWithAnimation();
        }
      )
      .subscribe();

    return () => {

      supabase.removeChannel(subscriptionChannel);
      supabase.removeChannel(historyChannel);
      stopPolling();
    };
  }, [subscription?.id, hasSignificantChanges, updateWithAnimation, startSmartPolling, stopPolling]);

  // Inicializar cache quando subscription carregar
  useEffect(() => {
    if (subscription) {
      cacheRef.current = {
        leads_balance: subscription.leads_remaining, // Usar leads_remaining da subscription
        lastUpdated: Date.now()
      };
    }
  }, [subscription]);

  // Escutar evento customizado de atualização de leads
  useEffect(() => {
    const handleLeadsUpdated = (_event: CustomEvent) => {

      updateWithAnimation();
    };

    window.addEventListener('leadsUpdated', handleLeadsUpdated as EventListener);

    return () => {
      window.removeEventListener('leadsUpdated', handleLeadsUpdated as EventListener);
    };
  }, [updateWithAnimation]);

  // Função para forçar atualização manual
  const forceUpdate = useCallback(async () => {

    await updateWithAnimation();
  }, [updateWithAnimation]);

  return {
    subscription,
    isLoading,
    error,
    refetch: forceUpdate,
    lastUpdate,
    isUpdating,
    isConnected
  };
};
