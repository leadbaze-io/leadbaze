-- =====================================================
-- CRIAR FUNÇÕES RPC QUE ESTÃO FALTANDO
-- =====================================================

-- 1. FUNÇÃO PARA VERIFICAR STATUS DA ASSINATURA
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_subscription_status(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription RECORD;
  v_result JSON;
BEGIN
  -- Buscar assinatura ativa
  SELECT 
    us.id,
    us.user_id,
    us.plan_id,
    us.status,
    us.leads_used,
    us.current_period_start,
    us.current_period_end,
    sp.name as plan_name,
    sp.display_name as plan_display_name,
    sp.leads_limit,
    (sp.leads_limit - us.leads_used) as leads_remaining
  INTO v_subscription
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id 
    AND us.status = 'active'
    AND us.current_period_end > NOW();
  
  -- Se não tem assinatura ativa
  IF v_subscription IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'no_active_subscription',
      'message', 'Nenhuma assinatura ativa encontrada',
      'subscription', null
    );
  END IF;
  
  -- Retornar dados da assinatura
  RETURN json_build_object(
    'success', true,
    'subscription', json_build_object(
      'id', v_subscription.id,
      'user_id', v_subscription.user_id,
      'plan_id', v_subscription.plan_id,
      'status', v_subscription.status,
      'leads_used', v_subscription.leads_used,
      'leads_limit', v_subscription.leads_limit,
      'leads_remaining', v_subscription.leads_remaining,
      'leads_available', v_subscription.leads_remaining,
      'plan_name', v_subscription.plan_name,
      'plan_display_name', v_subscription.plan_display_name,
      'current_period_start', v_subscription.current_period_start,
      'current_period_end', v_subscription.current_period_end
    )
  );
END;
$$;

-- 2. FUNÇÃO PARA CONSUMIR LEADS
-- =====================================================

CREATE OR REPLACE FUNCTION consume_leads(
  p_user_id UUID, 
  p_leads_to_consume INTEGER DEFAULT 1,
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
  -- Buscar assinatura ativa
  SELECT us.*, sp.leads_limit
  INTO v_subscription
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id 
    AND us.status = 'active'
    AND us.current_period_end > NOW();
  
  -- Verificar se tem assinatura ativa
  IF v_subscription IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'no_active_subscription',
      'message', 'Assinatura não encontrada ou inativa'
    );
  END IF;
  
  -- Verificar se tem leads suficientes
  IF v_subscription.leads_remaining < p_leads_to_consume THEN
    RETURN json_build_object(
      'success', false,
      'error', 'insufficient_leads',
      'message', 'Leads insuficientes',
      'leads_remaining', v_subscription.leads_remaining,
      'leads_requested', p_leads_to_consume
    );
  END IF;
  
  -- Calcular novos valores
  v_new_remaining := v_subscription.leads_remaining - p_leads_to_consume;
  
  -- Atualizar assinatura
  UPDATE user_subscriptions 
  SET 
    leads_used = leads_used + p_leads_to_consume,
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
    p_leads_to_consume,
    'generation',
    p_operation_reason,
    v_new_remaining
  );
  
  -- Retornar resultado
  RETURN json_build_object(
    'success', true,
    'leads_consumed', p_leads_to_consume,
    'leads_remaining', v_new_remaining,
    'leads_used', v_subscription.leads_used + p_leads_to_consume,
    'leads_limit', v_subscription.leads_limit,
    'message', 'Leads consumidos com sucesso'
  );
END;
$$;

-- 3. FUNÇÃO PARA BUSCAR HISTÓRICO DE USO
-- =====================================================

CREATE OR REPLACE FUNCTION get_leads_usage_history(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  subscription_id UUID,
  leads_generated INTEGER,
  operation_type TEXT,
  operation_reason TEXT,
  remaining_leads INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    luh.id,
    luh.user_id,
    luh.subscription_id,
    luh.leads_generated,
    luh.operation_type,
    luh.operation_reason,
    luh.remaining_leads,
    luh.created_at
  FROM leads_usage_history luh
  WHERE luh.user_id = p_user_id
    AND luh.created_at >= NOW() - INTERVAL '1 day' * p_days
  ORDER BY luh.created_at DESC;
END;
$$;

-- 4. CONCEDER PERMISSÕES
-- =====================================================

-- Conceder permissões para as funções
GRANT EXECUTE ON FUNCTION get_user_subscription_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION consume_leads(UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_leads_usage_history(UUID, INTEGER) TO authenticated;

-- 5. VERIFICAR SE AS FUNÇÕES FORAM CRIADAS
-- =====================================================

SELECT 
    proname as function_name,
    proargnames as parameter_names,
    proargtypes::regtype[] as parameter_types
FROM pg_proc 
WHERE proname IN (
    'get_user_subscription_status',
    'consume_leads',
    'get_leads_usage_history'
)
ORDER BY proname;











