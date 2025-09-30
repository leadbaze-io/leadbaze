-- =====================================================
-- CORREÇÃO SIMPLES DO SISTEMA DE REATIVAÇÃO
-- =====================================================

-- 1. Remover função existente se houver conflito
DROP FUNCTION IF EXISTS reactivate_user_subscription(UUID);

-- 2. Criar função de reativação corrigida
CREATE OR REPLACE FUNCTION reactivate_user_subscription(
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription RECORD;
BEGIN
  -- Buscar assinatura cancelada no período
  SELECT 
    us.id,
    us.plan_id,
    us.status,
    us.current_period_end,
    us.leads_remaining,
    us.leads_used,
    sp.display_name,
    sp.leads_limit,
    sp.price_monthly
  INTO v_subscription
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id 
    AND us.status = 'cancelled'
    AND us.current_period_end > NOW()
  ORDER BY us.created_at DESC
  LIMIT 1;

  -- Verificar se existe assinatura cancelada no período
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Nenhuma assinatura cancelada encontrada no período atual'
    );
  END IF;

  -- Verificar se já existe assinatura ativa
  IF EXISTS (
    SELECT 1 FROM user_subscriptions 
    WHERE user_id = p_user_id AND status = 'active'
  ) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Já existe uma assinatura ativa para este usuário'
    );
  END IF;

  -- Reativar assinatura existente (não criar nova)
  UPDATE user_subscriptions 
  SET 
    status = 'active',
    cancelled_at = NULL,
    cancel_reason = NULL,
    updated_at = NOW()
  WHERE id = v_subscription.id;

  -- Registrar reativação no histórico
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
    'subscription_reactivated',
    'Assinatura reativada pelo usuário',
    v_subscription.leads_remaining
  );

  -- Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'message', 'Assinatura reativada com sucesso',
    'subscription_id', v_subscription.id,
    'plan_name', v_subscription.display_name,
    'leads_remaining', v_subscription.leads_remaining,
    'leads_used', v_subscription.leads_used,
    'leads_limit', v_subscription.leads_limit,
    'current_period_end', v_subscription.current_period_end
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLSTATE,
      'message', 'Erro ao reativar assinatura: ' || SQLERRM
    );
END;
$$;

-- 3. Criar índice único para evitar assinaturas ativas duplicadas
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_subscription_per_user_idx 
ON user_subscriptions (user_id) 
WHERE status = 'active';

-- 4. Verificar se há assinaturas ativas duplicadas e corrigir
WITH duplicate_active AS (
  SELECT user_id, COUNT(*) as count
  FROM user_subscriptions 
  WHERE status = 'active'
  GROUP BY user_id 
  HAVING COUNT(*) > 1
)
UPDATE user_subscriptions 
SET 
  status = 'cancelled',
  cancelled_at = NOW(),
  cancel_reason = 'Correção automática - assinatura duplicada',
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
    FROM user_subscriptions 
    WHERE status = 'active'
      AND user_id IN (SELECT user_id FROM duplicate_active)
  ) t 
  WHERE rn > 1
);

-- 5. Verificar se a função foi criada
SELECT 
  proname as function_name,
  proargnames as parameters
FROM pg_proc 
WHERE proname = 'reactivate_user_subscription';

-- 6. Verificar se o índice foi criado
SELECT 
  indexname as index_name
FROM pg_indexes 
WHERE indexname = 'unique_active_subscription_per_user_idx';


