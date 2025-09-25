-- =====================================================
-- FUNÇÃO PARA HISTÓRICO DE ATIVIDADES DA ASSINATURA
-- =====================================================

CREATE OR REPLACE FUNCTION get_subscription_activity_history(
  p_user_id UUID,
  p_subscription_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_activities JSON;
BEGIN
  -- Para usuários com trial gratuito (sem assinatura real), retornar atividades básicas
  IF p_subscription_id IS NULL THEN
    -- Verificar se o usuário tem leads bônus
    IF EXISTS (SELECT 1 FROM user_profiles WHERE user_id = p_user_id AND bonus_leads > 0) THEN
      RETURN json_build_object(
        'success', true,
        'data', json_build_array(
          json_build_object(
            'id', 'bonus-leads-given',
            'type', 'leads_bonus',
            'title', 'Leads Bônus Recebidos',
            'description', 'Você recebeu 30 leads bônus para testar o sistema',
            'timestamp', NOW()::text,
            'status', 'success',
            'details', json_build_object(
              'leads_consumed', 0,
              'leads_remaining', 30
            )
          )
        )
      );
    ELSE
      RETURN json_build_object(
        'success', true,
        'data', json_build_array()
      );
    END IF;
  END IF;

  -- Para assinaturas reais, buscar histórico das tabelas
  WITH activity_data AS (
    -- Atividades de assinatura
    SELECT 
      ups.id::text as id,
      'subscription_created' as type,
      'Assinatura Criada' as title,
      'Sua assinatura foi criada com sucesso' as description,
      ups.created_at::text as timestamp,
      'success' as status,
      json_build_object(
        'plan_name', pp.display_name,
        'price', pp.price_cents / 100.0
      ) as details
    FROM user_payment_subscriptions ups
    JOIN payment_plans pp ON ups.plan_id = pp.id
    WHERE ups.user_id = p_user_id
      AND ups.id = p_subscription_id
    
    UNION ALL
    
    -- Atividades de leads consumidos (simuladas baseadas no perfil do usuário)
    SELECT 
      'lead-consumption-' || up.user_id::text as id,
      'leads_consumed' as type,
      'Leads Consumidos' as title,
      'Leads foram consumidos para geração' as description,
      up.updated_at::text as timestamp,
      'info' as status,
      json_build_object(
        'leads_consumed', up.bonus_leads_used,
        'reason', 'lead_generation'
      ) as details
    FROM user_profiles up
    WHERE up.user_id = p_user_id
      AND up.bonus_leads_used > 0
    
    -- Atividades de pagamento serão adicionadas quando a tabela payment_transactions for criada
  )
  SELECT json_build_object(
    'success', true,
    'data', COALESCE(json_agg(
      json_build_object(
        'id', id,
        'type', type,
        'title', title,
        'description', description,
        'timestamp', timestamp,
        'status', status,
        'details', details
      )
    ), '[]'::json)
  ) INTO v_activities
  FROM activity_data
  ORDER BY timestamp DESC;

  RETURN v_activities;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Erro ao buscar histórico: ' || SQLERRM
    );
END;
$$;
