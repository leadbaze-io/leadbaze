import { useState, useEffect, useCallback } from 'react';

import { useSubscription } from './useSubscription';

import { supabase } from '../lib/supabaseClient';

export const useRealtimeSubscription = () => {

  const { subscription, refetch, isLoading, error } = useSubscription();

  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Função para forçar atualização

  const forceUpdate = useCallback(async () => {

    await refetch();

    setLastUpdate(new Date());

  }, [refetch]);

  // Listener para mudanças na tabela user_payment_subscriptions

  useEffect(() => {

    if (!subscription?.id) return;

    const channel = supabase

      .channel(`subscription-${subscription.id}`)

      .on(

        'postgres_changes',

        {

          event: 'UPDATE',

          schema: 'public',

          table: 'user_payment_subscriptions',

          filter: `id=eq.${subscription.id}`

        },

        (_payload) => {

          // Atualizar após um pequeno delay para garantir que o banco foi atualizado

          setTimeout(() => {

            refetch();

          }, 500);

        }

      )

      .subscribe();

    return () => {

      supabase.removeChannel(channel);

    };

  }, [subscription?.id, refetch]);

  // Listener para mudanças na tabela leads_usage_history

  useEffect(() => {

    if (!subscription?.id) return;

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

        (_payload) => {

          // Atualizar após um pequeno delay

          setTimeout(() => {

            refetch();

          }, 500);

        }

      )

      .subscribe();

    return () => {

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
