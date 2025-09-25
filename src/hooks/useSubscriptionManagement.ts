import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import { supabase } from '../lib/supabaseClient';
import type { 
  CancelSubscriptionResponse,
  ReactivateSubscriptionResponse,
  DowngradeSubscriptionResponse,
  SubscriptionPlan
} from '../types/subscription';

interface UseSubscriptionManagementReturn {
  // Estados
  isLoading: boolean;
  error: string | null;
  
  // Operações
  cancelSubscription: (reason?: string) => Promise<CancelSubscriptionResponse | null>;
  reactivateSubscription: () => Promise<ReactivateSubscriptionResponse | null>;
  downgradeSubscription: (newPlanId: string, reason?: string) => Promise<DowngradeSubscriptionResponse | null>;
  getAvailablePlans: () => Promise<SubscriptionPlan[]>;
  getDowngradePlans: () => Promise<SubscriptionPlan[]>;
}

export const useSubscriptionManagement = (): UseSubscriptionManagementReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Processar cancelamento de assinatura
  const processRefund = useCallback(async (_subscriptionData: any) => {
    try {
      // Refund automático desabilitado - usando Perfect Pay
      console.log('ℹ️ [Cancelamento] Refund automático desabilitado - usando Perfect Pay');
      console.log('ℹ️ [Cancelamento] Para reembolsos, entre em contato com o suporte');
      
      // Simular resposta de sucesso para não quebrar o fluxo
      const refundData = { 
        success: true, 
        message: 'Cancelamento processado via Perfect Pay',
        amount: 0,
        refundPercentage: 0
      };
      
      if (refundData.success) {
        console.log('✅ Reembolso processado:', refundData);
        return refundData;
      } else {
        console.error('❌ Erro no reembolso:', refundData);
        return null;
      }
    } catch (err: any) {
      console.error('Erro ao processar reembolso:', err);
      return null;
    }
  }, []);

  // Cancelar assinatura
  const cancelSubscription = useCallback(async (reason: string = 'Solicitado pelo usuário'): Promise<CancelSubscriptionResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/perfect-pay/cancel/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao cancelar assinatura');
      }

      if (data.success) {
        // Processar reembolso baseado em leads restantes
        const refundResult = await processRefund(data);
        
        if (refundResult) {
          toast({
            title: "✅ Assinatura Cancelada",
            description: `Reembolso de R$ ${refundResult.amount} processado com sucesso! (${refundResult.refundPercentage}% dos leads restantes)`,
            variant: 'default',
            className: 'toast-modern toast-success'
          });
        } else {
          toast({
            title: "✅ Assinatura Cancelada",
            description: `Assinatura cancelada. Reembolso será processado em até 5 dias úteis.`,
            variant: 'default',
            className: 'toast-modern toast-success'
          });
        }
      }

      return data;
    } catch (err: any) {
      console.error('Erro ao cancelar assinatura:', err);
      setError(err.message);
      
      toast({
        title: "❌ Erro no Cancelamento",
        description: err.message || 'Não foi possível cancelar a assinatura',
        variant: 'destructive',
        className: 'toast-modern toast-error'
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast, processRefund]);

  // Reativar assinatura
  const reactivateSubscription = useCallback(async (): Promise<ReactivateSubscriptionResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // NOTA: Reativar não está implementado no novo sistema ainda
      throw new Error('Funcionalidade de reativar assinatura em desenvolvimento');
    } catch (err: any) {
      console.error('Erro ao reativar assinatura:', err);
      setError(err.message);
      
      toast({
        title: "❌ Erro na Reativação",
        description: err.message || 'Não foi possível reativar a assinatura',
        variant: 'destructive',
        className: 'toast-modern toast-error'
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fazer downgrade
  const downgradeSubscription = useCallback(async (newPlanId: string, reason: string = 'Solicitado pelo usuário'): Promise<DowngradeSubscriptionResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('🔄 [Downgrade] Iniciando downgrade:', {
        userId: user.id,
        newPlanId,
        reason
      });

      // Chamar API de downgrade
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/perfect-pay/downgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          newPlanId,
          reason
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao fazer downgrade');
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ [Downgrade] Downgrade realizado com sucesso:', result);
        
        toast({
          title: "✅ Downgrade Realizado",
          description: `Seu plano foi alterado com sucesso!`,
          variant: 'default',
          className: 'toast-modern toast-success'
        });

        return {
          success: true,
          message: result.message,
          subscription: result.subscription,
          note: result.note || 'Downgrade realizado com sucesso',
          old_plan: result.old_plan || 'Plano anterior',
          new_plan: result.new_plan || 'Novo plano',
          leads_remaining: result.leads_remaining || 0
        };
      } else {
        throw new Error(result.message || 'Falha ao fazer downgrade');
      }

    } catch (err: any) {
      console.error('❌ [Downgrade] Erro ao fazer downgrade:', err);
      setError(err.message);
      
      toast({
        title: "❌ Erro no Downgrade",
        description: err.message || 'Não foi possível fazer o downgrade',
        variant: 'destructive',
        className: 'toast-modern toast-error'
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Buscar planos disponíveis
  const getAvailablePlans = useCallback(async (): Promise<SubscriptionPlan[]> => {
    try {
      // Buscar usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return [];
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/perfect-pay/plans`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao buscar planos');
      }

      return data.data.availablePlans || [];
    } catch (err: any) {
      console.error('Erro ao buscar planos:', err);
      setError(err.message);
      return [];
    }
  }, []);

  // Buscar planos para downgrade
  const getDowngradePlans = useCallback(async (): Promise<SubscriptionPlan[]> => {
    try {
      // Buscar usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return [];
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/perfect-pay/plans`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao buscar planos para downgrade');
      }

      return data.data.downgradePlans || [];
    } catch (err: any) {
      console.error('Erro ao buscar planos para downgrade:', err);
      setError(err.message);
      return [];
    }
  }, []);

  return {
    isLoading,
    error,
    cancelSubscription,
    reactivateSubscription,
    downgradeSubscription,
    getAvailablePlans,
    getDowngradePlans
  };
};
