-- Recriar associações de listas baseado nos leads existentes
-- Campanha: a7893400-44cb-4da0-989a-710a61e2ce33

-- 1. Verificar estado atual
SELECT 'ESTADO ATUAL:' as info;
SELECT 
  'Campanha' as tipo,
  selected_lists_count as contador_campanhas,
  total_leads as total_leads_campanha
FROM campaigns 
WHERE id = 'a7893400-44cb-4da0-989a-710a61e2ce33'

UNION ALL

SELECT 
  'Real' as tipo,
  (SELECT COUNT(*) FROM campaign_lists WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33' AND status = 'selected') as contador_campanhas,
  (SELECT COUNT(*) FROM campaign_unique_leads WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33') as total_leads_campanha;

-- 2. Identificar listas que têm leads mas não estão associadas
SELECT 'LISTAS COM LEADS MAS NÃO ASSOCIADAS:' as info;
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

-- 3. Recriar associações das listas
INSERT INTO campaign_lists (campaign_id, list_id, status)
SELECT DISTINCT 
  cul.campaign_id,
  cul.list_id,
  'selected'
FROM campaign_unique_leads cul
LEFT JOIN campaign_lists cl ON cul.campaign_id = cl.campaign_id AND cul.list_id = cl.list_id
WHERE cul.campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33'
AND cl.list_id IS NULL;

-- 4. Atualizar contadores da campanha
UPDATE campaigns 
SET 
  selected_lists_count = (
    SELECT COUNT(DISTINCT list_id) 
    FROM campaign_lists 
    WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33' 
    AND status = 'selected'
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
  )
WHERE id = 'a7893400-44cb-4da0-989a-710a61e2ce33';

-- 5. Verificar estado após correção
SELECT 'ESTADO APÓS CORREÇÃO:' as info;
SELECT 
  'Campanha' as tipo,
  selected_lists_count as contador_campanhas,
  total_leads as total_leads_campanha
FROM campaigns 
WHERE id = 'a7893400-44cb-4da0-989a-710a61e2ce33'

UNION ALL

SELECT 
  'Real' as tipo,
  (SELECT COUNT(*) FROM campaign_lists WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33' AND status = 'selected') as contador_campanhas,
  (SELECT COUNT(*) FROM campaign_unique_leads WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33') as total_leads_campanha;

-- 6. Listar todas as listas associadas
SELECT 'LISTAS ASSOCIADAS:' as info;
SELECT 
  cl.list_id,
  cl.status,
  ll.name as list_name,
  (SELECT COUNT(*) FROM campaign_unique_leads WHERE campaign_id = cl.campaign_id AND list_id = cl.list_id) as leads_count
FROM campaign_lists cl
LEFT JOIN lead_lists ll ON cl.list_id = ll.id
WHERE cl.campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33'
ORDER BY leads_count DESC;


















