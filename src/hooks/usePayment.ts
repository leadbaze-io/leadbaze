import { useState, useCallback } from 'react';
import type { PaymentRequest, PaymentResponse, PaymentStatus } from '../types/payment';

interface UsePaymentReturn {
  createPayment: (request: PaymentRequest) => Promise<PaymentResponse>;
  checkPaymentStatus: (paymentId: string) => Promise<PaymentStatus>;
  loading: boolean;
  error: string | null;
}

export const usePayment = (): UsePaymentReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = useCallback(async (request: PaymentRequest): Promise<PaymentResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {

        throw new Error(data.message || 'Erro ao criar pagamento');
      }

      if (!data.success) {

        throw new Error(data.message || 'Falha ao criar pagamento');
      }

      if (!data.data) {

        throw new Error('Dados de pagamento ausentes na resposta');
      }
      return data.data;

    } catch (err: any) {
      const errorMessage = err.message || 'Erro desconhecido ao criar pagamento';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkPaymentStatus = useCallback(async (paymentId: string): Promise<PaymentStatus> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/payments/status?paymentId=${paymentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao verificar status do pagamento');
      }

      if (!data.success) {
        throw new Error(data.message || 'Falha ao verificar status do pagamento');
      }

      return data.data;

    } catch (err: any) {
      const errorMessage = err.message || 'Erro desconhecido ao verificar status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createPayment,
    checkPaymentStatus,
    loading,
    error,
  };
};
