-- =====================================================
-- VERIFICAR SE A FUNÇÃO CANCEL_RECURRING_SUBSCRIPTION EXISTE
-- =====================================================

-- 1. Verificar se a função existe
SELECT 
    routine_name,
    routine_type,
    data_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'cancel_recurring_subscription'
  AND routine_schema = 'public';

-- 2. Verificar parâmetros da função
SELECT 
    parameter_name,
    parameter_mode,
    data_type,
    ordinal_position
FROM information_schema.parameters 
WHERE specific_name IN (
    SELECT specific_name 
    FROM information_schema.routines 
    WHERE routine_name = 'cancel_recurring_subscription'
      AND routine_schema = 'public'
)
ORDER BY ordinal_position;

-- 3. Verificar se a função está acessível
SELECT 
    has_function_privilege('postgres', 'cancel_recurring_subscription(uuid, text, text)', 'EXECUTE') as can_execute;

-- 4. Listar todas as funções relacionadas a subscription
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name LIKE '%subscription%'
  AND routine_schema = 'public'
ORDER BY routine_name;

-- 5. Verificar se a tabela user_subscriptions existe
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions'
  AND table_schema = 'public'
ORDER BY ordinal_position;

