-- =====================================================
-- FUNÇÃO PARA CONSUMIR LEADS (SIMPLES - SUPORTA TRIAL GRATUITO)
-- =====================================================

CREATE OR REPLACE FUNCTION consume_leads_simple(
  p_user_id UUID,
  p_leads_consumed INTEGER DEFAULT 1,
  p_operation_reason TEXT DEFAULT 'lead_generation'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bonus_leads INTEGER;
  v_bonus_leads_used INTEGER;
  v_subscription_leads INTEGER;
  v_subscription_leads_used INTEGER;
  v_total_available INTEGER;
  v_total_used INTEGER;
  v_new_bonus_used INTEGER;
  v_new_subscription_used INTEGER;
  v_leads_remaining INTEGER;
  v_subscription RECORD;
BEGIN
  -- Buscar leads bônus do usuário
  SELECT 
    COALESCE(bonus_leads, 0),
    COALESCE(bonus_leads_used, 0)
  INTO v_bonus_leads, v_bonus_leads_used
  FROM user_profiles
  WHERE user_id = p_user_id;

  -- Buscar assinatura ativa (se existir)
  SELECT 
    ups.leads_balance,
    ups.leads_bonus,
    pp.display_name as plan_display_name
  INTO v_subscription
  FROM user_payment_subscriptions ups
  JOIN payment_plans pp ON ups.plan_id = pp.id
  WHERE ups.user_id = p_user_id 
    AND ups.status = 'active'
    AND ups.current_period_end > NOW()
  ORDER BY ups.created_at DESC
  LIMIT 1;

  -- Calcular totais
  IF v_subscription IS NOT NULL THEN
    v_subscription_leads := COALESCE(v_subscription.leads_balance, 0);
    v_subscription_leads_used := COALESCE(v_subscription.leads_bonus, 0);
  ELSE
    v_subscription_leads := 0;
    v_subscription_leads_used := 0;
  END IF;

  v_total_available := v_bonus_leads + v_subscription_leads;
  v_total_used := v_bonus_leads_used + v_subscription_leads_used;
  v_leads_remaining := v_total_available - v_total_used;

  -- Verificar se tem leads suficientes
  IF v_leads_remaining < p_leads_consumed THEN
    RETURN json_build_object(
      'success', false,
      'reason', 'insufficient_leads',
      'message', 'Leads insuficientes para consumir',
      'leads_remaining', v_leads_remaining,
      'leads_limit', v_total_available,
      'bonus_leads', v_bonus_leads,
      'bonus_leads_used', v_bonus_leads_used,
      'subscription_leads', v_subscription_leads,
      'subscription_leads_used', v_subscription_leads_used,
      'total_available', v_total_available,
      'total_used', v_total_used
    );
  END IF;

  -- Consumir leads (priorizar leads bônus primeiro)
  v_new_bonus_used := v_bonus_leads_used;
  v_new_subscription_used := v_subscription_leads_used;
  
  -- Primeiro consumir dos leads bônus
  IF v_bonus_leads_used < v_bonus_leads THEN
    DECLARE
      v_bonus_to_consume INTEGER := LEAST(p_leads_consumed, v_bonus_leads - v_bonus_leads_used);
    BEGIN
      v_new_bonus_used := v_bonus_leads_used + v_bonus_to_consume;
      p_leads_consumed := p_leads_consumed - v_bonus_to_consume;
    END;
  END IF;

  -- Depois consumir dos leads da assinatura (se ainda precisar)
  IF p_leads_consumed > 0 AND v_subscription_leads_used < v_subscription_leads THEN
    DECLARE
      v_subscription_to_consume INTEGER := LEAST(p_leads_consumed, v_subscription_leads - v_subscription_leads_used);
    BEGIN
      v_new_subscription_used := v_subscription_leads_used + v_subscription_to_consume;
      p_leads_consumed := p_leads_consumed - v_subscription_to_consume;
    END;
  END IF;

  -- Atualizar leads bônus na tabela user_profiles
  UPDATE user_profiles 
  SET bonus_leads_used = v_new_bonus_used
  WHERE user_id = p_user_id;

  -- Atualizar leads da assinatura (se existir)
  IF v_subscription IS NOT NULL THEN
    UPDATE user_payment_subscriptions 
    SET leads_balance = leads_balance - (v_new_subscription_used - v_subscription_leads_used)
    WHERE user_id = p_user_id 
      AND status = 'active'
      AND current_period_end > NOW();
  END IF;

  -- Registrar no log de consumo (se a tabela existir)
  BEGIN
    INSERT INTO lead_consumption_log (
      user_id,
      leads_consumed,
      operation_reason,
      created_at
    ) VALUES (
      p_user_id,
      p_leads_consumed,
      p_operation_reason,
      NOW()
    );
  EXCEPTION
    WHEN undefined_table THEN
      -- Tabela não existe, continuar sem log
      NULL;
  END;

  -- Calcular novos totais
  v_total_used := v_new_bonus_used + v_new_subscription_used;
  v_leads_remaining := v_total_available - v_total_used;

  RETURN json_build_object(
    'success', true,
    'reason', 'success',
    'message', 'Leads consumidos com sucesso',
    'leads_consumed', p_leads_consumed,
    'leads_remaining', v_leads_remaining,
    'leads_limit', v_total_available,
    'bonus_leads', v_bonus_leads,
    'bonus_leads_used', v_new_bonus_used,
    'subscription_leads', v_subscription_leads,
    'subscription_leads_used', v_new_subscription_used,
    'total_available', v_total_available,
    'total_used', v_total_used,
    'plan_name', COALESCE(v_subscription.plan_display_name, 'Trial Gratuito')
  );
END;
$$;
