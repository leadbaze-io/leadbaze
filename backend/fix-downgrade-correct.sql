-- =====================================================
-- CORRIGIR FUNÇÃO DE DOWNGRADE - MUDANÇA PARA PRÓXIMO PAGAMENTO
-- =====================================================

CREATE OR REPLACE FUNCTION downgrade_user_subscription(
  p_user_id UUID,
  p_new_plan_id UUID,
  p_downgrade_reason TEXT DEFAULT 'Solicitado pelo usuário'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_subscription RECORD;
  v_new_plan RECORD;
BEGIN
  -- Buscar assinatura ativa atual
  SELECT us.*, sp.price_monthly, sp.display_name
  INTO v_current_subscription
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  -- Verificar se existe assinatura ativa
  IF v_current_subscription IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'no_active_subscription',
      'message', 'Nenhuma assinatura ativa encontrada'
    );
  END IF;
  
  -- Buscar novo plano
  SELECT id, name, display_name, price_monthly, leads_limit
  INTO v_new_plan
  FROM subscription_plans
  WHERE id = p_new_plan_id AND is_active = true;
  
  -- Verificar se plano existe
  IF v_new_plan IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'plan_not_found',
      'message', 'Plano de destino não encontrado'
    );
  END IF;
  
  -- Verificar se é realmente um downgrade (mais barato)
  IF v_new_plan.price_monthly >= v_current_subscription.price_monthly THEN
    RETURN json_build_object(
      'success', false,
      'error', 'not_downgrade',
      'message', 'Operação não é um downgrade válido'
    );
  END IF;
  
  -- Marcar para downgrade no próximo ciclo (não altera imediatamente)
  UPDATE user_subscriptions 
  SET 
    pending_plan_id = p_new_plan_id,
    pending_plan_change_reason = p_downgrade_reason,
    updated_at = NOW()
  WHERE id = v_current_subscription.id;
  
  -- Registrar downgrade pendente no histórico
  INSERT INTO leads_usage_history (
    user_id,
    subscription_id,
    leads_generated,
    operation_type,
    operation_reason,
    remaining_leads
  ) VALUES (
    p_user_id,
    v_current_subscription.id,
    0,
    'subscription_downgrade_pending',
    p_downgrade_reason,
    v_current_subscription.leads_remaining
  );
  
  -- Retornar resultado
  RETURN json_build_object(
    'success', true,
    'message', 'Downgrade agendado para o próximo ciclo de cobrança',
    'current_plan', v_current_subscription.display_name,
    'current_plan_price', v_current_subscription.price_monthly,
    'current_leads_limit', v_current_subscription.leads_limit,
    'new_plan', v_new_plan.display_name,
    'new_plan_price', v_new_plan.price_monthly,
    'new_leads_limit', v_new_plan.leads_limit,
    'note', 'O downgrade será aplicado no próximo pagamento automático'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'database_error',
      'message', 'Erro ao agendar downgrade: ' || SQLERRM
    );
END;
$$;

