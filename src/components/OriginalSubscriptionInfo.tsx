import React from 'react';
import { Calendar } from 'lucide-react';
import { useOriginalSubscription } from '../hooks/useOriginalSubscription';

interface OriginalSubscriptionInfoProps {
  userId: string;
}

export const OriginalSubscriptionInfo: React.FC<OriginalSubscriptionInfoProps> = ({ userId }) => {
  const { subscriptionData, loading, error, formatDate } = useOriginalSubscription(userId);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Não mostrar se houver erro, não houver dados, ou for trial gratuito
  if (error || !subscriptionData || subscriptionData.is_free_trial) {
    return null;
  }

  // Verificar se a data é válida
  const isValidDate = subscriptionData.created_at && 
    subscriptionData.created_at !== 'Invalid Date' && 
    !isNaN(new Date(subscriptionData.created_at).getTime());

  if (!isValidDate) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center space-x-3">
        <Calendar className="w-5 h-5 text-blue-600" />
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Data da Primeira Assinatura
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatDate(subscriptionData.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
};
