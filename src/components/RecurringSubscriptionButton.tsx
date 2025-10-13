import React, { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { useUpgradeManagement } from '../hooks/useUpgradeManagement';
import { useAnalytics } from '../hooks/useAnalytics';
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
  planName: _planName,
  amount,
  leadsLimit: _leadsLimit,
  userId: _userId,
  userEmail: _userEmail,
  onError,
  className = '',
  children
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { subscription } = useSubscription();
  const { isLoading: isUpgrading } = useUpgradeManagement();
  const { trackInitiateCheckout, trackPurchase } = useAnalytics();

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);

      // Rastrear início do checkout
      trackInitiateCheckout(amount, 'BRL', [planId]);

      // Verificar se o usuário já tem um plano pago ativo
      const hasActivePaidPlan = subscription && 
        subscription.status === 'active' && 
        !subscription.is_free_trial;


      if (hasActivePaidPlan) {
        // Se já tem assinatura ativa, não permitir nova assinatura
        throw new Error('Você já possui uma assinatura ativa. Para alterar seu plano, entre em contato com nosso suporte.');
      }

      // Nova assinatura com Perfect Pay

      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

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

      if (!result.success || !result.data?.checkoutUrl) {
        throw new Error(result.message || 'Erro ao criar checkout');
      }

      // Rastrear nova assinatura (será confirmada quando o webhook for processado)
      trackPurchase(amount, 'BRL', `txn_${Date.now()}`, [{ item_id: planId, item_name: _planName, price: amount }]);

      // Redirecionar para Perfect Pay
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
          bg-gradient-to-r from-green-500 to-emerald-600 
          hover:from-green-600 hover:to-emerald-700 
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

