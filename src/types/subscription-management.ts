// Tipos para gerenciamento de assinaturas

export interface CancelSubscriptionResponse {
  success: boolean;
  message: string;
  subscription_id: string;
  plan_name: string;
  days_remaining: number;
  refund_amount: number;
  leads_preserved: number;
}

export interface ReactivateSubscriptionResponse {
  success: boolean;
  message: string;
  data: {
    subscription_id: string;
    plan_name: string;
    leads_remaining: number;
  };
}

export interface DowngradeSubscriptionResponse {
  success: boolean;
  message: string;
  old_plan: string;
  new_plan: string;
  leads_remaining: number;
  note: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price: number; // Perfect Pay usa 'price' ao invés de 'price_monthly'
  leads: number; // Perfect Pay usa 'leads' ao invés de 'leads_limit'
  features: string[];
  is_popular?: boolean;
  is_enterprise?: boolean;
}

export interface SubscriptionManagementProps {
  subscription: any; // UserSubscription
  onSuccess?: () => void;
  onError?: (error: string) => void;
}


