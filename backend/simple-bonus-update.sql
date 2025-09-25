-- =====================================================
-- ATUALIZAR LEADS BÔNUS SIMPLES
-- =====================================================

-- Função muito simples que apenas atualiza leads bônus
CREATE OR REPLACE FUNCTION give_bonus_leads_to_new_user(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bonus_leads INTEGER := 30;
BEGIN
  -- Apenas atualizar leads bônus se o usuário já tem perfil
  UPDATE user_profiles 
  SET 
    bonus_leads = v_bonus_leads,
    bonus_leads_used = 0,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Leads bônus atualizados com sucesso',
    'bonus_leads', v_bonus_leads
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erro ao atualizar leads bônus: ' || SQLERRM
    );
END;
$$;




