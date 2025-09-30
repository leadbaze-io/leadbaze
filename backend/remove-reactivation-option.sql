-- =====================================================
-- REMOVER OPÇÃO DE REATIVAÇÃO DE ASSINATURAS
-- =====================================================
-- Após cancelamento com reembolso, usuário deve assinar novo plano

-- 1. Remover função de reativação
DROP FUNCTION IF EXISTS reactivate_user_subscription(UUID);

-- 2. Atualizar função de cancelamento para ser mais clara
CREATE OR REPLACE FUNCTION cancel_user_subscription(
  p_user_id UUID,
  p_cancel_reason TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription RECORD;
  v_result JSON;
BEGIN
  -- Buscar assinatura ativa
  SELECT 
    us.id,
    us.plan_id,
    us.status,
    us.leads_remaining,
    us.mercado_pago_payment_id,
    sp.display_name,
    sp.price_monthly
  INTO v_subscription
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id 
    AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;

  -- Verificar se existe assinatura ativa
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Nenhuma assinatura ativa encontrada'
    );
  END IF;

  -- Cancelar assinatura (mantém acesso até o fim do período)
  UPDATE user_subscriptions 
  SET 
    status = 'cancelled',
    cancel_reason = p_cancel_reason,
    cancelled_at = NOW(),
    updated_at = NOW()
  WHERE id = v_subscription.id;

  -- Registrar cancelamento no histórico
  INSERT INTO leads_usage_history (
    user_id,
    subscription_id,
    leads_generated,
    operation_type,
    operation_reason,
    remaining_leads
  ) VALUES (
    p_user_id,
    v_subscription.id,
    0,
    'subscription_cancelled',
    COALESCE(p_cancel_reason, 'Assinatura cancelada pelo usuário'),
    v_subscription.leads_remaining
  );

  -- Retornar sucesso com informações importantes
  RETURN json_build_object(
    'success', true,
    'message', 'Assinatura cancelada com sucesso. Você pode continuar usando os leads restantes até o fim do período. Para continuar após isso, será necessário assinar um novo plano.',
    'subscription_id', v_subscription.id,
    'plan_name', v_subscription.display_name,
    'leads_remaining', v_subscription.leads_remaining,
    'current_period_end', (SELECT current_period_end FROM user_subscriptions WHERE id = v_subscription.id),
    'refund_info', 'Reembolso será processado conforme política do Mercado Pago',
    'next_steps', 'Após o período atual, assine um novo plano para continuar usando o sistema'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLSTATE,
      'message', 'Erro ao cancelar assinatura: ' || SQLERRM
    );
END;
$$;

-- 3. Atualizar função que busca assinatura para ser mais clara sobre cancelamento
CREATE OR REPLACE FUNCTION get_user_subscription_with_cancelled(
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
  -- Buscar assinatura ativa ou cancelada no período
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
    us.cancelled_at,
    us.cancel_reason,
    us.mercado_pago_payment_id,
    us.refund_id,
    us.refund_status,
    us.refund_amount,
    sp.name as plan_name,
    sp.display_name as plan_display_name,
    sp.price_monthly,
    sp.leads_limit,
    sp.features
  INTO v_subscription
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id 
    AND (
      us.status = 'active' 
      OR (us.status = 'cancelled' AND us.current_period_end > NOW())
    )
  ORDER BY us.created_at DESC
  LIMIT 1;

  -- Verificar se existe assinatura
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Nenhuma assinatura encontrada'
    );
  END IF;

  -- Retornar dados da assinatura com informações sobre cancelamento
  RETURN json_build_object(
    'success', true,
    'data', json_build_object(
      'id', v_subscription.id,
      'user_id', v_subscription.user_id,
      'plan_id', v_subscription.plan_id,
      'status', v_subscription.status,
      'billing_cycle', v_subscription.billing_cycle,
      'current_period_start', v_subscription.current_period_start,
      'current_period_end', v_subscription.current_period_end,
      'leads_used', v_subscription.leads_used,
      'leads_remaining', v_subscription.leads_remaining,
      'auto_renewal', v_subscription.auto_renewal,
      'gateway_subscription_id', v_subscription.gateway_subscription_id,
      'gateway_customer_id', v_subscription.gateway_customer_id,
      'created_at', v_subscription.created_at,
      'updated_at', v_subscription.updated_at,
      'cancelled_at', v_subscription.cancelled_at,
      'cancel_reason', v_subscription.cancel_reason,
      'mercado_pago_payment_id', v_subscription.mercado_pago_payment_id,
      'refund_id', v_subscription.refund_id,
      'refund_status', v_subscription.refund_status,
      'refund_amount', v_subscription.refund_amount,
      'plan_name', v_subscription.plan_name,
      'plan_display_name', v_subscription.plan_display_name,
      'price_monthly', v_subscription.price_monthly,
      'leads_limit', v_subscription.leads_limit,
      'features', v_subscription.features,
      'is_cancelled', (v_subscription.status = 'cancelled'),
      'can_reactivate', false, -- Sempre false após cancelamento
      'requires_new_subscription', (v_subscription.status = 'cancelled'),
      'cancellation_message', CASE 
        WHEN v_subscription.status = 'cancelled' THEN 
          'Assinatura cancelada. Para continuar após ' || 
          to_char(v_subscription.current_period_end, 'DD/MM/YYYY') || 
          ', assine um novo plano.'
        ELSE NULL
      END
    ),
    'message', 'Assinatura encontrada'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLSTATE,
      'message', 'Erro ao buscar assinatura: ' || SQLERRM
    );
END;
$$;

-- 4. Comentários das funções
COMMENT ON FUNCTION cancel_user_subscription IS 'Cancela assinatura com reembolso - usuário deve assinar novo plano para continuar';
COMMENT ON FUNCTION get_user_subscription_with_cancelled IS 'Busca assinatura com informações sobre cancelamento e necessidade de nova assinatura';

-- 5. Verificar se as funções foram atualizadas
SELECT 
  proname as function_name,
  proargnames as parameters
FROM pg_proc 
WHERE proname IN ('cancel_user_subscription', 'get_user_subscription_with_cancelled')
ORDER BY proname;


