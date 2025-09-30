-- =====================================================
-- CORREÇÃO SIMPLES DA FUNÇÃO
-- =====================================================

-- Primeiro, vamos ver a função atual
SELECT routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'check_leads_availability_simple';

-- Agora vamos criar uma versão corrigida
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
  v_leads_remaining INTEGER := 0;
  v_can_generate BOOLEAN := false;
  v_reason TEXT := 'no_active_subscription';
  v_message TEXT := 'Assinatura necessária para gerar leads';
BEGIN
  -- Buscar leads bônus do usuário
  SELECT 
    COALESCE(bonus_leads, 0),
    COALESCE(bonus_leads_used, 0)
  INTO v_bonus_leads, v_bonus_leads_used
  FROM user_profiles
  WHERE user_id = p_user_id;
  
  -- Calcular leads restantes
  v_leads_remaining := v_bonus_leads - v_bonus_leads_used;
  
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
  
  RETURN json_build_object(
    'success', true,
    'can_generate', v_can_generate,
    'reason', v_reason,
    'message', v_message,
    'leads_remaining', v_leads_remaining,
    'leads_limit', v_bonus_leads,
    'bonus_leads', v_bonus_leads,
    'bonus_leads_used', v_bonus_leads_used
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









