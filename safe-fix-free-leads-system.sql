-- =====================================================
-- CORREÇÃO SEGURA DO SISTEMA DE LEADS GRATUITOS
-- =====================================================
-- Este SQL apenas corrige as funções sem afetar a estrutura existente

-- 1. CORRIGIR FUNÇÃO create_free_trial_subscription
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

  -- Registrar no histórico (usando colunas corretas)
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

-- 2. CORRIGIR FUNÇÃO consume_leads_updated
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

  -- Registrar no histórico (usando colunas corretas)
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

-- 3. VERIFICAR SE AS FUNÇÕES FORAM CRIADAS CORRETAMENTE
-- =====================================================
SELECT 
  'Funções corrigidas com sucesso' as status,
  proname as function_name,
  proargnames as parameters
FROM pg_proc 
WHERE proname IN ('create_free_trial_subscription', 'consume_leads_updated')
ORDER BY proname;

