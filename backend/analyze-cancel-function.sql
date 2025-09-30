-- ANÁLISE COMPLETA DA FUNÇÃO DE CANCELAMENTO NO BANCO

-- 1. VERIFICAR SE A FUNÇÃO EXISTE E SUA DEFINIÇÃO
SELECT 
  proname as function_name,
  prosrc as function_source,
  proargnames as argument_names,
  proargtypes::regtype[] as argument_types,
  prorettype::regtype as return_type
FROM pg_proc 
WHERE proname = 'cancel_user_subscription';

-- 2. VERIFICAR TODAS AS ASSINATURAS DO USUÁRIO DE TESTE
SELECT 
  us.id,
  us.user_id,
  sp.display_name as plan_name,
  us.status,
  us.created_at,
  us.updated_at,
  us.current_period_start,
  us.current_period_end,
  us.leads_used,
  us.leads_remaining
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = '5069fa1e-5de4-44f8-9f45-8ef95a57f0b0'
ORDER BY us.created_at DESC;

-- 3. VERIFICAR CONSTRAINT UNIQUE_ACTIVE_SUBSCRIPTION
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'unique_active_subscription';

-- 4. VERIFICAR SE HÁ MÚLTIPLAS ASSINATURAS ATIVAS (VIOLAÇÃO DA CONSTRAINT)
SELECT 
  user_id,
  COUNT(*) as active_subscriptions_count
FROM user_subscriptions 
WHERE user_id = '5069fa1e-5de4-44f8-9f45-8ef95a57f0b0' 
  AND status = 'active'
GROUP BY user_id;

-- 5. VERIFICAR TODAS AS ASSINATURAS ATIVAS NO SISTEMA
SELECT 
  user_id,
  COUNT(*) as active_count
FROM user_subscriptions 
WHERE status = 'active'
GROUP BY user_id
HAVING COUNT(*) > 1;

-- 6. TESTAR A FUNÇÃO DIRETAMENTE NO BANCO
SELECT cancel_user_subscription(
  '5069fa1e-5de4-44f8-9f45-8ef95a57f0b0'::UUID,
  'Teste de análise'::TEXT
) as function_result;

-- 7. VERIFICAR LOGS DE ERRO (se houver tabela de logs)
-- SELECT * FROM error_logs WHERE function_name = 'cancel_user_subscription' ORDER BY created_at DESC LIMIT 5;



