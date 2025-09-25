-- =====================================================
-- CRIAR FUNÇÃO PARA CRIAR ASSINATURA RECORRENTE
-- =====================================================

CREATE OR REPLACE FUNCTION create_recurring_subscription(
  p_user_id UUID,
  p_plan_id UUID,
  p_preapproval_id TEXT,
  p_user_email TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription_id UUID;
  v_plan_data RECORD;
  v_result JSON;
BEGIN
  -- Buscar dados do plano
  SELECT 
    display_name,
    price_monthly,
    leads_limit
  INTO v_plan_data
  FROM subscription_plans
  WHERE id = p_plan_id;
  
  -- Verificar se plano existe
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Plano não encontrado'
    );
  END IF;
  
  -- Criar nova assinatura
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
    mercado_pago_preapproval_id,
    recurring_status,
    billing_day,
    next_billing_date,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_plan_id,
    'active',
    'monthly',
    NOW(),
    NOW() + INTERVAL '1 month',
    0,
    v_plan_data.leads_limit,
    true,
    p_preapproval_id,
    p_preapproval_id,
    'active',
    EXTRACT(DAY FROM NOW()),
    NOW() + INTERVAL '1 month',
    NOW(),
    NOW()
  ) RETURNING id INTO v_subscription_id;
  
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
    v_subscription_id,
    0,
    'subscription_created',
    'Assinatura recorrente criada',
    v_plan_data.leads_limit
  );
  
  RETURN json_build_object(
    'success', true,
    'subscription_id', v_subscription_id,
    'message', 'Assinatura criada com sucesso'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLSTATE,
      'message', SQLERRM
    );
END;
$$;

