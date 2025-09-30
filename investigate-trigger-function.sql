-- Investigar a função update_updated_at_column()
-- Verificar se ela está interferindo com a mensagem

-- 1. Ver a definição da função
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'update_updated_at_column';

-- 2. Ver todos os triggers na tabela bulk_campaigns
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement,
    action_orientation
FROM information_schema.triggers 
WHERE event_object_table = 'bulk_campaigns'
ORDER BY trigger_name;

-- 3. Verificar se há outras funções que podem estar interferindo
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND (
    routine_definition ILIKE '%bulk_campaigns%' 
    OR routine_definition ILIKE '%message%'
    OR routine_definition ILIKE '%updated_at%'
);

-- 4. Verificar se há algum trigger AFTER UPDATE que pode estar sobrescrevendo
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'bulk_campaigns'
AND action_timing = 'AFTER'
AND event_manipulation = 'UPDATE';

-- 5. Testar a função diretamente (se possível)
-- SELECT update_updated_at_column();
