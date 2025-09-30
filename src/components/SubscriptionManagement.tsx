import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  CreditCard,
  ExternalLink
} from 'lucide-react';
import { useSubscriptionManagement } from '../hooks/useSubscriptionManagement';
import { useRecurringSubscription } from '../hooks/useRecurringSubscription';
import { useSubscription } from '../hooks/useSubscription';
import type { SubscriptionManagementProps } from '../types/subscription-management';
import '../styles/subscription-management.css';

export const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({
  subscription,
  onSuccess
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const {
    cancelSubscription,
    isLoading
  } = useSubscriptionManagement();


  const {
    cancelSubscription: cancelRecurringSubscription,
    isLoading: isRecurringLoading
  } = useRecurringSubscription();

  const { refetch } = useSubscription();


  const handleCancel = async () => {
    const result = await cancelSubscription(cancelReason);
    if (result?.success) {
      setShowCancelModal(false);
      setCancelReason('');
      refetch();
      onSuccess?.();
    } else {
    }
  };





  const handleCancelRecurring = async () => {
    if (!subscription?.gateway_subscription_id) return;
    
    const result = await cancelRecurringSubscription(
      subscription.gateway_subscription_id,
      subscription.user_id || '',
      cancelReason
    );
    
    if (result?.success) {
      setShowCancelModal(false);
      setCancelReason('');
      refetch();
      onSuccess?.();
    }
  };



  if (!subscription) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhuma assinatura encontrada</p>
      </div>
    );
  }

  // Se a assinatura está cancelada mas ainda no período, mostrar opção de reativação
  const isCancelledInPeriod = subscription.status === 'cancelled' && 
    new Date(subscription.current_period_end) > new Date();

  return (
    <div className="space-y-4">
      
      {/* Status da Assinatura */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">

        {/* Ações baseadas no status */}
        {subscription.status === 'active' ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowCancelModal(true);
                }}
                className="subscription-cancel-btn"
                disabled={isLoading || isRecurringLoading}
                title="Cancelar assinatura (requer cancelamento manual no Perfect Pay)"
              >
                <X className="w-4 h-4" />
                Cancelar Assinatura
              </button>
            </div>
          </div>
        ) : isCancelledInPeriod ? (
          <div className="space-y-3">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>🚨 ASSINATURA CANCELADA - AÇÃO MANUAL NECESSÁRIA</strong><br/>
                Sua assinatura foi cancelada no LeadBaze, mas você DEVE cancelar manualmente no Perfect Pay para evitar cobranças futuras!
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="text-blue-600 mt-0.5">📋</div>
                <div>
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
                    Instruções para Cancelamento Manual
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                    Para evitar cobranças futuras, você deve cancelar no Perfect Pay:
                  </p>
                  <ol className="text-xs text-blue-700 dark:text-blue-300 list-decimal list-inside space-y-1">
                    <li>Acesse: <strong>https://app.perfectpay.com.br</strong></li>
                    <li>Faça login com suas credenciais</li>
                    <li>Vá para "Minhas Assinaturas"</li>
                    <li>Cancele a assinatura do LeadBaze</li>
                    <li>Confirme o cancelamento</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>✅ Acesso Mantido</strong> - Você pode continuar usando os <strong>{subscription.leads_remaining} leads restantes</strong> até <strong>{new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}</strong>.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => window.open('https://app.perfectpay.com.br', '_blank')}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Cancelar no Perfect Pay
              </button>
              <button
                onClick={() => window.location.href = '/plans'}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Assinar Novo Plano
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nenhuma assinatura ativa. Assine um plano para começar a gerar leads.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => window.location.href = '/plans'}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Ver Planos Disponíveis
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Cancelamento */}
      {showCancelModal && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCancelModal(false);
            }
          }}
        >
          <div 
            className="subscription-modal-content max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cancelar Assinatura
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Tem certeza que deseja cancelar sua assinatura? 
              <strong className="text-green-600 dark:text-green-400"> Você poderá continuar usando os {subscription.leads_remaining} leads restantes até {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}.</strong>
            </p>
            

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>📋 Instruções para Cancelamento Manual:</strong><br/>
                1. Acesse: <strong>https://app.perfectpay.com.br</strong><br/>
                2. Faça login com suas credenciais<br/>
                3. Vá para "Minhas Assinaturas"<br/>
                4. Cancele a assinatura do LeadBaze<br/>
                5. Confirme o cancelamento
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>⚠️ Política de Cancelamento:</strong><br/>
                • <strong>Acesso mantido</strong> até o final do período atual<br/>
                • <strong>Leads preservados</strong> durante o período de acesso<br/>
                • <strong>Nova assinatura</strong> necessária após o período atual
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>✅ Leads Restantes:</strong> Você poderá continuar usando os <strong>{subscription.leads_remaining} leads restantes</strong> até <strong>{new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}</strong>.
              </p>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>📅 Data da compra:</strong> {new Date(subscription.current_period_start).toLocaleDateString('pt-BR')}<br/>
                <strong>⏰ Prazo para reembolso:</strong> {new Date(new Date(subscription.current_period_start).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Motivo do cancelamento (opcional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows={3}
                placeholder="Conte-nos por que está cancelando..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={subscription.gateway_subscription_id ? handleCancelRecurring : handleCancel}
                className="modal-destructive-btn"
                disabled={isLoading || isRecurringLoading}
              >
                {(isLoading || isRecurringLoading) ? 'Cancelando...' : 'Sim, Cancelar'}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="modal-cancel-btn"
                disabled={isLoading || isRecurringLoading}
              >
                Não
              </button>
            </div>
          </div>
        </div>
      )}




    </div>
  );
};

