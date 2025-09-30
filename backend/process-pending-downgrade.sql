-- =====================================================
-- FUNÇÃO PARA PROCESSAR DOWNGRADES PENDENTES
-- =====================================================

CREATE OR REPLACE FUNCTION process_pending_downgrades()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription RECORD;
  v_new_plan RECORD;
  v_processed_count INTEGER := 0;
BEGIN
  -- Buscar assinaturas com downgrade pendente
  FOR v_subscription IN 
    SELECT us.*, sp.price_monthly, sp.display_name
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.pending_plan_id IS NOT NULL
      AND us.status = 'active'
  LOOP
    -- Buscar novo plano
    SELECT id, name, display_name, price_monthly, leads_limit
    INTO v_new_plan
    FROM subscription_plans
    WHERE id = v_subscription.pending_plan_id;
    
    -- Aplicar downgrade
    UPDATE user_subscriptions 
    SET 
      plan_id = v_subscription.pending_plan_id,
      leads_remaining = v_new_plan.leads_limit,
      pending_plan_id = NULL,
      pending_plan_change_reason = NULL,
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
      v_subscription.user_id,
      v_subscription.id,
      0,
      'subscription_downgraded',
      'Downgrade processado no ciclo de cobrança',
      v_new_plan.leads_limit
    );
    
    v_processed_count := v_processed_count + 1;
  END LOOP;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Downgrades pendentes processados',
    'processed_count', v_processed_count
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'database_error',
      'message', 'Erro ao processar downgrades: ' || SQLERRM
    );
END;
$$;

