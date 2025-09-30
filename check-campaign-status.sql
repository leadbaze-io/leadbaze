-- Verificar status atual da campanha
-- Campanha: a7893400-44cb-4da0-989a-710a61e2ce33

-- 1. Status da campanha
SELECT 'STATUS DA CAMPANHA:' as info;
SELECT 
  id,
  name,
  selected_lists_count,
  ignored_lists_count,
  total_leads,
  unique_leads
FROM campaigns 
WHERE id = 'a7893400-44cb-4da0-989a-710a61e2ce33';

-- 2. Listas associadas
SELECT 'LISTAS ASSOCIADAS:' as info;
SELECT 
  list_id,
  status,
  created_at
FROM campaign_lists 
WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33'
ORDER BY created_at;

-- 3. Leads na campanha
SELECT 'LEADS NA CAMPANHA:' as info;
SELECT 
  COUNT(*) as total_leads,
  COUNT(DISTINCT list_id) as listas_com_leads
FROM campaign_unique_leads 
WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33';

-- 4. Leads por lista
SELECT 'LEADS POR LISTA:' as info;
SELECT 
  list_id,
  COUNT(*) as leads_count
FROM campaign_unique_leads 
WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33'
GROUP BY list_id
ORDER BY leads_count DESC
LIMIT 10;


















