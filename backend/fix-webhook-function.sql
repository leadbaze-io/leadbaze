-- =====================================================
-- CORRIGIR FUNÇÃO DE WEBHOOK PARA CANCELAR ASSINATURA ANTERIOR
-- =====================================================

CREATE OR REPLACE FUNCTION process_recurring_subscription_webhook(
  p_preapproval_id TEXT,
  p_status TEXT,
  p_payment_id TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription RECORD;
  v_user_id UUID;
  v_affected_rows INTEGER;
BEGIN
  -- Buscar a assinatura pendente pelo preapproval_id
  SELECT us.*, us.user_id INTO v_subscription, v_user_id
  FROM user_subscriptions us
  WHERE us.mercado_pago_preapproval_id = p_preapproval_id
    AND us.status = 'pending'
  LIMIT 1;

  IF v_subscription IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Assinatura pendente não encontrada'
    );
  END IF;

  -- Se o status for 'authorized' ou 'approved', ativar a assinatura
  IF p_status IN ('authorized', 'approved') THEN
    -- 1. PRIMEIRO: Cancelar todas as assinaturas ativas do usuário
    UPDATE user_subscriptions 
    SET 
      status = 'cancelled',
      recurring_status = 'cancelled',
      cancelled_at = NOW(),
      cancel_reason = 'Substituída por nova assinatura paga',
      updated_at = NOW()
    WHERE user_id = v_user_id 
      AND status = 'active'
      AND id != v_subscription.id;

    -- 2. SEGUNDO: Ativar a nova assinatura
    UPDATE user_subscriptions 
    SET 
      status = 'active',
      recurring_status = 'active',
      updated_at = NOW()
    WHERE id = v_subscription.id;

    -- Verificar quantas linhas foram afetadas
    GET DIAGNOSTICS v_affected_rows = ROW_COUNT;

    RETURN json_build_object(
      'success', true,
      'message', 'Assinatura ativada com sucesso',
      'subscription_id', v_subscription.id,
      'user_id', v_user_id,
      'rows_affected', v_affected_rows
    );

  ELSIF p_status IN ('cancelled', 'rejected') THEN
    -- Cancelar a assinatura pendente
    UPDATE user_subscriptions 
    SET 
      status = 'cancelled',
      recurring_status = 'cancelled',
      cancelled_at = NOW(),
      cancel_reason = 'Pagamento ' || p_status,
      updated_at = NOW()
    WHERE id = v_subscription.id;

    RETURN json_build_object(
      'success', true,
      'message', 'Assinatura cancelada',
      'subscription_id', v_subscription.id,
      'user_id', v_user_id
    );

  ELSE
    RETURN json_build_object(
      'success', false,
      'message', 'Status não reconhecido: ' || p_status
    );
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Erro ao processar webhook: ' || SQLERRM
    );
END;
$$;

