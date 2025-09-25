import React, { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { useUpgradeManagement } from '../hooks/useUpgradeManagement';
import { supabase } from '../lib/supabaseClient';

interface RecurringSubscriptionButtonProps {
  planId: string;
  planName: string;
  amount: number;
  leadsLimit: number;
  userId: string;
  userEmail: string;
  onSuccess?: (subscriptionData: any) => void;
  onError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
}

const RecurringSubscriptionButton: React.FC<RecurringSubscriptionButtonProps> = ({
  planId,
  planName,
  amount,
  leadsLimit,
  userId: _userId,
  userEmail: _userEmail,
  onSuccess,
  onError,
  className = '',
  children
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { subscription } = useSubscription();
  const { upgradeSubscription, isLoading: isUpgrading } = useUpgradeManagement();

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);

      // Verificar se o usuário já tem um plano pago ativo
      const hasActivePaidPlan = subscription && 
        subscription.status === 'active' && 
        !subscription.is_free_trial;

      console.log('🔍 [RecurringSubscription] Verificando tipo de operação:', {
        hasSubscription: !!subscription,
        status: subscription?.status,
        isFreeTrial: subscription?.is_free_trial,
        hasActivePaidPlan
      });

      if (hasActivePaidPlan) {
        // Se já tem plano pago, fazer upgrade
        console.log('🔄 [RecurringSubscription] Fazendo upgrade para:', {
          planId,
          planName,
          amount,
          leadsLimit
        });

        const upgradeResult = await upgradeSubscription(planId, 'Upgrade solicitado pelo usuário');
        
        if (upgradeResult) {
          console.log('✅ [RecurringSubscription] Upgrade realizado:', upgradeResult);
          onSuccess?.(upgradeResult);
        } else {
          throw new Error('Falha ao realizar upgrade');
        }
        return;
      }

      // Nova assinatura com Perfect Pay
      console.log('🆕 [RecurringSubscription] Criando assinatura Perfect Pay:', {
        planId,
        planName,
        amount,
        leadsLimit
      });

      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('👤 [RecurringSubscription] Usuário autenticado:', user.id);

      // Chamar backend Perfect Pay
      const response = await fetch('/api/perfect-pay/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          planId: planId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ [RecurringSubscription] Resposta do backend:', result);

      if (!result.success || !result.data?.checkoutUrl) {
        throw new Error(result.message || 'Erro ao criar checkout');
      }

      // Redirecionar para Perfect Pay
      console.log('🔄 [RecurringSubscription] Redirecionando para:', result.data.checkoutUrl);
      window.location.href = result.data.checkoutUrl;

    } catch (error: any) {
      console.error('❌ [RecurringSubscription] Erro:', error);
      onError?.(error.message || 'Erro ao processar assinatura');
    } finally {
      setIsLoading(false);
    }
  };

  // Funções de pagamento removidas - agora usa Checkout Pro diretamente

  const isProcessing = isLoading || isUpgrading;

  return (
    <>
      <button
        onClick={handleSubscribe}
        disabled={isProcessing}
        className={`
          bg-gradient-to-r from-blue-500 to-purple-600 
          hover:from-blue-600 hover:to-purple-700 
          disabled:from-gray-400 disabled:to-gray-500
          text-white px-6 py-3 rounded-lg font-semibold 
          transition-all duration-200 
          disabled:opacity-50 disabled:cursor-not-allowed 
          flex items-center gap-2 justify-center
          ${className}
        `}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {isUpgrading ? 'Fazendo Upgrade...' : 'Criando Assinatura...'}
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            {children || `Assinar por R$ ${(amount || 0).toFixed(2)}/mês`}
          </>
        )}
      </button>
      
      {/* Modal de Pagamento - Removido para usar Checkout Pro */}
    </>
  );
};

export default RecurringSubscriptionButton;

