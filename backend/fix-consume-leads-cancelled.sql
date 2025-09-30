-- Função para consumir leads incluindo assinaturas canceladas no período
CREATE OR REPLACE FUNCTION consume_leads_with_cancelled(
  p_user_id UUID,
  p_leads_consumed INTEGER,
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
  -- Buscar assinatura ativa ou cancelada no período
  SELECT 
    us.id,
    us.user_id,
    us.plan_id,
    us.status,
    us.leads_used,
    us.leads_remaining,
    us.current_period_end,
    sp.leads_limit
  INTO v_subscription
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id 
    AND (
      us.status = 'active' 
      OR (us.status = 'cancelled' AND us.current_period_end > NOW())
    )
  ORDER BY us.created_at DESC
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
    leads_generated,
    operation_type,
    operation_reason,
    remaining_leads
  ) VALUES (
    p_user_id,
    v_subscription.id,
    p_leads_consumed,
    'generated',
    p_operation_reason,
    v_new_remaining
  );

  -- Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'message', 'Leads consumidos com sucesso',
    'leads_consumed', p_leads_consumed,
    'leads_remaining', v_new_remaining,
    'leads_limit', v_subscription.leads_limit
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'database_error',
      'message', 'Erro ao consumir leads: ' || SQLERRM
    );
END;
$$;

