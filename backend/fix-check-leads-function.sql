-- =====================================================
-- CORRIGIR FUNÇÃO DE VERIFICAÇÃO DE LEADS
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
  
  -- Se não encontrou assinatura, usar valores padrão
  IF v_subscription_leads IS NULL THEN
    v_subscription_leads := 0;
  END IF;
  
  IF v_subscription_leads_used IS NULL THEN
    v_subscription_leads_used := 0;
  END IF;
  
  -- Calcular totais
  -- Se há assinatura ativa, usar apenas leads da assinatura
  -- Se não há assinatura, usar apenas leads bônus
  IF v_subscription_leads > 0 THEN
    v_total_available := v_subscription_leads;
    v_total_used := v_subscription_leads_used;
  ELSE
    v_total_available := v_bonus_leads;
    v_total_used := v_bonus_leads_used;
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'can_generate', (v_total_available - v_total_used) >= p_leads_to_generate,
    'reason', CASE 
      WHEN (v_total_available - v_total_used) < p_leads_to_generate THEN 'insufficient_leads'
      WHEN (v_total_available - v_total_used) <= 0 THEN 'no_leads_remaining'
      WHEN v_total_available = 0 THEN 'no_active_subscription'
      ELSE 'sufficient_leads'
    END,
    'message', CASE 
      WHEN (v_total_available - v_total_used) < p_leads_to_generate THEN 
        CONCAT('Você precisa de ', p_leads_to_generate, ' leads, mas só tem ', (v_total_available - v_total_used), ' disponíveis')
      WHEN (v_total_available - v_total_used) <= 0 THEN 'Você não possui leads disponíveis'
      WHEN v_total_available = 0 THEN 'Você precisa de uma assinatura ativa para gerar leads'
      ELSE 'Leads disponíveis para geração'
    END,
    'bonus_leads', v_bonus_leads,
    'bonus_leads_used', v_bonus_leads_used,
    'subscription_leads', v_subscription_leads,
    'subscription_leads_used', v_subscription_leads_used,
    'total_available', v_total_available,
    'total_used', v_total_used,
    'remaining', v_total_available - v_total_used,
    'leads_remaining', v_total_available - v_total_used,
    'leads_limit', v_total_available,
    'leads_requested', p_leads_to_generate
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erro ao verificar leads: ' || SQLERRM
    );
END;
$$;
