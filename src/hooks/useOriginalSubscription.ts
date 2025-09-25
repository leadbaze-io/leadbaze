import { useState, useEffect } from 'react';

interface SubscriptionData {
  created_at: string;
  plan_display_name: string;
  price_monthly: number;
  is_free_trial?: boolean;
}

export const useOriginalSubscription = (userId: string) => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);

        // Buscar dados da assinatura atual via Perfect Pay
        const response = await fetch(`/api/perfect-pay/subscription/${userId}`);
        const result = await response.json();

        if (result.success && result.data) {
          setSubscriptionData(result.data);
        }

      } catch (err) {
        console.error('Erro ao buscar dados da assinatura:', err);
        // Não mostrar erro para o usuário
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [userId]);

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'Invalid Date') {
      return 'Data não disponível';
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Data não disponível';
    }
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return {
    subscriptionData,
    loading,
    error,
    formatDate
  };
};

