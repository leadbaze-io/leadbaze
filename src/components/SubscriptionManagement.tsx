import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  TrendingDown, 
  ChevronDown,
  ChevronUp,
  CreditCard
} from 'lucide-react';
import { useSubscriptionManagement } from '../hooks/useSubscriptionManagement';
import { useRecurringSubscription } from '../hooks/useRecurringSubscription';
import { useSubscription } from '../hooks/useSubscription';
import { CancelledSubscriptionWarning } from './CancelledSubscriptionWarning';
import type { SubscriptionManagementProps, SubscriptionPlan } from '../types/subscription-management';
import '../styles/subscription-management.css';

export const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({
  subscription,
  onSuccess
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [downgradeReason, setDowngradeReason] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [downgradePlans, setDowngradePlans] = useState<SubscriptionPlan[]>([]);
  const [showPlans, setShowPlans] = useState(false);

  const {
    cancelSubscription,
    downgradeSubscription,
    getDowngradePlans,
    isLoading
  } = useSubscriptionManagement();


  const {
    cancelSubscription: cancelRecurringSubscription,
    isLoading: isRecurringLoading
  } = useRecurringSubscription();

  const { refetch } = useSubscription();

  // Carregar planos para downgrade
  useEffect(() => {
    if (showDowngradeModal) {
      loadDowngradePlans();
    }
  }, [showDowngradeModal]);

  const loadDowngradePlans = async () => {
    const plans = await getDowngradePlans();
    setDowngradePlans(plans);
  };

  const handleCancel = async () => {
    console.log('🔄 Iniciando cancelamento...', { cancelReason, isLoading });
    const result = await cancelSubscription(cancelReason);
    console.log('📋 Resultado do cancelamento:', result);
    if (result?.success) {
      console.log('✅ Cancelamento bem-sucedido');
      setShowCancelModal(false);
      setCancelReason('');
      refetch();
      onSuccess?.();
    } else {
      console.log('❌ Falha no cancelamento:', result);
    }
  };


  const handleDowngrade = async () => {
    if (!selectedPlan) return;
    
    const result = await downgradeSubscription(selectedPlan.id, downgradeReason);
    if (result?.success) {
      setShowDowngradeModal(false);
      setSelectedPlan(null);
      setDowngradeReason('');
      refetch();
      onSuccess?.();
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


  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
      {/* Aviso para assinatura cancelada */}
      {subscription.status === 'cancelled' && isCancelledInPeriod && (
        <CancelledSubscriptionWarning 
          leadsRemaining={subscription.leads_remaining}
          accessUntil={subscription.current_period_end}
        />
      )}
      
      {/* Status da Assinatura */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {subscription.plan?.display_name}
            </h3>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                subscription.status === 'active' 
                  ? 'bg-green-500' 
                  : subscription.status === 'cancelled' 
                    ? 'bg-red-500' 
                    : 'bg-yellow-500'
              }`}></div>
              <span className={`text-sm font-medium ${
                subscription.status === 'active' 
                  ? 'text-green-600 dark:text-green-400' 
                  : subscription.status === 'cancelled' 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-yellow-600 dark:text-yellow-400'
              }`}>
                {subscription.status === 'active' 
                  ? 'Ativa' 
                  : subscription.status === 'cancelled' 
                    ? 'Cancelada' 
                    : subscription.status}
              </span>
              {subscription.status === 'cancelled' && isCancelledInPeriod && (
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                  Acesso até {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPrice(subscription.plan?.price || 0)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">por mês</div>
          </div>
        </div>

        {/* Ações baseadas no status */}
        {subscription.status === 'active' ? (
          <div className="space-y-3">
            {/* Informação sobre tipo de assinatura */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-800 dark:text-blue-200">
                  {subscription.gateway_subscription_id 
                    ? 'Assinatura Recorrente - Cobrança automática mensal'
                    : 'Assinatura Única - Renovação manual necessária'
                  }
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Só mostrar downgrade se não estiver no Plano Start */}
              {subscription.plan?.name !== 'start' && (
                <button
                  onClick={() => setShowDowngradeModal(true)}
                  className="subscription-downgrade-btn"
                  disabled={isLoading}
                >
                  <TrendingDown className="w-4 h-4" />
                  Fazer Downgrade
                </button>
              )}
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowCancelModal(true);
                }}
                className="subscription-cancel-btn"
                disabled={isLoading || isRecurringLoading}
              >
                <X className="w-4 h-4" />
                Cancelar Assinatura
              </button>
            </div>
          </div>
        ) : isCancelledInPeriod ? (
          <div className="space-y-3">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Assinatura cancelada</strong> - Você pode continuar usando os {subscription.leads_remaining} leads restantes até {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}.
              </p>
            </div>
            {/* Informação sobre acesso até o fim do período */}
            <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="text-gray-500 mt-0.5">ℹ️</div>
                <div>
                  <p className="text-sm text-gray-800 dark:text-gray-200 font-medium mb-1">
                    Acesso Mantido
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    Você pode continuar usando os leads restantes até o final do período atual. Após isso, você precisará assinar um novo plano para continuar.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
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


      {/* Modal de Downgrade */}
      {showDowngradeModal && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDowngradeModal(false);
            }
          }}
        >
          <div 
            className="subscription-modal-content max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <TrendingDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Fazer Downgrade
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Escolha um plano com menor valor. Você receberá um crédito proporcional 
              pela diferença de preço.
            </p>

            {/* Lista de Planos */}
            <div className="mb-6">
              <button
                onClick={() => setShowPlans(!showPlans)}
                className="plan-selection-btn flex items-center justify-between w-full p-3 border rounded-lg"
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedPlan ? selectedPlan.display_name : 'Selecione um plano'}
                </span>
                {showPlans ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {showPlans && (
                <div className="mt-2 space-y-2">
                  {downgradePlans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => {
                        setSelectedPlan(plan);
                        setShowPlans(false);
                      }}
                      className={`plan-item p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPlan?.id === plan.id ? 'selected' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {plan.display_name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {plan.leads.toLocaleString()} leads por mês
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {formatPrice(plan.price)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">por mês</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Motivo do downgrade (opcional)
              </label>
              <textarea
                value={downgradeReason}
                onChange={(e) => setDowngradeReason(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows={3}
                placeholder="Conte-nos por que está fazendo downgrade..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDowngrade}
                className="modal-confirm-btn"
                disabled={isLoading || !selectedPlan}
              >
                {isLoading ? 'Processando...' : 'Confirmar Downgrade'}
              </button>
              <button
                onClick={() => setShowDowngradeModal(false)}
                className="modal-cancel-btn"
                disabled={isLoading}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

