-- Script final para corrigir o problema das campanhas
-- Execute este SQL no Supabase

-- 1. Verificar todas as campanhas atuais
SELECT 
  id,
  name,
  status,
  total_leads,
  unique_leads,
  selected_lists_count,
  ignored_lists_count,
  created_at,
  updated_at
FROM campaigns
ORDER BY created_at DESC;

-- 2. Verificar campanhas com nomes suspeitos ou dados zerados
SELECT 
  id,
  name,
  status,
  total_leads,
  unique_leads,
  selected_lists_count,
  created_at
FROM campaigns
WHERE name LIKE '%asdasd%' 
   OR name LIKE '%test%'
   OR name LIKE '%teste%'
   OR (total_leads = 0 OR total_leads IS NULL)
   OR (unique_leads = 0 OR unique_leads IS NULL)
ORDER BY created_at DESC;

-- 3. Verificar se há dados nas tabelas relacionadas
SELECT 
  'campaign_unique_leads' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT campaign_id) as unique_campaigns
FROM campaign_unique_leads
UNION ALL
SELECT 
  'campaign_lists' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT campaign_id) as unique_campaigns
FROM campaign_lists;

-- 4. Forçar atualização de contadores de todas as campanhas
DO $$
DECLARE
  campaign_record RECORD;
BEGIN
  FOR campaign_record IN 
    SELECT id FROM campaigns
  LOOP
    PERFORM update_campaign_counters(campaign_record.id);
  END LOOP;
  
  RAISE NOTICE 'Contadores atualizados para todas as campanhas';
END;
$$;

-- 5. Verificar se os contadores foram atualizados
SELECT 
  id,
  name,
  status,
  total_leads,
  unique_leads,
  selected_lists_count,
  ignored_lists_count,
  updated_at
FROM campaigns
ORDER BY updated_at DESC;

-- 6. Identificar campanhas órfãs (sem dados relacionados)
SELECT 
  c.id,
  c.name,
  c.status,
  c.total_leads,
  c.unique_leads,
  c.selected_lists_count,
  c.created_at
FROM campaigns c
LEFT JOIN campaign_unique_leads cul ON c.id = cul.campaign_id
LEFT JOIN campaign_lists cl ON c.id = cl.campaign_id
WHERE cul.campaign_id IS NULL 
  AND cl.campaign_id IS NULL
  AND c.created_at < NOW() - INTERVAL '1 hour' -- Apenas campanhas antigas
ORDER BY c.created_at DESC;

-- 7. Limpar campanhas órfãs (CUIDADO: Execute apenas se confirmar que são dados inválidos)
-- DELETE FROM campaigns 
-- WHERE id IN (
--   SELECT c.id
--   FROM campaigns c
--   LEFT JOIN campaign_unique_leads cul ON c.id = cul.campaign_id
--   LEFT JOIN campaign_lists cl ON c.id = cl.campaign_id
--   WHERE cul.campaign_id IS NULL 
--     AND cl.campaign_id IS NULL
--     AND c.created_at < NOW() - INTERVAL '1 hour'
-- );

-- 8. Verificar estado final
SELECT 
  COUNT(*) as total_campaigns,
  COUNT(CASE WHEN total_leads > 0 THEN 1 END) as campaigns_with_leads,
  COUNT(CASE WHEN total_leads = 0 OR total_leads IS NULL THEN 1 END) as empty_campaigns,
  COUNT(CASE WHEN name LIKE '%asdasd%' OR name LIKE '%test%' THEN 1 END) as test_campaigns
FROM campaigns;

-- 9. Verificar se os triggers estão funcionando
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('campaign_unique_leads', 'campaign_lists')
  AND trigger_name LIKE '%counter%';



















