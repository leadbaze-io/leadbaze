import { useState, useEffect } from 'react';

declare global {
  interface Window {
    PerfectPay: any;
  }
}

interface CardToken {
  id: string;
  first_six_digits: string;
  last_four_digits: string;
  expiration_month: number;
  expiration_year: number;
  cardholder: {
    name: string;
    identification: {
      type: string;
      number: string;
    };
  };
}

interface CardFormData {
  cardNumber: string;
  expirationMonth: string;
  expirationYear: string;
  securityCode: string;
  cardholderName: string;
  identificationType: string;
  identificationNumber: string;
}

export const usePerfectPay = () => {
  const [mp, setMp] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Carregar script do Perfect Pay
    const script = document.createElement('script');
    script.src = 'https://sdk.perfectpay.com/js/v2';
    script.async = true;
    
    script.onload = () => {
      try {
        const perfectPay = new window.PerfectPay(
                 import.meta.env.VITE_PERFECT_PAY_PUBLIC_KEY || 'APP_USR-06d1a176-fbb3-4fbf-ac2d-581324912846',
          {
            locale: 'pt-BR'
          }
        );
        setMp(perfectPay);
        setIsLoading(false);
        console.log('✅ Perfect Pay SDK carregado com sucesso');
      } catch (err) {
        console.error('❌ Erro ao inicializar Perfect Pay:', err);
        setError('Erro ao carregar Perfect Pay');
        setIsLoading(false);
      }
    };

    script.onerror = () => {
      setError('Erro ao carregar script do Perfect Pay');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const createCardToken = async (cardData: CardFormData): Promise<CardToken> => {
    if (!mp) {
      throw new Error('Perfect Pay não está inicializado');
    }

    try {
      console.log('🔄 Criando token do cartão...');
      
      const cardToken = await mp.createCardToken({
        cardNumber: cardData.cardNumber,
        cardholderName: cardData.cardholderName,
        cardExpirationMonth: cardData.expirationMonth,
        cardExpirationYear: cardData.expirationYear,
        securityCode: cardData.securityCode,
        identificationType: cardData.identificationType,
        identificationNumber: cardData.identificationNumber,
      });

      console.log('✅ Token criado:', cardToken.id);
      return cardToken;
    } catch (error) {
      console.error('❌ Erro ao criar token:', error);
      throw error;
    }
  };

  const getIdentificationTypes = async () => {
    if (!mp) {
      throw new Error('Perfect Pay não está inicializado');
    }

    try {
      const identificationTypes = await mp.getIdentificationTypes();
      return identificationTypes;
    } catch (error) {
      console.error('❌ Erro ao buscar tipos de identificação:', error);
      throw error;
    }
  };

  const getInstallments = async (cardNumber: string, amount: number) => {
    if (!mp) {
      throw new Error('Perfect Pay não está inicializado');
    }

    try {
      const installments = await mp.getInstallments({
        amount: amount.toString(),
        bin: cardNumber.slice(0, 6),
        payment_type_id: 'credit_card'
      });
      return installments;
    } catch (error) {
      console.error('❌ Erro ao buscar parcelas:', error);
      throw error;
    }
  };

  return {
    mp,
    isLoading,
    error,
    createCardToken,
    getIdentificationTypes,
    getInstallments
  };
};
