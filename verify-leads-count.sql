-- Verificar e corrigir contagem de leads
-- Campanha: a7893400-44cb-4da0-989a-710a61e2ce33

-- 1. Verificar contagem atual
SELECT 'CONTAGEM ATUAL:' as info;
SELECT 
  'Campanha' as tipo,
  total_leads as total_leads_campanha,
  unique_leads as unique_leads_campanha
FROM campaigns 
WHERE id = 'a7893400-44cb-4da0-989a-710a61e2ce33'

UNION ALL

SELECT 
  'Real' as tipo,
  (SELECT COUNT(*) FROM campaign_unique_leads WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33') as total_leads_campanha,
  (SELECT COUNT(*) FROM campaign_unique_leads WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33') as unique_leads_campanha;

-- 2. Verificar leads por lista
SELECT 'LEADS POR LISTA:' as info;
SELECT 
  list_id,
  COUNT(*) as leads_count
FROM campaign_unique_leads 
WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33'
GROUP BY list_id
ORDER BY leads_count DESC;

-- 3. Verificar se há leads órfãos (sem lista associada)
SELECT 'LEADS ÓRFÃOS:' as info;
SELECT 
  COUNT(*) as orphaned_leads
FROM campaign_unique_leads cul
LEFT JOIN campaign_lists cl ON cul.campaign_id = cl.campaign_id AND cul.list_id = cl.list_id
WHERE cul.campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33'
AND cl.list_id IS NULL;

-- 4. Atualizar contadores da campanha
UPDATE campaigns 
SET 
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
  selected_lists_count = (
    SELECT COUNT(DISTINCT list_id) 
    FROM campaign_unique_leads 
    WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33'
  )
WHERE id = 'a7893400-44cb-4da0-989a-710a61e2ce33';

-- 5. Verificar contagem após correção
SELECT 'CONTAGEM APÓS CORREÇÃO:' as info;
SELECT 
  'Campanha' as tipo,
  total_leads as total_leads_campanha,
  unique_leads as unique_leads_campanha,
  selected_lists_count as listas_selecionadas
FROM campaigns 
WHERE id = 'a7893400-44cb-4da0-989a-710a61e2ce33'

UNION ALL

SELECT 
  'Real' as tipo,
  (SELECT COUNT(*) FROM campaign_unique_leads WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33') as total_leads_campanha,
  (SELECT COUNT(*) FROM campaign_unique_leads WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33') as unique_leads_campanha,
  (SELECT COUNT(DISTINCT list_id) FROM campaign_unique_leads WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33') as listas_selecionadas;


















