-- =====================================================
-- FUNÇÃO PARA VERIFICAR ELEGIBILIDADE DE REEMBOLSO
-- =====================================================

-- Remover função existente se houver
DROP FUNCTION IF EXISTS is_eligible_for_refund(UUID);

-- Função para verificar se uma assinatura é elegível para reembolso
CREATE OR REPLACE FUNCTION is_eligible_for_refund(
  subscription_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription RECORD;
  v_days_since_creation INTEGER;
  v_refund_period_days INTEGER := 7; -- 7 dias para reembolso
  v_result JSON;
BEGIN
  -- Buscar dados da assinatura
  SELECT 
    ups.id,
    ups.user_id,
    ups.created_at,
    ups.status,
    pp.display_name as plan_name,
    pp.price_cents
  INTO v_subscription
  FROM user_payment_subscriptions ups
  JOIN payment_plans pp ON ups.plan_id = pp.id
  WHERE ups.id = subscription_id;

  -- Verificar se a assinatura existe
  IF NOT FOUND THEN
    RETURN json_build_object(
      'eligible', false,
      'reason', 'subscription_not_found',
      'message', 'Assinatura não encontrada'
    );
  END IF;

  -- Verificar se a assinatura está ativa
  IF v_subscription.status != 'active' THEN
    RETURN json_build_object(
      'eligible', false,
      'reason', 'subscription_not_active',
      'message', 'Assinatura não está ativa'
    );
  END IF;

  -- Calcular dias desde a criação
  v_days_since_creation := EXTRACT(DAYS FROM (NOW() - v_subscription.created_at));

  -- Verificar se está dentro do período de reembolso
  IF v_days_since_creation <= v_refund_period_days THEN
    RETURN json_build_object(
      'eligible', true,
      'reason', 'within_refund_period',
      'message', 'Dentro do período de reembolso',
      'days_since_creation', v_days_since_creation,
      'days_remaining', v_refund_period_days - v_days_since_creation,
      'subscription_id', v_subscription.id,
      'plan_name', v_subscription.plan_name,
      'price_cents', v_subscription.price_cents,
      'created_at', v_subscription.created_at
    );
  ELSE
    RETURN json_build_object(
      'eligible', false,
      'reason', 'refund_period_expired',
      'message', 'Período de reembolso expirado',
      'days_since_creation', v_days_since_creation,
      'days_remaining', 0,
      'subscription_id', v_subscription.id,
      'plan_name', v_subscription.plan_name,
      'price_cents', v_subscription.price_cents,
      'created_at', v_subscription.created_at
    );
  END IF;
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION is_eligible_for_refund(UUID) IS 'Verifica se uma assinatura é elegível para reembolso baseado no período de 7 dias';

-- Testar a função
-- SELECT is_eligible_for_refund('seu-subscription-id-aqui');
