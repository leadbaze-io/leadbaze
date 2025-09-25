import React from 'react';
import { AlertTriangle, Zap } from 'lucide-react';
import '../styles/cancelled-subscription-warning.css';

interface CancelledSubscriptionWarningProps {
  leadsRemaining: number;
  accessUntil: string;
}

export const CancelledSubscriptionWarning: React.FC<CancelledSubscriptionWarningProps> = ({
  leadsRemaining,
  accessUntil
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatLeads = (leads: number) => {
    return leads.toLocaleString('pt-BR');
  };

  return (
    <div className="cancelled-subscription-warning rounded-xl p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="cancelled-subscription-warning-icon flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div className="flex-1">
          <h3 className="cancelled-subscription-warning-title text-lg font-bold mb-2">
            ⚠️ Assinatura Cancelada - Ação Necessária
          </h3>

          <div className="cancelled-subscription-warning-content space-y-3">
            <p className="cancelled-subscription-warning-text">
              Sua assinatura foi cancelada, mas você ainda tem acesso aos leads restantes até <strong>{formatDate(accessUntil)}</strong>.
            </p>

            <div className="cancelled-subscription-warning-highlight rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5" />
                <span className="font-semibold">
                  Leads Disponíveis: {formatLeads(leadsRemaining)}
                </span>
              </div>

              <p className="text-sm">
                <strong>Importante:</strong> Antes de realizar uma nova assinatura, utilize todos os seus leads restantes,

                pois eles não serão transferidos para a nova assinatura.
              </p>
            </div>

            <div className="cancelled-subscription-warning-actions flex flex-wrap gap-3 mt-4">
              <button
                onClick={() => window.location.href = '/generate-leads'}
                className="cancelled-subscription-warning-btn-primary px-4 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Usar Leads Agora
              </button>

              <button
                onClick={() => window.location.href = '/plans'}
                className="cancelled-subscription-warning-btn-secondary px-4 py-2 rounded-lg font-medium"
              >
                Ver Planos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
