-- Debug ultra simples da campanha
-- Campanha: a7893400-44cb-4da0-989a-710a61e2ce33

-- 1. Dados da campanha
SELECT 'DADOS DA CAMPANHA:' as info;
SELECT 
  id,
  name,
  selected_lists_count,
  ignored_lists_count,
  total_leads,
  unique_leads
FROM campaigns 
WHERE id = 'a7893400-44cb-4da0-989a-710a61e2ce33';

-- 2. Contadores reais
SELECT 'CONTADORES REAIS:' as info;
SELECT 
  'Listas selecionadas' as tipo,
  COUNT(*) as quantidade
FROM campaign_lists 
WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33' 
AND status = 'selected'

UNION ALL

SELECT 
  'Listas ignoradas' as tipo,
  COUNT(*) as quantidade
FROM campaign_lists 
WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33' 
AND status = 'ignored'

UNION ALL

SELECT 
  'Total de leads' as tipo,
  COUNT(*) as quantidade
FROM campaign_unique_leads 
WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33';

-- 3. Listas com leads mas não associadas
SELECT 'LISTAS ÓRFÃS (com leads mas não associadas):' as info;
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


















