import { useState, useEffect } from 'react';

interface OriginalSubscriptionData {
  original_subscription_date: string;
  first_plan_id: string;
  first_plan_name: string;
  first_plan_price: number;
  upgrade_count: number;
  downgrade_count: number;
  total_amount_paid: number;
}

interface RefundEligibilityData {
  original_subscription_date: string;
  first_plan_name: string;
  first_plan_price: number;
  days_since_original: number;
  refund_eligible: boolean;
  days_remaining_for_refund: number;
  upgrade_count: number;
  downgrade_count: number;
  total_amount_paid: number;
  policy: {
    refund_period_days: number;
    based_on_original_date: boolean;
    note: string;
  };
}

export const useOriginalSubscription = (userId: string) => {
  const [originalData, setOriginalData] = useState<OriginalSubscriptionData | null>(null);
  const [refundEligibility, setRefundEligibility] = useState<RefundEligibilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOriginalSubscription = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);

        // Buscar dados da assinatura original
        const originalResponse = await fetch(`/api/subscription/original/${userId}`);
        const originalResult = await originalResponse.json();

        if (originalResult.success) {
          setOriginalData(originalResult.data);
        }

        // Buscar elegibilidade para reembolso
        const refundResponse = await fetch(`/api/subscription/original/${userId}/refund-eligibility`);
        const refundResult = await refundResponse.json();

        if (refundResult.success) {
          setRefundEligibility(refundResult.data);
        }

      } catch (err) {
        console.error('Erro ao buscar assinatura original:', err);
        setError('Erro ao carregar dados da assinatura original');
      } finally {
        setLoading(false);
      }
    };

    fetchOriginalSubscription();
  }, [userId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return {
    originalData,
    refundEligibility,
    loading,
    error,
    formatDate,
    formatPrice
  };
};

