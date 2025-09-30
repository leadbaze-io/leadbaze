import { useState, useEffect } from 'react';

import { supabase } from '../lib/supabaseClient';

interface BonusLeadsStatus {

  bonus_leads: number;

  bonus_leads_used: number;

  remaining_bonus: number;

  has_subscription: boolean;

  subscription?: {

    id: string;

    plan_name: string;

    display_name: string;

    price_monthly: number;

    leads_limit: number;

    leads_remaining: number;

    status: string;

  };

  total_available: number;

  total_used: number;

}

export const useBonusLeads = (userId?: string) => {

  const [status, setStatus] = useState<BonusLeadsStatus | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {

    if (!userId) return;

    try {

      setIsLoading(true);

      setError(null);

      const { data, error } = await supabase.rpc('get_user_leads_status', {

        p_user_id: userId

      });

      if (error) {

        throw error;

      }

      if (data.success) {

        setStatus(data);

      } else {

        throw new Error(data.error || 'Erro ao buscar status dos leads');

      }

    } catch (err: any) {

      setError(err.message);

    } finally {

      setIsLoading(false);

    }

  };

  const consumeLead = async (quantity: number = 1) => {

    if (!userId) return false;

    try {

      setIsLoading(true);

      setError(null);

      const { data, error } = await supabase.rpc('consume_lead_simple', {

        p_user_id: userId,

        p_quantity: quantity

      });

      if (error) {

        throw error;

      }

      if (data.success) {

        // Atualizar status após consumir

        await fetchStatus();

        return true;

      } else {

        throw new Error(data.error || 'Erro ao consumir lead');

      }

    } catch (err: any) {

      setError(err.message);

      return false;

    } finally {

      setIsLoading(false);

    }

  };

  const giveBonusLeads = async (userId: string) => {

    try {

      setIsLoading(true);

      setError(null);

      const { data, error } = await supabase.rpc('give_bonus_leads_to_new_user', {

        p_user_id: userId

      });

      if (error) {

        throw error;

      }

      if (data.success) {

        // Atualizar status após dar bônus

        await fetchStatus();

        return true;

      } else {

        throw new Error(data.error || 'Erro ao conceder leads bônus');

      }

    } catch (err: any) {

      setError(err.message);

      return false;

    } finally {

      setIsLoading(false);

    }

  };

  useEffect(() => {

    if (userId) {

      fetchStatus();

    }

  }, [userId]);

  return {

    status,

    isLoading,

    error,

    fetchStatus,

    consumeLead,

    giveBonusLeads

  };

};
