// Tipos para integração com Perfect Pay (baseado na documentação oficial)
export interface PaymentRequest {
  planId: string;
  userId: string;
  userEmail: string;
  planName: string;
  amount: number;
  // paymentMethod é escolhido pelo usuário no Perfect Pay Checkout
}

export interface PaymentResponse {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  message?: string;
}

export interface PaymentStatus {
  id: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'in_process' | 'in_mediation' | 'refunded' | 'charged_back';
  status_detail: string;
  transaction_amount: number;
  description: string;
  payment_method_id: string;
  payment_type_id: string;
  payer: {
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  date_created: string;
  date_approved?: string;
  external_reference?: string;
}

export interface WebhookNotification {
  id: number;
  live_mode: boolean;
  type: 'payment' | 'plan' | 'subscription' | 'invoice' | 'point_integration_wh';
  date_created: string;
  application_id: number;
  user_id: number;
  version: number;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  price: number;
  leads: number; // Perfect Pay usa 'leads' ao invés de 'leads_limit'
  features: string[];
  billing_cycle: 'monthly' | 'yearly';
}

export interface PaymentError {
  error: string;
  message: string;
  status: number;
  cause?: Array<{
    code: string;
    description: string;
    data?: any;
  }>;
}

// Tipos para Checkout Pro (recomendado pela documentação)
export interface CheckoutProRequest {
  items: Array<{
    id: string;
    title: string;
    description: string;
    quantity: number;
    unit_price: number;
    currency_id: 'BRL';
  }>;
  payer: {
    email: string;
    name?: string;
    surname?: string;
    phone?: {
      area_code: string;
      number: string;
    };
    identification?: {
      type: string;
      number: string;
    };
  };
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: 'approved' | 'all';
  notification_url: string;
  external_reference: string;
  expires: boolean;
  expiration_date_from?: string;
  expiration_date_to?: string;
}

// Tipos para Assinaturas (Planos Recorrentes)
export interface SubscriptionRequest {
  plan_id: string;
  subscriber: {
    email: string;
    name?: string;
    surname?: string;
  };
  external_reference: string;
  start_date?: string;
  end_date?: string;
}

export interface SubscriptionResponse {
  id: string;
  status: 'pending' | 'authorized' | 'paused' | 'cancelled';
  external_reference: string;
  subscriber: {
    email: string;
  };
  plan: {
    id: string;
    status: string;
  };
  application_fee: number;
  status_updated_at: string;
  created_at: string;
}
