import { useState, useCallback } from 'react';

interface RecurringSubscriptionData {
  id: string;
  status: string;
  external_reference: string;
  auto_recurring: {
    frequency: number;
    frequency_type: string;
    transaction_amount: number;
    currency_id: string;
    start_date: string;
    end_date: string | null;
    billing_day: number;
  };
  payer: {
    id: string;
    email: string;
  };
  application_fee: number;
  status_detail: string;
  reason: string;
  date_created: string;
  last_modified: string;
  metadata: {
    plan_id: string;
    plan_name: string;
    leads_limit: number;
    user_id: string;
  };
}

interface UseRecurringSubscriptionReturn {
  createSubscription: (data: {
    userId: string;
    planId: string;
    userEmail: string;
  }) => Promise<{ success: boolean; data?: any; error?: string }>;
  
  getSubscription: (subscriptionId: string) => Promise<{ success: boolean; data?: RecurringSubscriptionData; error?: string }>;
  
  cancelSubscription: (subscriptionId: string, userId: string, reason?: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  
  reactivateSubscription: (subscriptionId: string, userId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  
  
  isLoading: boolean;
  error: string | null;
}

export const useRecurringSubscription = (): UseRecurringSubscriptionReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSubscription = useCallback(async (data: {
    userId: string;
    planId: string;
    userEmail: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'https://leadbaze.io'}/api/recurring-subscription/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.message || 'Erro ao criar assinatura' };
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar assinatura';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSubscription = useCallback(async (subscriptionId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'https://leadbaze.io'}/api/recurring-subscription/${subscriptionId}`);

      const result = await response.json();

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.message || 'Erro ao buscar assinatura' };
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao buscar assinatura';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelSubscription = useCallback(async (subscriptionId: string, userId: string, reason?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'https://leadbaze.io'}/api/recurring-subscription/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          reason: reason || 'Solicitado pelo usuário'
        }),
      });

      const result = await response.json();

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.message || 'Erro ao cancelar assinatura' };
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao cancelar assinatura';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reactivateSubscription = useCallback(async (subscriptionId: string, userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'https://leadbaze.io'}/api/recurring-subscription/${subscriptionId}/reactivate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.message || 'Erro ao reativar assinatura' };
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao reativar assinatura';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);


  return {
    createSubscription,
    getSubscription,
    cancelSubscription,
    reactivateSubscription,
    isLoading,
    error
  };
};

