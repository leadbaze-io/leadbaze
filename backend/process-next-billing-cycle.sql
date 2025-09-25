-- =====================================================
-- PROCESSAR PRÓXIMO CICLO DE COBRANÇA - APLICAR NOVO LIMITE
-- =====================================================

CREATE OR REPLACE FUNCTION process_next_billing_cycle()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription RECORD;
  v_plan RECORD;
  v_processed_count INTEGER := 0;
  v_result JSON;
BEGIN
  -- Buscar assinaturas que precisam ter o limite ajustado no próximo ciclo
  FOR v_subscription IN 
    SELECT us.*, sp.leads_limit as new_leads_limit
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.status = 'active' 
      AND us.next_billing_date <= NOW()
      AND us.leads_remaining > sp.leads_limit -- Tem mais leads que o limite do plano
  LOOP
    -- Ajustar leads para o limite do plano atual
    UPDATE user_subscriptions 
    SET 
      leads_remaining = LEAST(leads_remaining, v_subscription.new_leads_limit),
      current_period_start = NOW(),
      current_period_end = NOW() + INTERVAL '1 month',
      next_billing_date = NOW() + INTERVAL '1 month',
      updated_at = NOW()
    WHERE id = v_subscription.id;
    
    v_processed_count := v_processed_count + 1;
    
    -- Log da operação
    INSERT INTO subscription_changes (
      user_id,
      subscription_id,
      change_type,
      from_plan_id,
      to_plan_id,
      change_reason
    ) VALUES (
      v_subscription.user_id,
      v_subscription.id,
      'billing_cycle_adjustment',
      v_subscription.plan_id,
      v_subscription.plan_id,
      'Limite de leads ajustado para o plano atual no próximo ciclo de cobrança'
    );
  END LOOP;
  
  -- Retornar resultado
  v_result := json_build_object(
    'success', true,
    'message', 'Ciclo de cobrança processado com sucesso',
    'processed_subscriptions', v_processed_count,
    'processed_at', NOW()
  );
  
  RETURN v_result;
END;
$$;

