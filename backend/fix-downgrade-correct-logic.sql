-- =====================================================
-- CORRIGIR LÓGICA DE DOWNGRADE - SEM CRÉDITO, MANTER LEADS
-- =====================================================

CREATE OR REPLACE FUNCTION downgrade_user_subscription_correct(
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
  v_result JSON;
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
  
  -- Atualizar assinatura mantendo leads restantes e data original
  UPDATE user_subscriptions 
  SET 
    plan_id = p_new_plan_id,
    -- MANTER os leads restantes atuais (não alterar)
    -- leads_remaining permanece o mesmo
    downgrade_count = downgrade_count + 1,
    updated_at = NOW()
  WHERE id = v_current_subscription.id;
  
  -- Registrar mudança no histórico
  INSERT INTO subscription_changes (
    user_id,
    subscription_id,
    change_type,
    from_plan_id,
    to_plan_id,
    from_price,
    to_price,
    price_difference,
    change_reason
  ) VALUES (
    p_user_id,
    v_current_subscription.id,
    'downgrade',
    v_current_subscription.plan_id,
    p_new_plan_id,
    v_current_subscription.price_monthly,
    v_new_plan.price_monthly,
    0, -- Sem diferença de preço (sem crédito)
    p_downgrade_reason
  );
  
  -- Retornar resultado
  v_result := json_build_object(
    'success', true,
    'message', 'Downgrade realizado com sucesso',
    'old_plan', v_current_subscription.display_name,
    'new_plan', v_new_plan.display_name,
    'leads_remaining', v_current_subscription.leads_remaining, -- Manter leads atuais
    'note', 'Leads restantes foram preservados. Novo limite será aplicado no próximo ciclo de cobrança.'
  );
  
  RETURN v_result;
END;
$$;

