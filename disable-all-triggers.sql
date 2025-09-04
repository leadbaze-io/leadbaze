-- SOLUÇÃO TEMPORÁRIA: Desabilitar todos os triggers problemáticos
-- Isso vai permitir testar se eles são realmente a causa do problema

-- 1. Desabilitar todos os triggers que interferem
ALTER TRIGGER trigger_update_campaign_total_on_insert ON campaign_leads DISABLE;
ALTER TRIGGER trigger_update_campaign_total_on_update ON campaign_leads DISABLE;
ALTER TRIGGER trigger_update_campaign_total_on_delete ON campaign_leads DISABLE;

-- 2. Verificar se os triggers foram desabilitados
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'campaign_leads'
ORDER BY trigger_name;

-- 3. Para reabilitar depois do teste (execute quando confirmar que resolveu):
-- ALTER TRIGGER trigger_update_campaign_total_on_insert ON campaign_leads ENABLE;
-- ALTER TRIGGER trigger_update_campaign_total_on_update ON campaign_leads ENABLE;
-- ALTER TRIGGER trigger_update_campaign_total_on_delete ON campaign_leads ENABLE;

-- 4. NOTA: Com os triggers desabilitados, o campo total_leads não será atualizado automaticamente
-- Você pode atualizar manualmente se necessário:
-- UPDATE bulk_campaigns SET total_leads = count_campaign_leads(id) WHERE id = 'campaign_id';
