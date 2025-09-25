import React, { useState } from 'react';

import {

  X,

  AlertTriangle,

  ExternalLink

} from 'lucide-react';

import { useSubscriptionManagement } from '../hooks/useSubscriptionManagement';


import { useSubscription } from '../hooks/useSubscription';

import { CancelledSubscriptionWarning } from './CancelledSubscriptionWarning';

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


  const { refetch } = useSubscription();

  const handleCancel = async () => {

    const result = await cancelSubscription(cancelReason);

    if (result?.success) {

      setShowCancelModal(false);

      setCancelReason('');

      refetch();

      onSuccess?.();

    } else {
      console.error('Falha no cancelamento:', result);
    }

  };


  const isCancelledInPeriod = subscription.status === 'cancelled' &&

    new Date(subscription.current_period_end) > new Date();

  return (

    <div className="space-y-4">

      {/* Aviso de Cancelamento */}

      {isCancelledInPeriod && (

        <CancelledSubscriptionWarning

          leadsRemaining={subscription.leads_remaining}

          accessUntil={subscription.current_period_end}

        />

      )}

      {/* Ações de Cancelamento */}

      {subscription.status === 'active' ? (

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">

          <div className="flex flex-wrap gap-3">

            <button

              onClick={(e) => {

                e.preventDefault();

                e.stopPropagation();

                setShowCancelModal(true);

              }}

              className="subscription-cancel-btn"

                disabled={isLoading}

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

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">

            <p className="text-sm text-green-800 dark:text-green-200">

              <strong>✅ Acesso Mantido</strong> - Você pode continuar usando os <strong>{subscription.leads_remaining} leads restantes</strong> até <strong>{new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}</strong>.

            </p>

          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">

            <div className="flex items-start gap-2">

              <div className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5">

                ℹ️

              </div>

              <div className="text-sm text-blue-800 dark:text-blue-200">

                <p className="font-medium mb-2">Status do Cancelamento:</p>

                <p>

                  • <strong>Cancelamento local:</strong> Concluído no LeadBaze<br/>

                  • <strong>Cancelamento manual:</strong> Pendente no Perfect Pay<br/>

                  • <strong>Acesso:</strong> Mantido até {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}<br/>

                  • <strong>Suporte:</strong> Entre em contato se precisar de ajuda

                </p>

              </div>

            </div>

          </div>

          <div className="flex flex-wrap gap-3">

            <button

              onClick={() => window.open('https://app.perfectpay.com.br', '_blank')}

              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"

            >

              <ExternalLink className="w-4 h-4" />

              Cancelar no Perfect Pay

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

              Ver Planos Disponíveis

            </button>

          </div>

        </div>

      )}

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

            {/* Aviso sobre cancelamento manual */}

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">

              <div className="flex items-start gap-2">

                <div className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5">

                  ⚠️

                </div>

                <div className="text-sm">

                  <p className="cancellation-warning-title">

                    IMPORTANTE: Cancelamento Manual Necessário

                  </p>

                  <p className="cancellation-warning-text">

                    Você deve cancelar manualmente no Perfect Pay para evitar cobranças futuras.

                  </p>

                </div>

              </div>

            </div>

            {/* Informações sobre leads restantes */}

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">

              <p className="text-sm text-green-800 dark:text-green-200">

                <strong>✅ Leads Restantes:</strong> Você poderá continuar usando os <strong>{subscription.leads_remaining} leads restantes</strong> até <strong>{new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}</strong>.

              </p>

            </div>

            {/* Informações sobre reembolso */}

            {new Date() < new Date(new Date(subscription.current_period_start).getTime() + 7 * 24 * 60 * 60 * 1000) && (

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">

                <p className="text-sm text-blue-800 dark:text-blue-200">

                  <strong>💰 Reembolso:</strong> Você pode ser elegível para reembolso.<br/>

                  <strong>📅 Data da compra:</strong> {new Date(subscription.current_period_start).toLocaleDateString('pt-BR')}<br/>

                  <strong>⏰ Prazo para reembolso:</strong> {new Date(new Date(subscription.current_period_start).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}

                </p>

              </div>

            )}

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

                onClick={() => setShowCancelModal(false)}

                className="modal-cancel-btn"

                disabled={isLoading}

              >

                Cancelar

              </button>

              <button

                onClick={handleCancel}

                className="modal-confirm-btn"

                disabled={isLoading}

              >

                {isLoading ? 'Processando...' : 'Confirmar Cancelamento'}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};