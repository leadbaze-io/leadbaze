-- Verificar triggers na tabela campaign_leads que podem estar interferindo

-- 1. Ver todos os triggers na tabela campaign_leads
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement,
    action_orientation
FROM information_schema.triggers 
WHERE event_object_table = 'campaign_leads'
ORDER BY trigger_name;

-- 2. Verificar se há triggers AFTER INSERT/UPDATE/DELETE
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'campaign_leads'
AND action_timing = 'AFTER'
ORDER BY trigger_name;

-- 3. Verificar se a função update_campaign_total_leads está sendo chamada
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'campaign_leads'
AND action_statement ILIKE '%update_campaign_total_leads%';

-- 4. Verificar se há algum trigger que faz UPDATE em bulk_campaigns
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE action_statement ILIKE '%bulk_campaigns%'
ORDER BY trigger_name;
