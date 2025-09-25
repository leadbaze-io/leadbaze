-- Função simplificada de histórico de atividades
-- Usa apenas tabelas que existem: user_profiles e user_payment_subscriptions

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
            'timestamp', (SELECT created_at FROM user_profiles WHERE user_id = p_user_id LIMIT 1),
            'status', 'success',
            'details', json_build_object(
              'leads_consumed', (SELECT bonus_leads_used FROM user_profiles WHERE user_id = p_user_id LIMIT 1),
              'leads_remaining', (SELECT bonus_leads - bonus_leads_used FROM user_profiles WHERE user_id = p_user_id LIMIT 1)
            )
          )
        )
      );
    ELSE
      RETURN json_build_object('success', true, 'data', '[]');
    END IF;
  END IF;

  -- Para assinaturas reais, retornar atividades da assinatura
  WITH subscription_activities AS (
    -- Atividade de criação da assinatura
    SELECT 
      ups.id::text as id,
      'subscription_created' as type,
      'Assinatura Criada' as title,
      'Sua assinatura foi criada com sucesso' as description,
      ups.created_at::text as timestamp,
      'success' as status,
      json_build_object(
        'plan_name', pp.display_name,
        'price', pp.price_cents / 100.0,
        'leads_included', pp.leads_included
      ) as details
    FROM user_payment_subscriptions ups
    JOIN payment_plans pp ON ups.plan_id = pp.id
    WHERE ups.id = p_subscription_id
      AND ups.user_id = p_user_id
    
    UNION ALL
    
    -- Atividade de status da assinatura
    SELECT 
      'status-' || ups.id::text as id,
      CASE 
        WHEN ups.status = 'active' THEN 'subscription_active'
        WHEN ups.status = 'cancelled' THEN 'subscription_cancelled'
        WHEN ups.status = 'suspended' THEN 'subscription_suspended'
        ELSE 'subscription_pending'
      END as type,
      CASE 
        WHEN ups.status = 'active' THEN 'Assinatura Ativa'
        WHEN ups.status = 'cancelled' THEN 'Assinatura Cancelada'
        WHEN ups.status = 'suspended' THEN 'Assinatura Suspensa'
        ELSE 'Assinatura Pendente'
      END as title,
      CASE 
        WHEN ups.status = 'active' THEN 'Sua assinatura está ativa e funcionando'
        WHEN ups.status = 'cancelled' THEN 'Sua assinatura foi cancelada'
        WHEN ups.status = 'suspended' THEN 'Sua assinatura foi suspensa'
        ELSE 'Aguardando ativação da assinatura'
      END as description,
      ups.updated_at::text as timestamp,
      CASE 
        WHEN ups.status = 'active' THEN 'success'
        WHEN ups.status = 'cancelled' THEN 'error'
        WHEN ups.status = 'suspended' THEN 'warning'
        ELSE 'info'
      END as status,
      json_build_object(
        'status', ups.status,
        'leads_balance', ups.leads_balance,
        'current_period_end', ups.current_period_end
      ) as details
    FROM user_payment_subscriptions ups
    WHERE ups.id = p_subscription_id
      AND ups.user_id = p_user_id
    
    UNION ALL
    
    -- Atividades de leads da assinatura (quando há consumo)
    SELECT 
      'subscription-leads-' || ups.id::text as id,
      'subscription_leads_consumed' as type,
      'Leads da Assinatura Consumidos' as title,
      'Leads da sua assinatura foram consumidos para geração' as description,
      ups.updated_at::text as timestamp,
      'info' as status,
      json_build_object(
        'leads_consumed', pp.leads_included - ups.leads_balance,
        'leads_remaining', ups.leads_balance,
        'leads_total', pp.leads_included,
        'reason', 'lead_generation'
      ) as details
    FROM user_payment_subscriptions ups
    JOIN payment_plans pp ON ups.plan_id = pp.id
    WHERE ups.id = p_subscription_id
      AND ups.user_id = p_user_id
      AND ups.leads_balance < pp.leads_included
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
      ) ORDER BY timestamp DESC
    ), '[]')
  ) INTO v_activities
  FROM subscription_activities;

  RETURN v_activities;
END;
$$;
