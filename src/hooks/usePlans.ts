import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { SubscriptionPlan, UsePlansReturn } from '../types/subscription';

export const usePlans = (): UsePlansReturn => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar planos disponíveis
  const fetchPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPlans([]);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'https://leadbaze.io'}/api/subscription/plans?userId=${user.id}`);
      const data = await response.json();

      if (!response.ok) {
        console.error('Erro ao buscar planos:', data.message);
        setError('Erro ao carregar planos disponíveis');
        return;
      }

      setPlans(data.data.availablePlans || []);
    } catch (err) {
      console.error('Erro inesperado ao buscar planos:', err);
      setError('Erro inesperado ao carregar planos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refetch dos dados
  const refetch = useCallback(async () => {
    await fetchPlans();
  }, [fetchPlans]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    isLoading,
    error,
    refetch
  };
};
