-- Fix: Sincronizar dados da campanha
-- Campanha: a7893400-44cb-4da0-989a-710a61e2ce33

-- 1. Verificar estado atual
SELECT 'Estado atual:' as info;
SELECT 
  c.id,
  c.name,
  c.selected_lists_count,
  c.ignored_lists_count,
  c.total_leads,
  c.unique_leads,
  (SELECT COUNT(*) FROM campaign_lists WHERE campaign_id = c.id) as actual_lists_count,
  (SELECT COUNT(*) FROM campaign_unique_leads WHERE campaign_id = c.id) as actual_leads_count
FROM campaigns c
WHERE c.id = 'a7893400-44cb-4da0-989a-710a61e2ce33';

-- 2. Identificar listas que têm leads mas não estão na campaign_lists
SELECT 'Listas com leads mas não associadas:' as info;
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

-- 3. Adicionar listas que estão faltando na campaign_lists
INSERT INTO campaign_lists (campaign_id, list_id, status, created_at, updated_at)
SELECT DISTINCT 
  cul.campaign_id,
  cul.list_id,
  'selected' as status,
  NOW() as created_at,
  NOW() as updated_at
FROM campaign_unique_leads cul
LEFT JOIN campaign_lists cl ON cul.campaign_id = cl.campaign_id AND cul.list_id = cl.list_id
WHERE cul.campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33'
AND cl.list_id IS NULL;

-- 4. Atualizar contadores da campanha
UPDATE campaigns 
SET 
  selected_lists_count = (
    SELECT COUNT(*) 
    FROM campaign_lists 
    WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33' 
    AND status = 'selected'
  ),
  ignored_lists_count = (
    SELECT COUNT(*) 
    FROM campaign_lists 
    WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33' 
    AND status = 'ignored'
  ),
  total_leads = (
    SELECT COUNT(*) 
    FROM campaign_unique_leads 
    WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33'
  ),
  unique_leads = (
    SELECT COUNT(*) 
    FROM campaign_unique_leads 
    WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33'
  ),
  updated_at = NOW()
WHERE id = 'a7893400-44cb-4da0-989a-710a61e2ce33';

-- 5. Verificar estado após correção
SELECT 'Estado após correção:' as info;
SELECT 
  c.id,
  c.name,
  c.selected_lists_count,
  c.ignored_lists_count,
  c.total_leads,
  c.unique_leads,
  (SELECT COUNT(*) FROM campaign_lists WHERE campaign_id = c.id) as actual_lists_count,
  (SELECT COUNT(*) FROM campaign_unique_leads WHERE campaign_id = c.id) as actual_leads_count
FROM campaigns c
WHERE c.id = 'a7893400-44cb-4da0-989a-710a61e2ce33';

-- 6. Verificar listas associadas
SELECT 'Listas associadas:' as info;
SELECT 
  cl.list_id,
  cl.status,
  ll.name as list_name,
  (SELECT COUNT(*) FROM leads WHERE list_id = ll.id) as original_leads_count,
  (SELECT COUNT(*) FROM campaign_unique_leads WHERE campaign_id = cl.campaign_id AND list_id = cl.list_id) as campaign_leads_count
FROM campaign_lists cl
LEFT JOIN lead_lists ll ON cl.list_id = ll.id
WHERE cl.campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33'
ORDER BY cl.status, ll.name;
