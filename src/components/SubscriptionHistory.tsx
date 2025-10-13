import React, { useState, useEffect } from 'react';
import { Calendar, CreditCard, TrendingUp, TrendingDown, X, RotateCcw, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { UserSubscription } from '../types/subscription';

interface SubscriptionActivity {
  id: string;
  type: 'subscription_created' | 'subscription_cancelled' | 'subscription_reactivated' | 'subscription_upgraded' | 'subscription_downgraded' | 'payment_success' | 'payment_failed' | 'leads_consumed' | 'leads_refunded' | 'leads_bonus';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
  details?: {
    plan_name?: string;
    old_plan_name?: string;
    price?: number;
    leads_consumed?: number;
    leads_remaining?: number;
    reason?: string;
    payment_id?: string;
  };
}

interface SubscriptionHistoryProps {
  subscription: UserSubscription | null;
  className?: string;
}

export const SubscriptionHistory: React.FC<SubscriptionHistoryProps> = ({
  subscription,
  className = ''
}) => {
  const [activities, setActivities] = useState<SubscriptionActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar histórico de atividades
  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!subscription) {
        setActivities([]);
        return;
      }

      // Buscar histórico usando a função SQL
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Para trial gratuito, usar null como subscription_id
      const subscriptionId = subscription.id === 'bonus-trial' ? null : subscription.id;
      
      const { data, error } = await supabase.rpc('get_subscription_activity_history', {
        p_user_id: user.id,
        p_subscription_id: subscriptionId
      });

      if (error) {
        console.error('Erro ao buscar histórico:', error);
        setError('Erro ao carregar histórico');
        return;
      }

      if (!data.success) {
        setError(data.message || 'Erro ao carregar histórico');
        return;
      }

      // Converter dados da função SQL para o formato do componente
      const activities: SubscriptionActivity[] = data.data.map((item: any) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        timestamp: item.timestamp,
        status: item.status,
        details: item.details
      }));

      setActivities(activities);
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
      setError('Erro ao carregar histórico');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [subscription]);

  const getActivityIcon = (type: SubscriptionActivity['type']) => {
    switch (type) {
      case 'subscription_created':
        return <CheckCircle className="w-5 h-5" />;
      case 'subscription_cancelled':
        return <X className="w-5 h-5" />;
      case 'subscription_reactivated':
        return <RotateCcw className="w-5 h-5" />;
      case 'subscription_upgraded':
        return <TrendingUp className="w-5 h-5" />;
      case 'subscription_downgraded':
        return <TrendingDown className="w-5 h-5" />;
      case 'payment_success':
        return <CreditCard className="w-5 h-5" />;
      case 'payment_failed':
        return <AlertCircle className="w-5 h-5" />;
      case 'leads_consumed':
        return <TrendingUp className="w-5 h-5" />;
      case 'leads_refunded':
        return <RotateCcw className="w-5 h-5" />;
      case 'leads_bonus':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: SubscriptionActivity['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateUrl = (url: string, maxLength: number = 30) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  const formatReason = (reason: string) => {
    if (reason.startsWith('lead_generation_from_maps:')) {
      const url = reason.replace('lead_generation_from_maps: ', '');
      return `Geração de leads: ${truncateUrl(url)}`;
    }
    return reason;
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className={`subscription-history-card ${className}`}>
        <div className="subscription-history-header">
          <div className="subscription-history-title">
            <Calendar className="w-5 h-5" />
            Histórico de Atividades
          </div>
        </div>
        <div className="subscription-history-content">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando histórico...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`subscription-history-card ${className}`}>
        <div className="subscription-history-header">
          <div className="subscription-history-title">
            <Calendar className="w-5 h-5" />
            Histórico de Atividades
          </div>
        </div>
        <div className="subscription-history-content">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchActivities}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`subscription-history-card ${className}`}>
      <div className="subscription-history-header">
        <div className="subscription-history-title">
          <Calendar className="w-5 h-5" />
          Histórico de Atividades
        </div>
        <div className="subscription-history-subtitle">
          Acompanhe todas as ações relacionadas à sua assinatura
        </div>
      </div>

      <div className="subscription-history-content">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Nenhuma atividade encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="subscription-activity-item">
                <div className="subscription-activity-icon">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="subscription-activity-content">
                  <div className="subscription-activity-header">
                    <h4 className="subscription-activity-title">{activity.title}</h4>
                    <span className={`subscription-activity-status ${getStatusColor(activity.status)}`}>
                      {formatDate(activity.timestamp)}
                    </span>
                  </div>
                  <p className="subscription-activity-description">
                    {activity.type === 'leads_consumed' && activity.details?.reason 
                      ? formatReason(activity.details.reason)
                      : activity.description
                    }
                  </p>
                  
                  {activity.details && (
                    <div className="subscription-activity-details">
                      {activity.details.plan_name && (
                        <span className="subscription-activity-detail">
                          Plano: <strong>{activity.details.plan_name}</strong>
                        </span>
                      )}
                      {activity.details.old_plan_name && (
                        <span className="subscription-activity-detail">
                          De: <strong>{activity.details.old_plan_name}</strong>
                        </span>
                      )}
                      {activity.details.price && (
                        <span className="subscription-activity-detail">
                          Valor: <strong>{formatPrice(activity.details.price)}</strong>
                        </span>
                      )}
                      {activity.details.leads_consumed !== undefined && (
                        <span className="subscription-activity-detail">
                          Leads: <strong>{activity.details.leads_consumed}</strong>
                        </span>
                      )}
                      {activity.details.leads_remaining !== undefined && (
                        <span className="subscription-activity-detail">
                          Restantes: <strong>{activity.details.leads_remaining}</strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
