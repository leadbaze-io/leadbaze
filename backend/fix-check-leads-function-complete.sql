-- =====================================================
-- CORRIGIR FUNÇÃO DE VERIFICAÇÃO DE LEADS COMPLETA
-- =====================================================

CREATE OR REPLACE FUNCTION check_leads_availability_simple(
  p_user_id UUID,
  p_leads_to_generate INTEGER DEFAULT 1
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bonus_leads INTEGER := 0;
  v_bonus_leads_used INTEGER := 0;
  v_subscription_leads INTEGER := 0;
  v_subscription_leads_used INTEGER := 0;
  v_total_available INTEGER := 0;
  v_total_used INTEGER := 0;
  v_leads_remaining INTEGER := 0;
  v_can_generate BOOLEAN := false;
  v_reason TEXT := 'no_active_subscription';
  v_message TEXT := 'Assinatura necessária para gerar leads';
  v_has_active_subscription BOOLEAN := false;
BEGIN
  -- Buscar leads bônus do usuário
  SELECT 
    COALESCE(bonus_leads, 0),
    COALESCE(bonus_leads_used, 0)
  INTO v_bonus_leads, v_bonus_leads_used
  FROM user_profiles
  WHERE user_id = p_user_id;
  
  -- Buscar leads da assinatura (se existir)
  SELECT 
    COALESCE(pp.leads_included, 0),
    COALESCE(pp.leads_included - ups.leads_balance, 0)
  INTO v_subscription_leads, v_subscription_leads_used
  FROM user_payment_subscriptions ups
  JOIN payment_plans pp ON ups.plan_id = pp.id
  WHERE ups.user_id = p_user_id 
    AND ups.status = 'active'
    AND ups.current_period_end > NOW();
  
  -- Verificar se tem assinatura ativa
  v_has_active_subscription := (v_subscription_leads > 0);
  
  -- Calcular totais
  IF v_has_active_subscription THEN
    -- Se há assinatura ativa, usar apenas leads da assinatura
    v_total_available := v_subscription_leads;
    v_total_used := v_subscription_leads_used;
    v_leads_remaining := v_total_available - v_total_used;
    
    -- Verificar se pode gerar
    IF v_leads_remaining >= p_leads_to_generate THEN
      v_can_generate := true;
      v_reason := 'sufficient_leads';
      v_message := 'Leads suficientes disponíveis';
    ELSE
      v_can_generate := false;
      v_reason := 'insufficient_leads';
      v_message := 'Leads insuficientes na assinatura';
    END IF;
  ELSE
    -- Se não há assinatura, usar apenas leads bônus
    v_total_available := v_bonus_leads;
    v_total_used := v_bonus_leads_used;
    v_leads_remaining := v_total_available - v_total_used;
    
    -- Verificar se pode gerar
    IF v_leads_remaining >= p_leads_to_generate THEN
      v_can_generate := true;
      v_reason := 'sufficient_leads';
      v_message := 'Leads bônus suficientes disponíveis';
    ELSE
      v_can_generate := false;
      v_reason := 'insufficient_leads';
      v_message := 'Leads bônus insuficientes';
    END IF;
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'can_generate', v_can_generate,
    'reason', v_reason,
    'message', v_message,
    'leads_remaining', v_leads_remaining,
    'leads_limit', v_total_available,
    'bonus_leads', v_bonus_leads,
    'bonus_leads_used', v_bonus_leads_used,
    'subscription_leads', v_subscription_leads,
    'subscription_leads_used', v_subscription_leads_used,
    'has_active_subscription', v_has_active_subscription
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'can_generate', false,
      'reason', 'error',
      'message', 'Erro ao verificar leads: ' || SQLERRM,
      'leads_remaining', 0,
      'leads_limit', 0
    );
END;
$$;










