// =====================================================
// TIPOS PARA SISTEMA DE PLANOS E ASSINATURAS
// =====================================================

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price: number; // Perfect Pay usa 'price' ao invés de 'price_monthly'
  price_yearly?: number;
  leads: number; // Perfect Pay usa 'leads' ao invés de 'leads_limit'
  features: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  userId?: string;
  userEmail?: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  leads_used: number;
  leads_remaining: number;
  leads_limit: number;
  auto_renewal: boolean;
  gateway_subscription_id?: string;
  gateway_customer_id?: string;
  created_at: string;
  updated_at: string;
  
  // Dados do plano (join)
  plan?: SubscriptionPlan;
  plan_display_name?: string;
  plan_name?: string;
  price_monthly?: number;
  price_yearly?: number;
  features?: string[];
  is_free_trial?: boolean;
  total_leads?: number;
}

export interface LeadsUsageHistory {
  id: string;
  user_id: string;
  subscription_id: string;
  leads_generated: number;
  operation_type: 'generation' | 'refund' | 'bonus';
  operation_reason?: string;
  remaining_leads: number;
  created_at: string;
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  gateway_transaction_id?: string;
  gateway_payment_method?: string;
  description?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// =====================================================
// TIPOS PARA RESPOSTAS DAS FUNÇÕES RPC
// =====================================================

export interface LeadsAvailabilityResponse {
  can_generate: boolean;
  reason: 'success' | 'no_active_subscription' | 'insufficient_leads' | 'sufficient_subscription_leads' | 'sufficient_bonus_leads';
  message: string;
  leads_remaining: number;
  leads_limit: number;
  plan_name?: string;
  subscription_id?: string;
}

export interface ConsumeLeadsResponse {
  success: boolean;
  error?: string;
  message: string;
  leads_consumed?: number;
  leads_remaining?: number;
  leads_limit?: number;
}

export interface SubscriptionStatusResponse {
  has_subscription: boolean;
  message?: string;
  subscription_id?: string;
  plan_name?: string;
  plan_display_name?: string;
  plan_description?: string;
  price_monthly?: number;
  billing_cycle?: 'monthly' | 'yearly';
  leads_used?: number;
  leads_remaining?: number;
  leads_limit?: number;
  current_period_start?: string;
  current_period_end?: string;
  auto_renewal?: boolean;
  features?: string[];
  days_remaining?: number;
}

// =====================================================
// TIPOS PARA COMPONENTES DE INTERFACE
// =====================================================

export interface PlanCardProps {
  plan: SubscriptionPlan;
  currentPlan?: UserSubscription;
  onSelectPlan: (planId: string) => void;
  isLoading?: boolean;
  isPopular?: boolean;
}

export interface SubscriptionStatusCardProps {
  subscription: UserSubscription | null;
  onUpgrade?: () => void;
  onManage?: () => void;
}

export interface LeadsUsageChartProps {
  usageHistory: LeadsUsageHistory[];
  currentPeriod: {
    start: string;
    end: string;
  };
}

// =====================================================
// TIPOS PARA FORMULÁRIOS
// =====================================================

export interface PlanSelectionFormData {
  planId: string;
  paymentMethod: 'credit_card' | 'pix' | 'boleto';
  acceptTerms: boolean;
  acceptLGPD: boolean;
}

export interface PaymentFormData {
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardName: string;
  cpf: string;
  billingAddress: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

// =====================================================
// TIPOS PARA GATEWAY DE PAGAMENTO
// =====================================================

export interface GatewayConfig {
  provider: 'stripe' | 'perfectpay' | 'pagseguro' | 'asaas';
  publicKey: string;
  environment: 'sandbox' | 'production';
}

export interface GatewayCustomer {
  id: string;
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
}

export interface GatewaySubscription {
  id: string;
  customerId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  metadata: Record<string, any>;
}

export interface GatewayPaymentMethod {
  id: string;
  type: 'card' | 'pix' | 'boleto';
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

// =====================================================
// TIPOS PARA HOOKS
// =====================================================

export interface UseSubscriptionReturn {
  subscription: UserSubscription | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  checkLeadsAvailability: (leadsToGenerate?: number) => Promise<LeadsAvailabilityResponse>;
  consumeLeads: (leadsToConsume: number, reason?: string) => Promise<ConsumeLeadsResponse>;
}

// =====================================================
// TIPOS PARA GERENCIAMENTO DE ASSINATURAS
// =====================================================

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
  subscription?: any; // Adicionar propriedade subscription
}

export interface SubscriptionManagementProps {
  subscription: UserSubscription;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export interface UsePlansReturn {
  plans: SubscriptionPlan[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseLeadsUsageReturn {
  usageHistory: LeadsUsageHistory[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  currentPeriodUsage: {
    used: number;
    remaining: number;
    limit: number;
  };
}

// =====================================================
// TIPOS PARA CONTEXTO
// =====================================================

export interface SubscriptionContextType {
  subscription: UserSubscription | null;
  plans: SubscriptionPlan[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  selectPlan: (planId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  checkLeadsAvailability: (leadsToGenerate?: number) => Promise<LeadsAvailabilityResponse>;
  consumeLeads: (leadsToConsume: number, reason?: string) => Promise<ConsumeLeadsResponse>;
  refetchSubscription: () => Promise<void>;
  refetchPlans: () => Promise<void>;
}

// =====================================================
// TIPOS PARA UTILITÁRIOS
// =====================================================

export interface PlanComparison {
  feature: string;
  start: boolean | string;
  scale: boolean | string;
  enterprise: boolean | string;
}

export interface BillingCycleOption {
  value: 'monthly' | 'yearly';
  label: string;
  discount?: number;
  description?: string;
}

export interface UsageStats {
  totalLeadsUsed: number;
  totalLeadsRemaining: number;
  averageDailyUsage: number;
  projectedMonthlyUsage: number;
  daysUntilReset: number;
  usagePercentage: number;
}



