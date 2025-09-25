-- VERSÃO FINAL DA FUNÇÃO DE CANCELAMENTO (ULTRA SIMPLIFICADA)
DROP FUNCTION IF EXISTS cancel_user_subscription(UUID, TEXT);

CREATE OR REPLACE FUNCTION cancel_user_subscription(
  p_user_id UUID,
  p_cancel_reason TEXT DEFAULT 'Solicitado pelo usuário'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription RECORD;
  v_days_remaining INTEGER;
  v_total_days INTEGER;
  v_refund_amount DECIMAL(10,2);
BEGIN
  -- Buscar assinatura ativa
  SELECT us.*, sp.price_monthly, sp.display_name
  INTO v_subscription
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  -- Verificar se existe assinatura ativa
  IF v_subscription IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'no_active_subscription',
      'message', 'Nenhuma assinatura ativa encontrada'
    );
  END IF;
  
  -- Calcular dias restantes
  v_days_remaining := GREATEST(0, EXTRACT(DAYS FROM (v_subscription.current_period_end - NOW())));
  v_total_days := EXTRACT(DAYS FROM (v_subscription.current_period_end - v_subscription.current_period_start));
  
  -- Calcular valor de reembolso proporcional
  v_refund_amount := (v_subscription.price_monthly * v_days_remaining) / v_total_days;
  v_refund_amount := ROUND(v_refund_amount, 2);
  
  -- APENAS CANCELAR - NÃO CRIAR NADA NOVO
  UPDATE user_subscriptions 
  SET 
    status = 'cancelled',
    updated_at = NOW()
  WHERE id = v_subscription.id;
  
  -- Retornar resultado
  RETURN json_build_object(
    'success', true,
    'message', 'Assinatura cancelada com sucesso',
    'subscription_id', v_subscription.id,
    'plan_name', v_subscription.display_name,
    'days_remaining', v_days_remaining,
    'refund_amount', v_refund_amount,
    'leads_preserved', v_subscription.leads_remaining
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'database_error',
      'message', 'Erro ao cancelar assinatura: ' || SQLERRM
    );
END;
$$;



