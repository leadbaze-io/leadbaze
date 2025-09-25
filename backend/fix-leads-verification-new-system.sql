-- =====================================================
-- CORRIGIR VERIFICAÇÃO DE LEADS PARA NOVO SISTEMA
-- =====================================================
-- Este script cria funções RPC que verificam leads na nova tabela user_payment_subscriptions

-- 1. FUNÇÃO PARA VERIFICAR DISPONIBILIDADE DE LEADS (NOVO SISTEMA)
-- =====================================================
CREATE OR REPLACE FUNCTION check_leads_availability_new_system(
  p_user_id UUID,
  p_leads_needed INTEGER DEFAULT 1
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription RECORD;
  v_total_leads INTEGER;
  v_result JSON;
BEGIN
  -- Buscar assinatura ativa na nova tabela
  SELECT 
    ups.id,
    ups.user_id,
    ups.plan_id,
    ups.status,
    ups.leads_balance,
    ups.leads_bonus,
    ups.current_period_start,
    ups.current_period_end,
    pp.leads_included,
    pp.display_name as plan_display_name,
    pp.name as plan_name
  INTO v_subscription
  FROM user_payment_subscriptions ups
  JOIN payment_plans pp ON ups.plan_id = pp.id
  WHERE ups.user_id = p_user_id 
    AND ups.status = 'active'
    AND ups.current_period_end > NOW()
  ORDER BY ups.created_at DESC
  LIMIT 1;

  -- Verificar se existe assinatura
  IF NOT FOUND THEN
    RETURN json_build_object(
      'can_generate', false,
      'reason', 'no_subscription',
      'message', 'Nenhuma assinatura encontrada. Faça login para continuar.',
      'leads_remaining', 0,
      'leads_limit', 0,
      'plan_name', 'Nenhum',
      'subscription_id', null
    );
  END IF;

  -- Verificar se o período ainda é válido
  IF v_subscription.current_period_end <= NOW() THEN
    RETURN json_build_object(
      'can_generate', false,
      'reason', 'subscription_expired',
      'message', 'Período da assinatura expirado. Renove sua assinatura para continuar.',
      'leads_remaining', 0,
      'leads_limit', v_subscription.leads_included,
      'plan_name', v_subscription.plan_display_name,
      'subscription_id', v_subscription.id
    );
  END IF;

  -- Calcular total de leads disponíveis (leads_balance já inclui bônus)
  v_total_leads := v_subscription.leads_balance;

  -- Verificar se tem leads suficientes
  IF v_subscription.leads_balance < p_leads_needed THEN
    RETURN json_build_object(
      'can_generate', false,
      'reason', 'insufficient_leads',
      'message', 'Leads insuficientes. Restam ' || v_subscription.leads_balance || ' leads.',
      'leads_remaining', v_subscription.leads_balance,
      'leads_limit', v_total_leads,
      'plan_name', v_subscription.plan_display_name,
      'subscription_id', v_subscription.id
    );
  END IF;

  -- Pode gerar leads
  RETURN json_build_object(
    'can_generate', true,
    'reason', 'success',
    'message', 'Leads disponíveis',
    'leads_remaining', v_subscription.leads_balance,
    'leads_limit', v_total_leads,
    'plan_name', v_subscription.plan_display_name,
    'subscription_id', v_subscription.id
  );
END;
$$;

-- 2. FUNÇÃO PARA CONSUMIR LEADS (NOVO SISTEMA)
-- =====================================================
CREATE OR REPLACE FUNCTION consume_leads_new_system(
  p_user_id UUID,
  p_leads_consumed INTEGER DEFAULT 1,
  p_operation_reason TEXT DEFAULT 'lead_generation'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription RECORD;
  v_new_balance INTEGER;
  v_result JSON;
BEGIN
  -- Buscar assinatura ativa na nova tabela
  SELECT 
    ups.id,
    ups.user_id,
    ups.plan_id,
    ups.status,
    ups.leads_balance,
    ups.leads_bonus,
    ups.current_period_end,
    pp.display_name as plan_display_name
  INTO v_subscription
  FROM user_payment_subscriptions ups
  JOIN payment_plans pp ON ups.plan_id = pp.id
  WHERE ups.user_id = p_user_id 
    AND ups.status = 'active'
    AND ups.current_period_end > NOW()
  ORDER BY ups.created_at DESC
  LIMIT 1;

  -- Verificar se existe assinatura
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'reason', 'no_subscription',
      'message', 'Nenhuma assinatura encontrada',
      'leads_remaining', 0,
      'leads_limit', 0
    );
  END IF;

  -- Verificar se o período ainda é válido
  IF v_subscription.current_period_end <= NOW() THEN
    RETURN json_build_object(
      'success', false,
      'reason', 'subscription_expired',
      'message', 'Período da assinatura expirado',
      'leads_remaining', 0,
      'leads_limit', 0
    );
  END IF;

  -- Verificar se tem leads suficientes
  IF v_subscription.leads_balance < p_leads_consumed THEN
    RETURN json_build_object(
      'success', false,
      'reason', 'insufficient_leads',
      'message', 'Leads insuficientes. Restam ' || v_subscription.leads_balance || ' leads.',
      'leads_remaining', v_subscription.leads_balance,
      'leads_limit', v_subscription.leads_balance + v_subscription.leads_used
    );
  END IF;

  -- Calcular novo saldo
  v_new_balance := v_subscription.leads_balance - p_leads_consumed;

  -- Atualizar assinatura
  UPDATE user_payment_subscriptions 
  SET 
    leads_balance = v_new_balance,
    updated_at = NOW()
  WHERE id = v_subscription.id;

  -- Registrar no histórico (se a tabela existir)
  BEGIN
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
      'generation',
      p_operation_reason,
      v_new_balance
    );
  EXCEPTION WHEN OTHERS THEN
    -- Ignorar erro se a tabela não existir
    NULL;
  END;

  -- Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'reason', 'success',
    'message', 'Leads consumidos com sucesso',
    'leads_consumed', p_leads_consumed,
    'leads_remaining', v_new_balance,
    'leads_limit', v_new_balance + p_leads_consumed,
    'plan_name', v_subscription.plan_display_name
  );
END;
$$;

-- 3. FUNÇÃO PARA OBTER STATUS DA ASSINATURA (NOVO SISTEMA)
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_subscription_status_new_system(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription RECORD;
  v_result JSON;
BEGIN
  -- Buscar assinatura ativa na nova tabela
  SELECT 
    ups.id,
    ups.user_id,
    ups.plan_id,
    ups.status,
    ups.leads_balance,
    ups.leads_bonus,
    ups.current_period_start,
    ups.current_period_end,
    ups.next_billing_date,
    pp.display_name as plan_display_name,
    pp.name as plan_name,
    pp.price_cents,
    pp.leads_included
  INTO v_subscription
  FROM user_payment_subscriptions ups
  JOIN payment_plans pp ON ups.plan_id = pp.id
  WHERE ups.user_id = p_user_id 
    AND ups.status = 'active'
  ORDER BY ups.created_at DESC
  LIMIT 1;

  -- Verificar se existe assinatura
  IF NOT FOUND THEN
    RETURN json_build_object(
      'has_subscription', false,
      'message', 'Nenhuma assinatura encontrada',
      'subscription', null
    );
  END IF;

  -- Retornar dados da assinatura
  RETURN json_build_object(
    'has_subscription', true,
    'message', 'Assinatura encontrada',
    'subscription', json_build_object(
      'id', v_subscription.id,
      'user_id', v_subscription.user_id,
      'plan_id', v_subscription.plan_id,
      'status', v_subscription.status,
      'leads_used', 0, -- Não temos leads_used na nova tabela
      'leads_remaining', v_subscription.leads_balance,
      'leads_limit', v_subscription.leads_included,
      'current_period_start', v_subscription.current_period_start,
      'current_period_end', v_subscription.current_period_end,
      'next_billing_date', v_subscription.next_billing_date,
      'plan_display_name', v_subscription.plan_display_name,
      'plan_name', v_subscription.plan_name,
      'price_monthly', v_subscription.price_cents / 100.0,
      'is_free_trial', false,
      'auto_renewal', true
    )
  );
END;
$$;

-- 4. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================
COMMENT ON FUNCTION check_leads_availability_new_system(UUID, INTEGER) IS 'Verifica disponibilidade de leads no novo sistema de pagamento (user_payment_subscriptions)';
COMMENT ON FUNCTION consume_leads_new_system(UUID, INTEGER, TEXT) IS 'Consome leads no novo sistema de pagamento (user_payment_subscriptions)';
COMMENT ON FUNCTION get_user_subscription_status_new_system(UUID) IS 'Obtém status da assinatura no novo sistema de pagamento (user_payment_subscriptions)';

-- 5. VERIFICAÇÃO FINAL
-- =====================================================
-- Verificar se as funções foram criadas
SELECT 
  'Funções criadas com sucesso' as status,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name IN (
  'check_leads_availability_new_system',
  'consume_leads_new_system', 
  'get_user_subscription_status_new_system'
)
ORDER BY routine_name;
