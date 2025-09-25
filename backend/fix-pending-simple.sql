-- Correção simples e direta da função
-- Primeiro, vamos ver o que está acontecendo
SELECT 
    us.id,
    us.user_id,
    us.status,
    us.recurring_status,
    us.plan_id,
    sp.display_name as plan_name,
    us.leads_used,
    us.leads_remaining,
    us.updated_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = '84d176eb-4f23-4a18-ac6e-6a867ca90967'
ORDER BY us.updated_at DESC;

-- Agora vamos corrigir a função de forma mais simples
DROP FUNCTION IF EXISTS get_user_subscription_with_free_trial(UUID);

CREATE OR REPLACE FUNCTION get_user_subscription_with_free_trial(
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription RECORD;
  v_result JSON;
BEGIN
  -- Buscar APENAS assinaturas ativas ou canceladas no período
  -- EXCLUIR completamente assinaturas pending
  SELECT 
    us.id,
    us.user_id,
    us.plan_id,
    us.status,
    us.billing_cycle,
    us.current_period_start,
    us.current_period_end,
    us.leads_used,
    us.leads_remaining,
    us.auto_renewal,
    us.gateway_subscription_id,
    us.gateway_customer_id,
    us.created_at,
    us.updated_at,
    sp.display_name as plan_display_name,
    sp.name as plan_name,
    sp.leads_limit,
    sp.features,
    sp.price_monthly,
    sp.price_yearly
  INTO v_subscription
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
    AND us.status = 'active' -- APENAS ativas
    AND (
      sp.price_monthly > 0 -- Planos pagos ativos
      OR sp.price_monthly = 0 -- Planos gratuitos ativos
    )
  ORDER BY 
    CASE 
      WHEN sp.price_monthly > 0 THEN 1 -- Priorizar planos pagos
      ELSE 2 -- Planos gratuitos
    END,
    us.updated_at DESC
  LIMIT 1;

  -- Se não encontrou assinatura ativa, retornar null
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Retornar dados da assinatura
  v_result := json_build_object(
    'id', v_subscription.id,
    'user_id', v_subscription.user_id,
    'plan_id', v_subscription.plan_id,
    'status', v_subscription.status,
    'billing_cycle', v_subscription.billing_cycle,
    'current_period_start', v_subscription.current_period_start,
    'current_period_end', v_subscription.current_period_end,
    'leads_used', v_subscription.leads_used,
    'leads_remaining', v_subscription.leads_remaining,
    'leads_limit', v_subscription.leads_limit,
    'auto_renewal', v_subscription.auto_renewal,
    'gateway_subscription_id', v_subscription.gateway_subscription_id,
    'gateway_customer_id', v_subscription.gateway_customer_id,
    'created_at', v_subscription.created_at,
    'updated_at', v_subscription.updated_at,
    'plan_display_name', v_subscription.plan_display_name,
    'plan_name', v_subscription.plan_name,
    'price_monthly', v_subscription.price_monthly,
    'price_yearly', v_subscription.price_yearly,
    'features', v_subscription.features,
    'is_free_trial', (v_subscription.plan_name = 'free_trial'),
    'total_leads', v_subscription.leads_used + v_subscription.leads_remaining
  );

  RETURN v_result;
END;
$$;

-- Testar a função corrigida
SELECT 'Testando função corrigida:' as test;
SELECT get_user_subscription_with_free_trial('84d176eb-4f23-4a18-ac6e-6a867ca90967') as result;

-- Verificar se agora retorna NULL para assinaturas pending
SELECT 
    CASE 
        WHEN get_user_subscription_with_free_trial('84d176eb-4f23-4a18-ac6e-6a867ca90967') IS NULL 
        THEN '✅ CORRETO - Função retorna NULL para assinaturas pending'
        ELSE '❌ ERRO - Função ainda retorna dados'
    END as test_result;

