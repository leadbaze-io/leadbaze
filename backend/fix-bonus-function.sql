-- =====================================================
-- CORRIGIR FUNÇÃO DE LEADS BÔNUS
-- =====================================================

-- Função corrigida para dar 30 leads bônus para novos usuários
CREATE OR REPLACE FUNCTION give_bonus_leads_to_new_user(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bonus_leads INTEGER := 30;
BEGIN
  -- Atualizar leads bônus para usuários que já têm perfil
  UPDATE user_profiles 
  SET 
    bonus_leads = v_bonus_leads,
    bonus_leads_used = 0,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Se não atualizou nenhuma linha, significa que o usuário não tem perfil
  -- Nesse caso, não fazemos nada (o perfil será criado pelo signup normal)
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Usuário não tem perfil ainda - leads bônus serão dados quando o perfil for criado',
      'bonus_leads', 0
    );
  END IF;
  
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












