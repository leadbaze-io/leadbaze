import React, { useState } from 'react';
import { Zap, TrendingUp, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import type { SubscriptionStatusCardProps } from '../types/subscription';
import { SubscriptionManagement } from './SubscriptionManagement';
import BonusLeadsCard from './BonusLeadsCard';
import '../styles/subscription-card.css';

interface SubscriptionStatusCardPropsExtended extends SubscriptionStatusCardProps {
  isUpdating?: boolean;
  isConnected?: boolean;
  profile?: {
    bonus_leads?: number;
    bonus_leads_used?: number;
  };
}

export const SubscriptionStatusCard: React.FC<SubscriptionStatusCardPropsExtended> = ({
  subscription,
  onUpgrade,
  isUpdating: externalIsUpdating = false,
  isConnected = true,
  profile
}) => {
  const navigate = useNavigate();
  const [showManagement, setShowManagement] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Atualizar timestamp quando a subscription mudar
  React.useEffect(() => {
    if (subscription) {
      setLastUpdate(new Date());
    }
  }, [subscription?.leads_used, subscription?.leads_remaining]);

  // Usar estado externo se disponível, senão usar interno
  const currentIsUpdating = externalIsUpdating;
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatLeads = (count: number) => {
    return new Intl.NumberFormat('pt-BR').format(count);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateUsagePercentage = () => {
    if (!subscription) return 0;
    
    // Calcular porcentagem baseada no limite do plano
    const planLimit = subscription.leads_limit || 0;
    if (planLimit <= 0) return 0;
    
    // Se tem leads excedentes (upgrade), mostrar 0% usado
    if (subscription.leads_remaining > planLimit) {
      return 0; // Usuário tem mais leads que o plano permite
    }
    
    return Math.round((subscription.leads_used / planLimit) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'subscription-card-usage-red';
    if (percentage >= 70) return 'subscription-card-usage-yellow';
    return 'subscription-card-usage-green';
  };

  const getUsageBarColor = (percentage: number) => {
    if (percentage >= 90) return 'subscription-card-bar-red';
    if (percentage >= 70) return 'subscription-card-bar-yellow';
    return 'subscription-card-bar-green';
  };

  const usagePercentage = calculateUsagePercentage();
  // Calcular dias restantes baseado no ciclo de cobrança
  const calculateDaysRemaining = () => {
    if (!subscription) return 0;
    
    const now = new Date();
    const periodEnd = new Date(subscription.current_period_end);
    
    // Se a data de fim do período já passou, calcular próximo ciclo
    if (periodEnd <= now) {
      // Calcular próximo ciclo (30 dias a partir de agora)
      const nextCycle = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      return Math.ceil((nextCycle.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }
    
    // Se ainda está no período atual, calcular dias restantes
    return Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = calculateDaysRemaining();

  return (
    <div>
      {/* Se não tem assinatura mas tem perfil com leads bônus, mostrar card de leads bônus */}
      {!subscription && profile && (profile.bonus_leads || 0) > 0 && (
        <BonusLeadsCard profile={profile} />
      )}
      
      {/* Se não tem assinatura e não tem leads bônus, mostrar mensagem padrão */}
      {!subscription && (!profile || (profile.bonus_leads || 0) === 0) && (
        <div className="profile-card p-6 text-center">
          <div className="text-4xl mb-4">💳</div>
          <h3 className="profile-title text-lg mb-2">Nenhuma Assinatura Ativa</h3>
          <p className="profile-text-muted mb-6">
            Escolha um plano para começar a gerar leads de qualidade
          </p>
          <Button
            onClick={() => navigate('/plans')}
            className="profile-btn-primary"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Ver Planos Disponíveis
          </Button>
        </div>
      )}
      
      {/* Se tem assinatura, mostrar card normal */}
      {subscription && (
        <div className={`subscription-card rounded-2xl p-6 ${subscription.is_free_trial ? 'subscription-card-free-trial' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="subscription-card-title text-xl font-bold">
            {subscription.plan_display_name || subscription.plan_name || 'Plano'}
          </h3>
          <p className="subscription-card-description text-sm">
            {subscription.is_free_trial 
              ? `${formatLeads(subscription.leads_limit || 0)} leads gratuitos para teste`
              : `${formatLeads(subscription.leads_limit || 0)} leads por mês`
            }
          </p>
        </div>
        <div className="text-right">
          {subscription.is_free_trial ? (
            <>
              <div className="subscription-card-price text-2xl font-bold">
                {formatLeads(subscription.leads_remaining)}
              </div>
              <div className="subscription-card-price-label text-sm">
                leads disponíveis
              </div>
            </>
          ) : (
            <>
              <div className="subscription-card-price text-2xl font-bold">
                {formatPrice(subscription.price_monthly || 0)}
              </div>
              <div className="subscription-card-price-label text-sm">
                por mês
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status da Assinatura */}
      <div className="flex items-center gap-2 mb-6">
        <div className={`w-3 h-3 rounded-full ${
          subscription.status === 'active' 
            ? 'bg-green-500' 
            : subscription.status === 'cancelled' 
              ? 'bg-red-500' 
              : 'bg-yellow-500'
        }`} />
        <span className={`subscription-card-status-text text-sm font-medium ${
          subscription.status === 'active' 
            ? 'text-green-600 dark:text-green-400' 
            : subscription.status === 'cancelled' 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-yellow-600 dark:text-yellow-400'
        }`}>
          {subscription.is_free_trial 
            ? 'Teste Gratuito'
            : subscription.status === 'active' 
              ? 'Ativa' 
              : subscription.status === 'cancelled' 
                ? 'Cancelada' 
                : subscription.status}
        </span>
        {subscription.status === 'cancelled' && (
          <span className="subscription-card-badge-cancelled text-xs px-2 py-1 rounded-full">
            Acesso até {formatDate(subscription.current_period_end)}
          </span>
        )}
        {subscription.is_free_trial && (
          <span className="subscription-card-badge text-xs px-2 py-1 rounded-full">
            Válido por {daysRemaining} dias
          </span>
        )}
        {subscription.status === 'active' && subscription.auto_renewal && !subscription.is_free_trial && (
          <span className="subscription-card-badge text-xs px-2 py-1 rounded-full">
            Renovação automática
          </span>
        )}
      </div>

      {/* Mensagem de Cancelamento */}
      {subscription.status === 'cancelled' && (
        <div className="mb-6">
          <div className="subscription-cancellation-message border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="subscription-cancellation-icon w-5 h-5 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h4 className="subscription-cancellation-title text-sm font-semibold mb-1">
                  Assinatura Cancelada
                </h4>
                <p className="subscription-cancellation-text text-sm">
                  Você pode continuar usando os <strong>{formatLeads(subscription.leads_remaining)} leads restantes</strong> até {formatDate(subscription.current_period_end)}.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem do Plano Gratuito */}
      {subscription.is_free_trial && (
        <div className="mb-6">
          <div className="subscription-cancellation-message border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="subscription-cancellation-icon w-5 h-5 mt-0.5 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383-.21.03a1.5 1.5 0 0 1-1.08-.25l-1.5-1.5a1.5 1.5 0 0 1-.25-1.08l.03-.21a12.06 12.06 0 0 1 0-4.5l-.03-.21a1.5 1.5 0 0 1 .25-1.08l1.5-1.5a1.5 1.5 0 0 1 1.08-.25l.21.03a12.06 12.06 0 0 1 4.5 0l.21-.03a1.5 1.5 0 0 1 1.08.25l1.5 1.5a1.5 1.5 0 0 1 .25 1.08l-.03.21a12.06 12.06 0 0 1 0 4.5l.03.21a1.5 1.5 0 0 1-.25 1.08l-1.5 1.5a1.5 1.5 0 0 1-1.08.25l-.21-.03Z" />
                </svg>
              </div>
              <div>
                <h4 className="subscription-cancellation-title text-sm font-semibold mb-1 text-blue-800 dark:text-blue-200">
                  🎁 Teste Gratuito Ativo
                </h4>
                <p className="subscription-cancellation-text text-sm text-blue-700 dark:text-blue-300">
                  Você tem <strong>{formatLeads(subscription.leads_remaining)} leads gratuitos</strong> para testar o sistema. 
                  Após usar todos os leads, <strong>assine um plano</strong> para continuar gerando leads.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Uso de Leads */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-500" />
            <span className="subscription-card-usage-label text-sm font-medium">
              Leads utilizados
            </span>
          </div>
          <span className={`text-sm font-bold ${getUsageColor(usagePercentage)}`}>
            {usagePercentage}%
          </span>
        </div>
        
        {/* Barra de Progresso */}
        <div className="subscription-card-usage-bar-bg w-full rounded-full h-2 mb-2">
          <div 
            className={`subscription-card-usage-bar h-2 rounded-full transition-all duration-500 ease-out ${getUsageBarColor(usagePercentage)}`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between subscription-card-usage-text text-xs">
          <span>
            {subscription.leads_remaining > subscription.leads_limit ? (
              <span className="text-gray-800 dark:text-green-400">
                🎁 {formatLeads(subscription.leads_remaining - subscription.leads_limit)} leads bônus
              </span>
            ) : (
              `${formatLeads(subscription.leads_used)} utilizados`
            )}
          </span>
          <span className="flex items-center gap-1">
            {formatLeads(subscription.leads_remaining)} restantes
            {currentIsUpdating && (
              <span className="text-blue-500 text-xs animate-pulse" title="Atualizando...">
                ⟳
              </span>
            )}
            {!currentIsUpdating && lastUpdate && (
              <span className={`text-xs ${isConnected ? 'text-green-500' : 'text-yellow-500'}`} title={`Atualizado em ${lastUpdate.toLocaleTimeString()} ${isConnected ? '(Tempo Real)' : '(Polling)'}`}>
                ●
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Informações do Ciclo */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        {/* Não exibir "Novos leads em" quando assinatura estiver cancelada */}
        {subscription.status !== 'cancelled' && (
          <div className="subscription-card-info-card rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="subscription-card-info-icon w-4 h-4" />
              <span className="subscription-card-info-label text-xs">
                {subscription.is_free_trial ? 'Leads disponíveis' : 'Novos leads em'}
              </span>
            </div>
            <div className="subscription-card-info-value text-sm font-semibold">
              {subscription.is_free_trial 
                ? `${subscription.leads_remaining} leads`
                : `${daysRemaining} dias`
              }
            </div>
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="flex gap-3">
        {subscription.is_free_trial && (
          <button
            onClick={() => window.location.href = '/plans'}
            className="subscription-card-btn-primary flex-1 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            <TrendingUp className="w-4 h-4" />
            Assinar Plano
          </button>
        )}
        
        {onUpgrade && subscription.status === 'active' && !subscription.is_free_trial && (
          <button
            onClick={onUpgrade}
            className="subscription-card-btn-primary flex-1 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Atualizar Plano
          </button>
        )}
        
        {!subscription.is_free_trial && (
          <button
            onClick={() => setShowManagement(!showManagement)}
            className="subscription-card-btn-secondary flex-1 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {showManagement ? 'Ocultar' : 'Gerenciar'}
          </button>
        )}
      </div>

      {/* Gerenciamento de Assinatura */}
      {showManagement && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <SubscriptionManagement
            subscription={subscription}
            onSuccess={() => {
              setShowManagement(false);
              // Recarregar dados se necessário
            }}
          />
        </div>
      )}

      {/* Aviso de Limite */}
      {usagePercentage >= 80 && (
        <div className="subscription-card-warning mt-4 p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <div className="subscription-card-warning-dot w-2 h-2 rounded-full" />
            <span className="subscription-card-warning-text text-sm font-medium">
              {usagePercentage >= 100 
                ? 'Limite esgotado! Considere atualizar seu plano.'
                : usagePercentage >= 90 
                ? 'Limite quase esgotado! Considere atualizar seu plano.'
                : 'Você está usando mais de 80% do seu limite mensal.'
              }
            </span>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
};
