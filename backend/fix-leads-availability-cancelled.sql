-- Função para verificar disponibilidade de leads incluindo assinaturas canceladas no período
CREATE OR REPLACE FUNCTION check_leads_availability_with_cancelled(
  p_user_id UUID,
  p_leads_to_generate INTEGER DEFAULT 1
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription RECORD;
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
      'can_generate', false,
      'reason', 'no_active_subscription',
      'message', 'Nenhuma assinatura encontrada',
      'leads_remaining', 0,
      'leads_limit', 0
    );
  END IF;

  -- Verificar se o período ainda é válido
  IF v_subscription.current_period_end <= NOW() THEN
    RETURN json_build_object(
      'can_generate', false,
      'reason', 'subscription_expired',
      'message', 'Período da assinatura expirado',
      'leads_remaining', 0,
      'leads_limit', v_subscription.leads_limit
    );
  END IF;

  -- Verificar se há leads suficientes
  IF v_subscription.leads_remaining < p_leads_to_generate THEN
    RETURN json_build_object(
      'can_generate', false,
      'reason', 'insufficient_leads',
      'message', 'Leads insuficientes. Restam ' || v_subscription.leads_remaining || ' leads.',
      'leads_remaining', v_subscription.leads_remaining,
      'leads_limit', v_subscription.leads_limit
    );
  END IF;

  -- Pode gerar leads
  RETURN json_build_object(
    'can_generate', true,
    'reason', 'success',
    'message', 'Leads disponíveis',
    'leads_remaining', v_subscription.leads_remaining,
    'leads_limit', v_subscription.leads_limit
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'can_generate', false,
      'reason', 'error',
      'message', 'Erro ao verificar disponibilidade: ' || SQLERRM,
      'leads_remaining', 0,
      'leads_limit', 0
    );
END;
$$;


