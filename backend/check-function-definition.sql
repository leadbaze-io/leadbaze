-- Verificar a definição atual da função
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'get_user_subscription_with_free_trial'
  AND routine_schema = 'public';

-- Verificar se a função existe e está ativa
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'get_user_subscription_with_free_trial'
  AND routine_schema = 'public';

