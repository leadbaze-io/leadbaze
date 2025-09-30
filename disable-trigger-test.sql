-- Teste: Desabilitar temporariamente o trigger para verificar se ele é o culpado

-- 1. Ver triggers ativos na tabela campaign_leads
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'campaign_leads'
ORDER BY trigger_name;

-- 2. Desabilitar temporariamente o trigger (se existir)
-- NOTA: Substitua 'nome_do_trigger' pelo nome real do trigger
-- ALTER TRIGGER nome_do_trigger ON campaign_leads DISABLE;

-- 3. Verificar se o trigger foi desabilitado
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'campaign_leads'
ORDER BY trigger_name;

-- 4. Para reabilitar depois do teste:
-- ALTER TRIGGER nome_do_trigger ON campaign_leads ENABLE;
