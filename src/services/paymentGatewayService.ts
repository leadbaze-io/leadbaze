import type { GatewayConfig, GatewayCustomer, GatewaySubscription, GatewayPaymentMethod } from '../types/subscription';

export class PaymentGatewayService {
  private config: GatewayConfig;

  constructor(config: GatewayConfig) {
    this.config = config;
  }

  /**
   * Configuração para diferentes gateways de pagamento
   */
  static getGatewayConfig(provider: 'stripe' | 'perfectpay' | 'pagseguro' | 'asaas'): GatewayConfig {
    const configs = {
      stripe: {
        provider: 'stripe' as const,
        publicKey: process.env.REACT_APP_STRIPE_PUBLIC_KEY || '',
        environment: (process.env.REACT_APP_STRIPE_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
      },
      perfectpay: {
        provider: 'perfectpay' as const,
        publicKey: process.env.REACT_APP_MERCADOPAGO_PUBLIC_KEY || '',
        environment: (process.env.REACT_APP_MERCADOPAGO_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
      },
      pagseguro: {
        provider: 'pagseguro' as const,
        publicKey: process.env.REACT_APP_PAGSEGURO_PUBLIC_KEY || '',
        environment: (process.env.REACT_APP_PAGSEGURO_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
      },
      asaas: {
        provider: 'asaas' as const,
        publicKey: process.env.REACT_APP_ASAAS_PUBLIC_KEY || '',
        environment: (process.env.REACT_APP_ASAAS_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
      }
    };

    return configs[provider];
  }

  /**
   * Criar cliente no gateway de pagamento
   */
  async createCustomer(customerData: {
    email: string;
    name: string;
    document: string;
    phone?: string;
    address?: {
      street: string;
      number: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  }): Promise<{ success: boolean; customer?: GatewayCustomer; error?: string }> {
    try {
      switch (this.config.provider) {
        case 'stripe':
          return await this.createStripeCustomer(customerData);
        case 'perfectpay':
          return await this.createPerfectPayCustomer(customerData);
        case 'pagseguro':
          return await this.createPagSeguroCustomer(customerData);
        case 'asaas':
          return await this.createAsaasCustomer(customerData);
        default:
          return { success: false, error: 'Gateway não suportado' };
      }
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      return { success: false, error: 'Erro inesperado ao criar cliente' };
    }
  }

  /**
   * Criar assinatura no gateway de pagamento
   */
  async createSubscription(subscriptionData: {
    customerId: string;
    planId: string;
    price: number;
    billingCycle: 'monthly' | 'yearly';
    paymentMethodId?: string;
  }): Promise<{ success: boolean; subscription?: GatewaySubscription; error?: string }> {
    try {
      switch (this.config.provider) {
        case 'stripe':
          return await this.createStripeSubscription(subscriptionData);
        case 'perfectpay':
          return await this.createPerfectPaySubscription(subscriptionData);
        case 'pagseguro':
          return await this.createPagSeguroSubscription(subscriptionData);
        case 'asaas':
          return await this.createAsaasSubscription(subscriptionData);
        default:
          return { success: false, error: 'Gateway não suportado' };
      }
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      return { success: false, error: 'Erro inesperado ao criar assinatura' };
    }
  }

  /**
   * Cancelar assinatura no gateway de pagamento
   */
  async cancelSubscription(subscriptionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      switch (this.config.provider) {
        case 'stripe':
          return await this.cancelStripeSubscription(subscriptionId);
        case 'perfectpay':
          return await this.cancelPerfectPaySubscription(subscriptionId);
        case 'pagseguro':
          return await this.cancelPagSeguroSubscription(subscriptionId);
        case 'asaas':
          return await this.cancelAsaasSubscription(subscriptionId);
        default:
          return { success: false, error: 'Gateway não suportado' };
      }
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      return { success: false, error: 'Erro inesperado ao cancelar assinatura' };
    }
  }

  /**
   * Obter métodos de pagamento do cliente
   */
  async getPaymentMethods(customerId: string): Promise<{ success: boolean; methods?: GatewayPaymentMethod[]; error?: string }> {
    try {
      switch (this.config.provider) {
        case 'stripe':
          return await this.getStripePaymentMethods(customerId);
        case 'perfectpay':
          return await this.getPerfectPayPaymentMethods(customerId);
        case 'pagseguro':
          return await this.getPagSeguroPaymentMethods(customerId);
        case 'asaas':
          return await this.getAsaasPaymentMethods(customerId);
        default:
          return { success: false, error: 'Gateway não suportado' };
      }
    } catch (error) {
      console.error('Erro ao buscar métodos de pagamento:', error);
      return { success: false, error: 'Erro inesperado ao buscar métodos de pagamento' };
    }
  }

  // =====================================================
  // IMPLEMENTAÇÕES ESPECÍFICAS POR GATEWAY
  // =====================================================

  private async createStripeCustomer(customerData: any) {
    // Implementação para Stripe
    // Esta seria uma chamada para sua API backend que usa o Stripe
    const response = await fetch('/api/stripe/create-customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData)
    });

    const result = await response.json();
    return result;
  }

  private async createPerfectPayCustomer(customerData: any) {
    // Implementação para Perfect Pay
    const response = await fetch('/api/perfect-pay/create-customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData)
    });

    const result = await response.json();
    return result;
  }

  private async createPagSeguroCustomer(customerData: any) {
    // Implementação para PagSeguro
    const response = await fetch('/api/pagseguro/create-customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData)
    });

    const result = await response.json();
    return result;
  }

  private async createAsaasCustomer(customerData: any) {
    // Implementação para Asaas
    const response = await fetch('/api/asaas/create-customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData)
    });

    const result = await response.json();
    return result;
  }

  private async createStripeSubscription(subscriptionData: any) {
    const response = await fetch('/api/stripe/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionData)
    });

    const result = await response.json();
    return result;
  }

  private async createPerfectPaySubscription(subscriptionData: any) {
    const response = await fetch('/api/perfect-pay/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionData)
    });

    const result = await response.json();
    return result;
  }

  private async createPagSeguroSubscription(subscriptionData: any) {
    const response = await fetch('/api/pagseguro/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionData)
    });

    const result = await response.json();
    return result;
  }

  private async createAsaasSubscription(subscriptionData: any) {
    const response = await fetch('/api/asaas/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionData)
    });

    const result = await response.json();
    return result;
  }

  private async cancelStripeSubscription(subscriptionId: string) {
    const response = await fetch(`/api/stripe/cancel-subscription/${subscriptionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    return result;
  }

  private async cancelPerfectPaySubscription(subscriptionId: string) {
    const response = await fetch(`/api/perfect-pay/cancel-subscription/${subscriptionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    return result;
  }

  private async cancelPagSeguroSubscription(subscriptionId: string) {
    const response = await fetch(`/api/pagseguro/cancel-subscription/${subscriptionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    return result;
  }

  private async cancelAsaasSubscription(subscriptionId: string) {
    const response = await fetch(`/api/asaas/cancel-subscription/${subscriptionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    return result;
  }

  private async getStripePaymentMethods(customerId: string) {
    const response = await fetch(`/api/stripe/payment-methods/${customerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    return result;
  }

  private async getPerfectPayPaymentMethods(customerId: string) {
    const response = await fetch(`/api/perfect-pay/payment-methods/${customerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    return result;
  }

  private async getPagSeguroPaymentMethods(customerId: string) {
    const response = await fetch(`/api/pagseguro/payment-methods/${customerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    return result;
  }

  private async getAsaasPaymentMethods(customerId: string) {
    const response = await fetch(`/api/asaas/payment-methods/${customerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    return result;
  }
}

// =====================================================
// HOOK PARA USAR O SERVIÇO DE PAGAMENTO
// =====================================================

export const usePaymentGateway = (provider: 'stripe' | 'perfectpay' | 'pagseguro' | 'asaas') => {
  const config = PaymentGatewayService.getGatewayConfig(provider);
  const gateway = new PaymentGatewayService(config);

  return {
    createCustomer: gateway.createCustomer.bind(gateway),
    createSubscription: gateway.createSubscription.bind(gateway),
    cancelSubscription: gateway.cancelSubscription.bind(gateway),
    getPaymentMethods: gateway.getPaymentMethods.bind(gateway),
    config
  };
};
