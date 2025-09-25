-- =====================================================
-- SISTEMA DE LEADS GRATUITOS - LeadBaze
-- =====================================================
-- Implementa 30 leads gratuitos para novos usuários

-- 1. CRIAR PLANO GRATUITO
-- =====================================================
INSERT INTO subscription_plans (
  id,
  name,
  display_name,
  description,
  price_monthly,
  price_yearly,
  leads_limit,
  features,
  is_active,
  sort_order
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- ID fixo para o plano gratuito
  'free_trial',
  'Teste Gratuito',
  '30 leads gratuitos para testar o sistema',
  0.00,
  0.00,
  30,
  '["30 leads gratuitos", "Acesso completo ao sistema", "Suporte por email", "Teste por tempo limitado"]'::jsonb,
  true,
  -1 -- Ordem negativa para aparecer primeiro
) ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  leads_limit = EXCLUDED.leads_limit,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

-- 2. FUNÇÃO PARA CRIAR ASSINATURA GRATUITA
-- =====================================================
CREATE OR REPLACE FUNCTION create_free_trial_subscription(
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_free_plan_id UUID;
  v_subscription_id UUID;
  v_result JSON;
BEGIN
  -- Buscar ID do plano gratuito
  SELECT id INTO v_free_plan_id
  FROM subscription_plans
  WHERE name = 'free_trial'
  LIMIT 1;

  -- Verificar se o plano gratuito existe
  IF v_free_plan_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'free_plan_not_found',
      'message', 'Plano gratuito não encontrado'
    );
  END IF;

  -- Verificar se o usuário já tem alguma assinatura
  IF EXISTS (
    SELECT 1 FROM user_subscriptions 
    WHERE user_id = p_user_id
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'subscription_exists',
      'message', 'Usuário já possui assinatura'
    );
  END IF;

  -- Criar assinatura gratuita
  INSERT INTO user_subscriptions (
    user_id,
    plan_id,
    status,
    billing_cycle,
    current_period_start,
    current_period_end,
    leads_used,
    leads_remaining,
    auto_renewal,
    gateway_subscription_id,
    gateway_customer_id
  ) VALUES (
    p_user_id,
    v_free_plan_id,
    'active',
    'monthly',
    NOW(),
    NOW() + INTERVAL '30 days', -- 30 dias para usar os leads
    0,
    30, -- 30 leads gratuitos
    false, -- Não renova automaticamente
    'free_trial_' || p_user_id::text,
    'free_trial_' || p_user_id::text
  ) RETURNING id INTO v_subscription_id;

  -- Registrar no histórico
  INSERT INTO leads_usage_history (
    user_id,
    subscription_id,
    operation_type,
    leads_generated,
    operation_reason,
    remaining_leads
  ) VALUES (
    p_user_id,
    v_subscription_id,
    'granted',
    30,
    'free_trial_creation',
    30
  );

  RETURN json_build_object(
    'success', true,
    'subscription_id', v_subscription_id,
    'leads_remaining', 30,
    'message', 'Assinatura gratuita criada com sucesso'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'creation_failed',
      'message', 'Erro ao criar assinatura gratuita: ' || SQLERRM
    );
END;
$$;

-- 3. FUNÇÃO PARA VERIFICAR DISPONIBILIDADE DE LEADS (ATUALIZADA)
-- =====================================================
CREATE OR REPLACE FUNCTION check_leads_availability_updated(
  p_user_id UUID,
  p_leads_needed INTEGER DEFAULT 1
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription RECORD;
  v_total_leads INTEGER;
  v_result JSON;
BEGIN
  -- Buscar assinatura ativa ou gratuita
  SELECT 
    us.id,
    us.user_id,
    us.plan_id,
    us.status,
    us.leads_used,
    us.leads_remaining,
    us.current_period_end,
    sp.leads_limit,
    sp.display_name as plan_display_name,
    sp.name as plan_name
  INTO v_subscription
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id 
    AND (
      us.status = 'active' 
      OR (us.status = 'cancelled' AND us.current_period_end > NOW())
    )
  ORDER BY 
    CASE 
      WHEN sp.name = 'free_trial' THEN 1 -- Priorizar plano gratuito
      ELSE 2 
    END,
    us.created_at DESC
  LIMIT 1;

  -- Verificar se existe assinatura
  IF NOT FOUND THEN
    RETURN json_build_object(
      'can_generate', false,
      'reason', 'no_subscription',
      'message', 'Nenhuma assinatura encontrada. Faça login para continuar.',
      'leads_remaining', 0,
      'leads_limit', 0,
      'plan_name', 'Nenhum',
      'subscription_id', null
    );
  END IF;

  -- Verificar se o período ainda é válido
  IF v_subscription.current_period_end <= NOW() THEN
    RETURN json_build_object(
      'can_generate', false,
      'reason', 'subscription_expired',
      'message', 'Período da assinatura expirado. Renove sua assinatura para continuar.',
      'leads_remaining', 0,
      'leads_limit', v_subscription.leads_limit,
      'plan_name', v_subscription.plan_display_name,
      'subscription_id', v_subscription.id
    );
  END IF;

  -- Calcular total de leads disponíveis
  v_total_leads := v_subscription.leads_used + v_subscription.leads_remaining;

  -- Verificar se tem leads suficientes
  IF v_subscription.leads_remaining < p_leads_needed THEN
    RETURN json_build_object(
      'can_generate', false,
      'reason', 'insufficient_leads',
      'message', 'Leads insuficientes. Restam ' || v_subscription.leads_remaining || ' leads.',
      'leads_remaining', v_subscription.leads_remaining,
      'leads_limit', v_total_leads,
      'plan_name', v_subscription.plan_display_name,
      'subscription_id', v_subscription.id
    );
  END IF;

  -- Pode gerar leads
  RETURN json_build_object(
    'can_generate', true,
    'reason', 'success',
    'message', 'Leads disponíveis',
    'leads_remaining', v_subscription.leads_remaining,
    'leads_limit', v_total_leads,
    'plan_name', v_subscription.plan_display_name,
    'subscription_id', v_subscription.id
  );
END;
$$;

-- 4. FUNÇÃO PARA CONSUMIR LEADS (ATUALIZADA)
-- =====================================================
CREATE OR REPLACE FUNCTION consume_leads_updated(
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
  -- Buscar assinatura ativa ou gratuita
  SELECT 
    us.id,
    us.user_id,
    us.plan_id,
    us.status,
    us.leads_used,
    us.leads_remaining,
    us.current_period_end,
    sp.leads_limit,
    sp.display_name as plan_display_name,
    sp.name as plan_name
  INTO v_subscription
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id 
    AND (
      us.status = 'active' 
      OR (us.status = 'cancelled' AND us.current_period_end > NOW())
    )
  ORDER BY 
    CASE 
      WHEN sp.name = 'free_trial' THEN 1 -- Priorizar plano gratuito
      ELSE 2 
    END,
    us.created_at DESC
  LIMIT 1;

  -- Verificar se existe assinatura
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'no_subscription',
      'message', 'Nenhuma assinatura encontrada'
    );
  END IF;

  -- Verificar se o período ainda é válido
  IF v_subscription.current_period_end <= NOW() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'subscription_expired',
      'message', 'Período da assinatura expirado'
    );
  END IF;

  -- Verificar se há leads suficientes
  IF v_subscription.leads_remaining < p_leads_consumed THEN
    RETURN json_build_object(
      'success', false,
      'error', 'insufficient_leads',
      'message', 'Leads insuficientes. Restam ' || v_subscription.leads_remaining || ' leads.'
    );
  END IF;

  -- Calcular novos valores
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
    operation_type,
    leads_generated,
    operation_reason,
    remaining_leads
  ) VALUES (
    p_user_id,
    v_subscription.id,
    'generated',
    p_leads_consumed,
    p_operation_reason,
    v_new_remaining
  );

  RETURN json_build_object(
    'success', true,
    'leads_consumed', p_leads_consumed,
    'leads_remaining', v_new_remaining,
    'plan_name', v_subscription.plan_display_name,
    'message', 'Leads consumidos com sucesso'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'consume_failed',
      'message', 'Erro ao consumir leads: ' || SQLERRM
    );
END;
$$;

-- 5. FUNÇÃO PARA OBTER STATUS DA ASSINATURA (ATUALIZADA)
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_subscription_with_free_trial(
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription RECORD;
  v_result JSON;
BEGIN
  -- Buscar assinatura mais recente (ativa, cancelada no período, ou gratuita)
  SELECT 
    us.id,
    us.user_id,
    us.plan_id,
    us.status,
    us.billing_cycle,
    us.current_period_start,
    us.current_period_end,
    us.leads_used,
    us.leads_remaining,
    us.auto_renewal,
    us.gateway_subscription_id,
    us.gateway_customer_id,
    us.created_at,
    us.updated_at,
    sp.display_name as plan_display_name,
    sp.name as plan_name,
    sp.leads_limit,
    sp.features,
    sp.price_monthly,
    sp.price_yearly
  INTO v_subscription
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
  ORDER BY 
    CASE 
      WHEN sp.name = 'free_trial' THEN 1 -- Priorizar plano gratuito
      ELSE 2 
    END,
    us.created_at DESC
  LIMIT 1;

  -- Se não encontrou assinatura, retornar null
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Calcular total de leads
  v_result := json_build_object(
    'id', v_subscription.id,
    'user_id', v_subscription.user_id,
    'plan_id', v_subscription.plan_id,
    'status', v_subscription.status,
    'billing_cycle', v_subscription.billing_cycle,
    'current_period_start', v_subscription.current_period_start,
    'current_period_end', v_subscription.current_period_end,
    'leads_used', v_subscription.leads_used,
    'leads_remaining', v_subscription.leads_remaining,
    'leads_limit', v_subscription.leads_limit,
    'auto_renewal', v_subscription.auto_renewal,
    'gateway_subscription_id', v_subscription.gateway_subscription_id,
    'gateway_customer_id', v_subscription.gateway_customer_id,
    'created_at', v_subscription.created_at,
    'updated_at', v_subscription.updated_at,
    'plan_display_name', v_subscription.plan_display_name,
    'plan_name', v_subscription.plan_name,
    'price_monthly', v_subscription.price_monthly,
    'price_yearly', v_subscription.price_yearly,
    'features', v_subscription.features,
    'is_free_trial', (v_subscription.plan_name = 'free_trial'),
    'total_leads', v_subscription.leads_used + v_subscription.leads_remaining
  );

  RETURN v_result;
END;
$$;

-- 6. ATUALIZAR CONSTRAINT PARA PERMITIR MÚLTIPLAS ASSINATURAS GRATUITAS
-- =====================================================
-- Remover constraint antiga se existir
ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS unique_active_subscription;

-- Criar nova constraint que permite múltiplas assinaturas gratuitas
-- mas apenas uma assinatura paga ativa por usuário
CREATE UNIQUE INDEX unique_active_paid_subscription_per_user 
ON user_subscriptions (user_id, status) 
WHERE status = 'active' 
  AND plan_id != '00000000-0000-0000-0000-000000000000';

-- 7. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================
COMMENT ON FUNCTION create_free_trial_subscription(UUID) IS 'Cria assinatura gratuita com 30 leads para novos usuários';
COMMENT ON FUNCTION check_leads_availability_updated(UUID, INTEGER) IS 'Verifica disponibilidade de leads considerando plano gratuito';
COMMENT ON FUNCTION consume_leads_updated(UUID, INTEGER, TEXT) IS 'Consome leads considerando plano gratuito';
COMMENT ON FUNCTION get_user_subscription_with_free_trial(UUID) IS 'Obtém status da assinatura considerando plano gratuito';

-- 8. VERIFICAÇÃO FINAL
-- =====================================================
-- Verificar se o plano gratuito foi criado
SELECT 
  'Plano gratuito criado' as status,
  id,
  name,
  display_name,
  leads_limit,
  price_monthly
FROM subscription_plans 
WHERE name = 'free_trial';
