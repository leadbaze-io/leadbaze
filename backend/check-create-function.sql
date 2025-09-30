-- Verificar se a função create_recurring_subscription existe
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'create_recurring_subscription'
  AND routine_schema = 'public';

