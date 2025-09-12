-- Debug: Verificar dados da campanha específica
-- Campanha: a7893400-44cb-4da0-989a-710a61e2ce33

-- 1. Verificar dados da campanha
SELECT 
  id,
  name,
  user_id,
  status,
  selected_lists_count,
  ignored_lists_count,
  total_leads,
  unique_leads
FROM campaigns 
WHERE id = 'a7893400-44cb-4da0-989a-710a61e2ce33';

-- 2. Verificar listas associadas à campanha
SELECT 
  cl.list_id,
  cl.status,
  ll.name as list_name,
  (SELECT COUNT(*) FROM leads WHERE list_id = ll.id) as leads_count
FROM campaign_lists cl
LEFT JOIN lead_lists ll ON cl.list_id = ll.id
WHERE cl.campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33';

-- 3. Verificar leads únicos da campanha
SELECT 
  COUNT(*) as total_leads,
  COUNT(DISTINCT list_id) as unique_lists
FROM campaign_unique_leads 
WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33';

-- 4. Verificar leads por lista
SELECT 
  list_id,
  COUNT(*) as leads_count
FROM campaign_unique_leads 
WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33'
GROUP BY list_id
ORDER BY leads_count DESC;

-- 5. Verificar se há leads órfãos (sem lista associada)
SELECT 
  COUNT(*) as orphaned_leads
FROM campaign_unique_leads cul
LEFT JOIN campaign_lists cl ON cul.campaign_id = cl.campaign_id AND cul.list_id = cl.list_id
WHERE cul.campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33'
AND cl.list_id IS NULL;
