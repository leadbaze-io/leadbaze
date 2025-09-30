-- Verificar parâmetros da função cancel_recurring_subscription
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

