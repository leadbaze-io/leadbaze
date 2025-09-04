-- Script para debugar o problema da mensagem
-- Verificar a campanha específica "grrgdgf"

SELECT 
    id,
    name,
    message,
    created_at,
    updated_at,
    LENGTH(message) as message_length
FROM bulk_campaigns 
WHERE name = 'grrgdgf'
ORDER BY updated_at DESC;

-- Verificar todas as campanhas com mensagens não vazias
SELECT 
    id,
    name,
    message,
    updated_at,
    LENGTH(message) as message_length
FROM bulk_campaigns 
WHERE message IS NOT NULL 
AND message != ''
ORDER BY updated_at DESC
LIMIT 10;

-- Verificar se há algum trigger ou função que pode estar interferindo
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'bulk_campaigns';

-- Verificar se há alguma função que pode estar modificando a mensagem
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_definition ILIKE '%message%';
