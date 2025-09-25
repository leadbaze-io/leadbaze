-- =====================================================
-- VERIFICAR FUNÇÕES EXISTENTES DE REATIVAÇÃO
-- =====================================================

-- 1. Listar todas as funções que contêm "reactivate" no nome
SELECT 
  proname as function_name,
  proargnames as parameters,
  proargtypes::regtype[] as parameter_types,
  prosrc as source_code
FROM pg_proc 
WHERE proname ILIKE '%reactivate%'
ORDER BY proname;

-- 2. Listar todas as funções relacionadas a subscription
SELECT 
  proname as function_name,
  proargnames as parameters,
  proargtypes::regtype[] as parameter_types
FROM pg_proc 
WHERE proname ILIKE '%subscription%'
ORDER BY proname;

-- 3. Verificar constraints da tabela user_subscriptions
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'user_subscriptions'::regclass
ORDER BY conname;


