-- =====================================================
-- CRIAR FUNÇÃO SIMPLES DE CANCELAMENTO
-- =====================================================

-- Remover função existente se houver
DROP FUNCTION IF EXISTS cancel_recurring_subscription(UUID, TEXT, TEXT);

-- Criar função simplificada
CREATE OR REPLACE FUNCTION cancel_recurring_subscription(
  p_user_id UUID,
  p_preapproval_id TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription_id UUID;
  v_result JSON;
BEGIN
  -- Buscar assinatura ativa ou pausada
  SELECT id INTO v_subscription_id
  FROM user_subscriptions
  WHERE user_id = p_user_id 
    AND mercado_pago_preapproval_id = p_preapproval_id
    AND status = 'active'
    AND recurring_status IN ('active', 'paused');
  
  -- Verificar se assinatura existe
  IF v_subscription_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Assinatura recorrente não encontrada'
    );
  END IF;
  
  -- Cancelar assinatura
  UPDATE user_subscriptions 
  SET 
    status = 'cancelled',
    recurring_status = 'cancelled',
    cancel_reason = p_reason,
    cancelled_at = NOW(),
    updated_at = NOW()
  WHERE id = v_subscription_id;
  
  -- Registrar no histórico
  INSERT INTO leads_usage_history (
    user_id,
    subscription_id,
    leads_generated,
    operation_type,
    operation_reason,
    remaining_leads
  ) VALUES (
    p_user_id,
    v_subscription_id,
    0,
    'subscription_cancelled',
    COALESCE(p_reason, 'Assinatura cancelada pelo usuário'),
    (SELECT leads_remaining FROM user_subscriptions WHERE id = v_subscription_id)
  );
  
  RETURN json_build_object(
    'success', true,
    'message', 'Assinatura cancelada com sucesso'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLSTATE,
      'message', SQLERRM
    );
END;
$$;

