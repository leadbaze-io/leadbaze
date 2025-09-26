import { useState, useCallback } from 'react';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../lib/supabaseClient';

interface UpgradeResponse {
  success: boolean;
  message: string;
  checkout_url: string;
  external_reference: string;
  plan_name: string;
  amount: number;
  price_difference: number;
}

export const useUpgradeManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fazer upgrade
  const upgradeSubscription = useCallback(async (
    newPlanId: string, 
    _reason: string = 'Solicitado pelo usuário'
  ): Promise<UpgradeResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'https://leadbaze.io'}/api/perfect-pay/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          newPlanId,
          reason: 'Upgrade solicitado pelo usuário'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer upgrade');
      }

      if (data.success && data.checkout_url) {
        // Redirecionar para o checkout do Perfect Pay
        window.location.href = data.checkout_url;
        return data;
      }

      return data;
    } catch (err: any) {
      console.error('Erro ao fazer upgrade:', err);
      setError(err.message);
      
      toast({
        title: "❌ Erro no Upgrade",
        description: err.message || 'Não foi possível fazer o upgrade',
        variant: 'destructive',
        className: 'toast-modern toast-error'
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    upgradeSubscription,
    isLoading,
    error
  };
};
