-- DEBUG DO ERRO DE CONSTRAINT

-- 1. VERIFICAR EXATAMENTE QUAIS ASSINATURAS ESTÃO ATIVAS
SELECT 
  'ASSINATURAS ATIVAS' as tipo,
  us.id,
  us.user_id,
  sp.display_name as plan_name,
  us.status,
  us.created_at,
  us.updated_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = '5069fa1e-5de4-44f8-9f45-8ef95a57f0b0' 
  AND us.status = 'active'
ORDER BY us.created_at DESC;

-- 2. VERIFICAR TODAS AS ASSINATURAS (ATIVAS E CANCELADAS)
SELECT 
  'TODAS AS ASSINATURAS' as tipo,
  us.id,
  us.user_id,
  sp.display_name as plan_name,
  us.status,
  us.created_at,
  us.updated_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = '5069fa1e-5de4-44f8-9f45-8ef95a57f0b0'
ORDER BY us.created_at DESC;

-- 3. VERIFICAR SE A CONSTRAINT ESTÁ FUNCIONANDO
-- Tentar inserir uma assinatura duplicada para ver o erro
INSERT INTO user_subscriptions (
  user_id,
  plan_id,
  status,
  billing_cycle,
  current_period_start,
  current_period_end,
  leads_used,
  leads_remaining,
  auto_renewal,
  gateway_subscription_id,
  gateway_customer_id
) VALUES (
  '5069fa1e-5de4-44f8-9f45-8ef95a57f0b0',
  (SELECT id FROM subscription_plans WHERE name = 'start' LIMIT 1),
  'active',
  'monthly',
  NOW(),
  NOW() + INTERVAL '30 days',
  0,
  1000,
  true,
  'test-duplicate-constraint',
  'test-customer'
);

-- 4. VERIFICAR SE HÁ TRIGGERS QUE PODEM ESTAR CRIANDO NOVAS ASSINATURAS
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'user_subscriptions';

-- 5. VERIFICAR SE HÁ FUNÇÕES QUE PODEM ESTAR SENDO CHAMADAS AUTOMATICAMENTE
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE prosrc LIKE '%user_subscriptions%' 
  AND proname != 'cancel_user_subscription'
  AND proname != 'downgrade_user_subscription'
  AND proname != 'get_user_subscription'
  AND proname != 'reactivate_user_subscription';



