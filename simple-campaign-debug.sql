-- Debug simples da campanha específica
-- Campanha: a7893400-44cb-4da0-989a-710a61e2ce33

-- 1. Verificar dados básicos da campanha
SELECT 
  id,
  name,
  user_id,
  status,
  selected_lists_count,
  ignored_lists_count,
  total_leads,
  unique_leads,
  created_at
FROM campaigns 
WHERE id = 'a7893400-44cb-4da0-989a-710a61e2ce33';

-- 2. Verificar quantos leads existem na campanha
SELECT 
  COUNT(*) as total_leads_in_campaign,
  COUNT(DISTINCT list_id) as unique_lists_with_leads
FROM campaign_unique_leads 
WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33';

-- 3. Verificar quantas listas estão associadas à campanha
SELECT 
  COUNT(*) as total_lists_associated,
  COUNT(CASE WHEN status = 'selected' THEN 1 END) as selected_lists,
  COUNT(CASE WHEN status = 'ignored' THEN 1 END) as ignored_lists
FROM campaign_lists 
WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33';

-- 4. Verificar quais listas têm leads mas não estão associadas
SELECT DISTINCT 
  cul.list_id,
  ll.name as list_name,
  COUNT(*) as leads_count
FROM campaign_unique_leads cul
LEFT JOIN lead_lists ll ON cul.list_id = ll.id
LEFT JOIN campaign_lists cl ON cul.campaign_id = cl.campaign_id AND cul.list_id = cl.list_id
WHERE cul.campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33'
AND cl.list_id IS NULL
GROUP BY cul.list_id, ll.name
ORDER BY leads_count DESC;

-- 5. Verificar leads por lista (primeiras 10)
SELECT 
  list_id,
  COUNT(*) as leads_count
FROM campaign_unique_leads 
WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33'
GROUP BY list_id
ORDER BY leads_count DESC
LIMIT 10;


















