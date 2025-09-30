-- =====================================================
-- FUNÇÃO DE DOWNGRADE COM DEBUG - VERSÃO MELHORADA
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
  v_error_msg TEXT;
BEGIN
  -- Debug: Log dos parâmetros
  RAISE NOTICE 'DEBUG: p_user_id = %, p_new_plan_id = %, p_downgrade_reason = %', p_user_id, p_new_plan_id, p_downgrade_reason;
  
  -- Buscar assinatura ativa atual
  SELECT us.*, sp.price_monthly, sp.display_name
  INTO v_current_subscription
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  -- Debug: Log da assinatura encontrada
  IF v_current_subscription IS NULL THEN
    RAISE NOTICE 'DEBUG: Nenhuma assinatura ativa encontrada para user_id = %', p_user_id;
    RETURN json_build_object(
      'success', false,
      'error', 'no_active_subscription',
      'message', 'Nenhuma assinatura ativa encontrada',
      'debug_user_id', p_user_id
    );
  ELSE
    RAISE NOTICE 'DEBUG: Assinatura encontrada: id = %, plan = %, price = %', 
      v_current_subscription.id, v_current_subscription.display_name, v_current_subscription.price_monthly;
  END IF;
  
  -- Buscar novo plano
  SELECT id, name, display_name, price_monthly, leads_limit
  INTO v_new_plan
  FROM subscription_plans
  WHERE id = p_new_plan_id AND is_active = true;
  
  -- Debug: Log do plano encontrado
  IF v_new_plan IS NULL THEN
    RAISE NOTICE 'DEBUG: Plano não encontrado: plan_id = %', p_new_plan_id;
    RETURN json_build_object(
      'success', false,
      'error', 'plan_not_found',
      'message', 'Plano de destino não encontrado',
      'debug_plan_id', p_new_plan_id
    );
  ELSE
    RAISE NOTICE 'DEBUG: Plano encontrado: id = %, name = %, price = %', 
      v_new_plan.id, v_new_plan.display_name, v_new_plan.price_monthly;
  END IF;
  
  -- Verificar se é realmente um downgrade (mais barato)
  IF v_new_plan.price_monthly >= v_current_subscription.price_monthly THEN
    RAISE NOTICE 'DEBUG: Não é downgrade válido: current_price = %, new_price = %', 
      v_current_subscription.price_monthly, v_new_plan.price_monthly;
    RETURN json_build_object(
      'success', false,
      'error', 'not_downgrade',
      'message', 'Operação não é um downgrade válido',
      'current_price', v_current_subscription.price_monthly,
      'new_price', v_new_plan.price_monthly
    );
  END IF;
  
  -- Calcular dias restantes
  v_days_remaining := GREATEST(0, EXTRACT(DAYS FROM (v_current_subscription.current_period_end - NOW())));
  v_total_days := EXTRACT(DAYS FROM (v_current_subscription.current_period_end - v_current_subscription.current_period_start));
  
  -- Calcular crédito proporcional da diferença
  v_credit_amount := ((v_current_subscription.price_monthly - v_new_plan.price_monthly) * v_days_remaining) / v_total_days;
  v_credit_amount := ROUND(v_credit_amount, 2);
  
  RAISE NOTICE 'DEBUG: Calculando downgrade: days_remaining = %, total_days = %, credit = %', 
    v_days_remaining, v_total_days, v_credit_amount;
  
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
  
  RAISE NOTICE 'DEBUG: Downgrade concluído com sucesso';
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    v_error_msg := 'Erro ao fazer downgrade: ' || SQLERRM;
    RAISE NOTICE 'DEBUG: Erro capturado: %', v_error_msg;
    RETURN json_build_object(
      'success', false,
      'error', 'database_error',
      'message', v_error_msg,
      'debug_error', SQLERRM
    );
END;
$$;

