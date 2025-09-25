-- =====================================================
-- CORRIGIR FUNÇÃO DE DOWNGRADE - VERSÃO FUNCIONAL
-- =====================================================

CREATE OR REPLACE FUNCTION downgrade_user_subscription(
  p_user_id UUID,
  p_new_plan_id UUID,
  p_downgrade_reason TEXT DEFAULT 'Solicitado pelo usuário'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_subscription RECORD;
  v_new_plan RECORD;
  v_days_remaining INTEGER;
  v_total_days INTEGER;
  v_credit_amount DECIMAL(10,2);
  v_result JSON;
BEGIN
  -- Buscar assinatura ativa atual
  SELECT us.*, sp.price_monthly, sp.display_name
  INTO v_current_subscription
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  -- Verificar se existe assinatura ativa
  IF v_current_subscription IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'no_active_subscription',
      'message', 'Nenhuma assinatura ativa encontrada'
    );
  END IF;
  
  -- Buscar novo plano
  SELECT id, name, display_name, price_monthly, leads_limit
  INTO v_new_plan
  FROM subscription_plans
  WHERE id = p_new_plan_id AND is_active = true;
  
  -- Verificar se plano existe
  IF v_new_plan IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'plan_not_found',
      'message', 'Plano de destino não encontrado'
    );
  END IF;
  
  -- Verificar se é realmente um downgrade (mais barato)
  IF v_new_plan.price_monthly >= v_current_subscription.price_monthly THEN
    RETURN json_build_object(
      'success', false,
      'error', 'not_downgrade',
      'message', 'Operação não é um downgrade válido'
    );
  END IF;
  
  -- Calcular dias restantes
  v_days_remaining := GREATEST(0, EXTRACT(DAYS FROM (v_current_subscription.current_period_end - NOW())));
  v_total_days := EXTRACT(DAYS FROM (v_current_subscription.current_period_end - v_current_subscription.current_period_start));
  
  -- Calcular crédito proporcional da diferença
  v_credit_amount := ((v_current_subscription.price_monthly - v_new_plan.price_monthly) * v_days_remaining) / v_total_days;
  v_credit_amount := ROUND(v_credit_amount, 2);
  
  -- Cancelar assinatura atual
  UPDATE user_subscriptions 
  SET 
    status = 'cancelled',
    cancel_reason = p_downgrade_reason,
    cancelled_at = NOW(),
    updated_at = NOW()
  WHERE id = v_current_subscription.id;
  
  -- Criar nova assinatura com downgrade
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
    gateway_customer_id,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_new_plan_id,
    'active',
    'monthly',
    NOW(),
    NOW() + INTERVAL '1 month',
    0,
    v_new_plan.leads_limit,
    true,
    'downgrade_' || v_current_subscription.gateway_subscription_id,
    v_current_subscription.gateway_customer_id,
    NOW(),
    NOW()
  );
  
  -- Retornar resultado
  v_result := json_build_object(
    'success', true,
    'message', 'Downgrade realizado com sucesso',
    'old_plan', v_current_subscription.display_name,
    'new_plan', v_new_plan.display_name,
    'credit_amount', v_credit_amount,
    'leads_remaining', v_new_plan.leads_limit
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'database_error',
      'message', 'Erro ao fazer downgrade: ' || SQLERRM
    );
END;
$$;

