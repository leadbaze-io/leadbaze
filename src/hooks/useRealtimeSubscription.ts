import { useState, useEffect, useCallback } from 'react';
import { useSubscription } from './useSubscription';
import { supabase } from '../lib/supabaseClient';

export const useRealtimeSubscription = () => {
  const { subscription, refetch, isLoading, error } = useSubscription();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Função para forçar atualização
  const forceUpdate = useCallback(async () => {
    console.log('🔄 Forçando atualização da assinatura...');
    await refetch();
    setLastUpdate(new Date());
  }, [refetch]);

  // Listener para mudanças na tabela user_subscriptions
  useEffect(() => {
    if (!subscription?.id) return;

    console.log('🔔 Configurando listener para assinatura:', subscription.id);

    const channel = supabase
      .channel(`subscription-${subscription.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_subscriptions',
          filter: `id=eq.${subscription.id}`
        },
        (payload) => {
          console.log('📡 Mudança detectada na assinatura:', payload);
          // Atualizar após um pequeno delay para garantir que o banco foi atualizado
          setTimeout(() => {
            refetch();
          }, 500);
        }
      )
      .subscribe();

    return () => {
      console.log('🔇 Removendo listener da assinatura');
      supabase.removeChannel(channel);
    };
  }, [subscription?.id, refetch]);

  // Listener para mudanças na tabela leads_usage_history
  useEffect(() => {
    if (!subscription?.id) return;

    console.log('🔔 Configurando listener para histórico de leads:', subscription.id);

    const channel = supabase
      .channel(`leads-history-${subscription.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads_usage_history',
          filter: `subscription_id=eq.${subscription.id}`
        },
        (payload) => {
          console.log('📡 Nova entrada no histórico de leads:', payload);
          // Atualizar após um pequeno delay
          setTimeout(() => {
            refetch();
          }, 500);
        }
      )
      .subscribe();

    return () => {
      console.log('🔇 Removendo listener do histórico de leads');
      supabase.removeChannel(channel);
    };
  }, [subscription?.id, refetch]);

  return {
    subscription,
    isLoading,
    error,
    refetch: forceUpdate,
    lastUpdate
  };
};


