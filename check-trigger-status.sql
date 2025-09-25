-- Verificar se o trigger está ativo
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'n8n_blog_queue';

-- Verificar se a função existe
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%blog%' OR routine_name LIKE '%notify%';

-- Verificar posts pendentes
SELECT 
    id,
    title,
    processed,
    created_at,
    processed_at,
    error_message
FROM n8n_blog_queue 
WHERE processed = false 
ORDER BY created_at DESC 
LIMIT 5;






























