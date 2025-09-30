-- =====================================================
-- SISTEMA DE PLANOS E CONTROLE DE LEADS - LeadBaze
-- =====================================================

-- 1. TABELA DE PLANOS
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  leads_limit INTEGER NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE ASSINATURAS DOS USUÁRIOS
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 month'),
  leads_used INTEGER DEFAULT 0,
  leads_remaining INTEGER DEFAULT 0,
  auto_renewal BOOLEAN DEFAULT true,
  gateway_subscription_id TEXT, -- ID da assinatura no gateway de pagamento
  gateway_customer_id TEXT, -- ID do cliente no gateway
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint para garantir apenas uma assinatura ativa por usuário
  CONSTRAINT unique_active_subscription UNIQUE (user_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- 3. TABELA DE HISTÓRICO DE USO DE LEADS
CREATE TABLE IF NOT EXISTS leads_usage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  leads_generated INTEGER NOT NULL DEFAULT 1,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('generation', 'refund', 'bonus')),
  operation_reason TEXT,
  remaining_leads INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE TRANSAÇÕES DE PAGAMENTO
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  gateway_transaction_id TEXT,
  gateway_payment_method TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INSERIR PLANOS PADRÃO
-- =====================================================

INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, leads_limit, features, sort_order) VALUES
(
  'start',
  'Plano Start',
  'Ideal para pequenas empresas que estão começando no marketing digital',
  200.00,
  2000.00, -- 10% desconto anual
  1000,
  '[
    "1.000 leads por mês",
    "Suporte por email",
    "Relatórios básicos",
    "Integração com CRM",
    "Templates de email"
  ]'::jsonb,
  1
),
(
  'scale',
  'Plano Scale',
  'Perfeito para empresas em crescimento que precisam de mais volume',
  497.00,
  4970.00, -- 10% desconto anual
  4000,
  '[
    "4.000 leads por mês",
    "Suporte prioritário",
    "Relatórios avançados",
    "Integração com múltiplos CRMs",
    "Templates personalizados",
    "Automação de follow-up",
    "Análise de performance"
  ]'::jsonb,
  2
),
(
  'enterprise',
  'Plano Enterprise',
  'Solução completa para grandes empresas com alta demanda',
  0.00, -- Preço sob consulta
  0.00,
  10000,
  '[
    "10.000+ leads por mês",
    "Suporte dedicado 24/7",
    "Relatórios customizados",
    "Integração ilimitada",
    "Templates exclusivos",
    "Automação avançada",
    "Consultoria estratégica",
    "SLA garantido"
  ]'::jsonb,
  3
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para user_subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_period_end ON user_subscriptions(current_period_end);

-- Índices para leads_usage_history
CREATE INDEX IF NOT EXISTS idx_leads_usage_user_id ON leads_usage_history(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_usage_subscription_id ON leads_usage_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_leads_usage_created_at ON leads_usage_history(created_at);

-- Índices para payment_transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_subscription_id ON payment_transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);

-- =====================================================
-- FUNÇÕES RPC PARA CONTROLE DE LEADS
-- =====================================================

-- Função para verificar se usuário pode gerar leads
CREATE OR REPLACE FUNCTION check_leads_availability(p_user_id UUID, p_leads_to_generate INTEGER DEFAULT 1)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription RECORD;
  v_result JSON;
BEGIN
  -- Buscar assinatura ativa do usuário
  SELECT us.*, sp.name as plan_name, sp.display_name as plan_display_name, sp.leads_limit
  INTO v_subscription
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id 
    AND us.status = 'active'
    AND us.current_period_end > NOW();
  
  -- Se não tem assinatura ativa
  IF v_subscription IS NULL THEN
    RETURN json_build_object(
      'can_generate', false,
      'reason', 'no_active_subscription',
      'message', 'Você precisa de uma assinatura ativa para gerar leads',
      'leads_remaining', 0,
      'leads_limit', 0,
      'plan_name', null
    );
  END IF;
  
  -- Se não tem leads suficientes
  IF v_subscription.leads_remaining < p_leads_to_generate THEN
    RETURN json_build_object(
      'can_generate', false,
      'reason', 'insufficient_leads',
      'message', 'Você não tem leads suficientes. Atualize seu plano ou aguarde o próximo ciclo.',
      'leads_remaining', v_subscription.leads_remaining,
      'leads_limit', v_subscription.leads_limit,
      'plan_name', v_subscription.plan_display_name
    );
  END IF;
  
  -- Pode gerar leads
  RETURN json_build_object(
    'can_generate', true,
    'reason', 'success',
    'message', 'Leads disponíveis',
    'leads_remaining', v_subscription.leads_remaining,
    'leads_limit', v_subscription.leads_limit,
    'plan_name', v_subscription.plan_display_name,
    'subscription_id', v_subscription.id
  );
END;
$$;

-- Função para consumir leads
CREATE OR REPLACE FUNCTION consume_leads(
  p_user_id UUID, 
  p_leads_consumed INTEGER DEFAULT 1,
  p_operation_reason TEXT DEFAULT 'lead_generation'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription RECORD;
  v_new_remaining INTEGER;
  v_result JSON;
BEGIN
  -- Buscar assinatura ativa
  SELECT us.*, sp.leads_limit
  INTO v_subscription
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id 
    AND us.status = 'active'
    AND us.current_period_end > NOW();
  
  -- Verificar se tem assinatura ativa
  IF v_subscription IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'no_active_subscription',
      'message', 'Assinatura não encontrada ou inativa'
    );
  END IF;
  
  -- Verificar se tem leads suficientes
  IF v_subscription.leads_remaining < p_leads_consumed THEN
    RETURN json_build_object(
      'success', false,
      'error', 'insufficient_leads',
      'message', 'Leads insuficientes',
      'leads_remaining', v_subscription.leads_remaining
    );
  END IF;
  
  -- Calcular novo saldo
  v_new_remaining := v_subscription.leads_remaining - p_leads_consumed;
  
  -- Atualizar assinatura
  UPDATE user_subscriptions 
  SET 
    leads_used = leads_used + p_leads_consumed,
    leads_remaining = v_new_remaining,
    updated_at = NOW()
  WHERE id = v_subscription.id;
  
  -- Registrar no histórico
  INSERT INTO leads_usage_history (
    user_id, 
    subscription_id, 
    leads_generated, 
    operation_type, 
    operation_reason, 
    remaining_leads
  ) VALUES (
    p_user_id, 
    v_subscription.id, 
    p_leads_consumed, 
    'generation', 
    p_operation_reason, 
    v_new_remaining
  );
  
  RETURN json_build_object(
    'success', true,
    'message', 'Leads consumidos com sucesso',
    'leads_consumed', p_leads_consumed,
    'leads_remaining', v_new_remaining,
    'leads_limit', v_subscription.leads_limit
  );
END;
$$;

-- Função para obter status da assinatura
CREATE OR REPLACE FUNCTION get_subscription_status(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription RECORD;
  v_plan RECORD;
BEGIN
  -- Buscar assinatura ativa
  SELECT us.*, sp.*
  INTO v_subscription
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id 
    AND us.status = 'active'
    AND us.current_period_end > NOW();
  
  -- Se não tem assinatura
  IF v_subscription IS NULL THEN
    RETURN json_build_object(
      'has_subscription', false,
      'message', 'Nenhuma assinatura ativa encontrada'
    );
  END IF;
  
  -- Retornar dados da assinatura
  RETURN json_build_object(
    'has_subscription', true,
    'subscription_id', v_subscription.id,
    'plan_name', v_subscription.name,
    'plan_display_name', v_subscription.display_name,
    'plan_description', v_subscription.description,
    'price_monthly', v_subscription.price_monthly,
    'billing_cycle', v_subscription.billing_cycle,
    'leads_used', v_subscription.leads_used,
    'leads_remaining', v_subscription.leads_remaining,
    'leads_limit', v_subscription.leads_limit,
    'current_period_start', v_subscription.current_period_start,
    'current_period_end', v_subscription.current_period_end,
    'auto_renewal', v_subscription.auto_renewal,
    'features', v_subscription.features,
    'days_remaining', EXTRACT(DAYS FROM (v_subscription.current_period_end - NOW()))::INTEGER
  );
END;
$$;

-- =====================================================
-- RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas para subscription_plans (todos podem ler)
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans
  FOR SELECT USING (true);

-- Políticas para user_subscriptions (usuário só vê suas próprias)
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para leads_usage_history (usuário só vê seu próprio histórico)
CREATE POLICY "Users can view own usage history" ON leads_usage_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage history" ON leads_usage_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para payment_transactions (usuário só vê suas próprias transações)
CREATE POLICY "Users can view own transactions" ON payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON payment_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas
CREATE TRIGGER update_subscription_plans_updated_at 
  BEFORE UPDATE ON subscription_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at 
  BEFORE UPDATE ON user_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at 
  BEFORE UPDATE ON payment_transactions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE subscription_plans IS 'Planos de assinatura disponíveis';
COMMENT ON TABLE user_subscriptions IS 'Assinaturas ativas dos usuários';
COMMENT ON TABLE leads_usage_history IS 'Histórico de uso de leads por usuário';
COMMENT ON TABLE payment_transactions IS 'Transações de pagamento';

COMMENT ON FUNCTION check_leads_availability IS 'Verifica se usuário pode gerar leads';
COMMENT ON FUNCTION consume_leads IS 'Consome leads do saldo do usuário';
COMMENT ON FUNCTION get_subscription_status IS 'Retorna status completo da assinatura do usuário';











