-- Testar se a função cancel_recurring_subscription existe
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'cancel_recurring_subscription'
  AND routine_schema = 'public';

