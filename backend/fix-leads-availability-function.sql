-- =====================================================
-- CORRIGIR FUNÇÃO DE VERIFICAÇÃO DE LEADS PARA ASSINATURAS CANCELADAS
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
  v_leads_remaining INTEGER := 0;
  v_can_generate BOOLEAN := false;
  v_reason TEXT := 'no_active_subscription';
  v_message TEXT := 'Assinatura necessária para gerar leads';
  v_has_active_subscription BOOLEAN := false;
  v_subscription_status TEXT := 'none';
BEGIN
  -- Buscar leads bônus do usuário
  SELECT 
    COALESCE(bonus_leads, 0),
    COALESCE(bonus_leads_used, 0)
  INTO v_bonus_leads, v_bonus_leads_used
  FROM user_profiles
  WHERE user_id = p_user_id;
  
  -- Buscar leads da assinatura (ativa OU cancelada mas ainda com acesso)
  SELECT 
    COALESCE(ups.leads_balance, 0),
    COALESCE(pp.leads_included, 0),
    ups.status,
    CASE 
      WHEN ups.status = 'active' THEN true
      WHEN ups.status = 'cancelled' AND ups.current_period_end > NOW() THEN true
      ELSE false
    END
  INTO v_leads_remaining, v_subscription_leads, v_subscription_status, v_has_active_subscription
  FROM user_payment_subscriptions ups
  JOIN payment_plans pp ON ups.plan_id = pp.id
  WHERE ups.user_id = p_user_id 
    AND (ups.status = 'active' OR (ups.status = 'cancelled' AND ups.current_period_end > NOW()))
  ORDER BY ups.created_at DESC
  LIMIT 1;
  
  -- Se não encontrou assinatura válida, usar leads bônus
  IF v_leads_remaining IS NULL OR v_leads_remaining = 0 THEN
    v_leads_remaining := v_bonus_leads - v_bonus_leads_used;
    v_subscription_leads := v_bonus_leads;
    v_subscription_leads_used := v_bonus_leads_used;
    v_has_active_subscription := false;
    v_subscription_status := 'none';
  END IF;
  
  -- Verificar se pode gerar leads
  IF v_leads_remaining >= p_leads_to_generate THEN
    v_can_generate := true;
    IF v_has_active_subscription THEN
      v_reason := 'sufficient_subscription_leads';
      v_message := 'Leads da assinatura suficientes disponíveis';
    ELSE
      v_reason := 'sufficient_bonus_leads';
      v_message := 'Leads bônus suficientes disponíveis';
    END IF;
  ELSE
    v_can_generate := false;
    IF v_has_active_subscription THEN
      v_reason := 'insufficient_subscription_leads';
      v_message := 'Leads da assinatura insuficientes';
    ELSE
      v_reason := 'insufficient_bonus_leads';
      v_message := 'Leads bônus insuficientes';
    END IF;
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'can_generate', v_can_generate,
    'reason', v_reason,
    'message', v_message,
    'leads_remaining', v_leads_remaining,
    'leads_limit', v_subscription_leads,
    'bonus_leads', v_bonus_leads,
    'bonus_leads_used', v_bonus_leads_used,
    'subscription_leads', CASE WHEN v_has_active_subscription THEN v_subscription_leads ELSE NULL END,
    'subscription_leads_used', CASE WHEN v_has_active_subscription THEN v_subscription_leads - v_leads_remaining ELSE NULL END,
    'has_active_subscription', v_has_active_subscription,
    'subscription_status', v_subscription_status
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'can_generate', false,
      'reason', 'error',
      'message', 'Erro interno: ' || SQLERRM,
      'leads_remaining', 0,
      'leads_limit', 0,
      'bonus_leads', 0,
      'bonus_leads_used', 0,
      'subscription_leads', NULL,
      'subscription_leads_used', NULL,
      'has_active_subscription', false,
      'subscription_status', 'error'
    );
END;
$$;











