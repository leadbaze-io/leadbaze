-- =====================================================
-- CORREÇÃO DO TIPO DE OPERAÇÃO NA FUNÇÃO
-- =====================================================
-- Corrigir 'granted' para 'bonus' que é permitido pela constraint

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

  -- Registrar no histórico (usando 'bonus' em vez de 'granted')
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
    'bonus', -- Corrigido: 'bonus' é permitido pela constraint
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

