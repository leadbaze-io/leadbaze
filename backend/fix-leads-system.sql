-- =====================================================
-- CORREÇÃO DO SISTEMA DE LEADS BÔNUS
-- Migrando referência de user_subscriptions (inexistente) para user_profiles
-- =====================================================

-- 1. Atualizar user_profiles do usuário específico
DO $$
BEGIN
  UPDATE user_profiles 
  SET 
    bonus_leads = 100,
    bonus_leads_used = 0,
    updated_at = NOW()
  WHERE user_id = 'd9eb0ed5-f0f5-4a57-a422-2be5b293558e';
END $$;

-- 2. Redefinir funçao get_user_leads_status para usar user_profiles
CREATE OR REPLACE FUNCTION get_user_leads_status(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile RECORD;
  v_remaining_bonus INTEGER;
  v_total_available INTEGER;
BEGIN
  -- Buscar perfil do usuário
  SELECT * INTO v_profile
  FROM user_profiles
  WHERE user_id = p_user_id;
  
  IF v_profile IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Perfil não encontrado'
    );
  END IF;
  
  -- Calcular leads disponíveis (Bônus)
  -- Assumindo que por enquanto só temos bônus funcionais via user_profiles
  v_remaining_bonus := GREATEST(0, COALESCE(v_profile.bonus_leads, 0) - COALESCE(v_profile.bonus_leads_used, 0));
  v_total_available := v_remaining_bonus;
  
  RETURN json_build_object(
    'success', true,
    'user_id', p_user_id,
    'bonus_leads', COALESCE(v_profile.bonus_leads, 0),
    'bonus_leads_used', COALESCE(v_profile.bonus_leads_used, 0),
    'remaining_bonus', v_remaining_bonus,
    'has_subscription', false, -- Simplificado para focar no bônus
    'subscription', json_build_object(
      'plan_name', 'bonus',
      'display_name', 'Leads Bônus',
      'leads_remaining', 0,
      'status', 'active'
    ),
    'total_available', v_total_available,
    'total_used', COALESCE(v_profile.bonus_leads_used, 0)
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erro ao buscar status: ' || SQLERRM
    );
END;
$$;

-- 3. Redefinir funçao consume_lead_simple para usar user_profiles
CREATE OR REPLACE FUNCTION consume_lead_simple(p_user_id UUID, p_quantity INTEGER DEFAULT 1)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile RECORD;
  v_remaining_bonus INTEGER;
BEGIN
  -- Buscar perfil
  SELECT * INTO v_profile
  FROM user_profiles
  WHERE user_id = p_user_id; /*PK check handled by system usually, but user_id is the logical key here*/
  
  IF v_profile IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'user_not_found',
      'message', 'Usuário não encontrado'
    );
  END IF;
  
  -- Calcular bônus disponível
  v_remaining_bonus := GREATEST(0, COALESCE(v_profile.bonus_leads, 0) - COALESCE(v_profile.bonus_leads_used, 0));
  
  -- Verificar disponibilidade
  IF v_remaining_bonus < p_quantity THEN
    RETURN json_build_object(
      'success', false,
      'error', 'insufficient_leads',
      'message', 'Leads bônus insuficientes',
      'available', v_remaining_bonus,
      'requested', p_quantity
    );
  END IF;
  
  -- Consumir leads bônus
  UPDATE user_profiles 
  SET bonus_leads_used = COALESCE(bonus_leads_used, 0) + p_quantity
  WHERE user_id = p_user_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Leads bônus consumidos',
    'consumed_bonus', p_quantity,
    'consumed_subscription', 0,
    'remaining_bonus', v_remaining_bonus - p_quantity,
    'remaining_subscription', 0
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erro ao consumir leads: ' || SQLERRM
    );
END;
$$;
