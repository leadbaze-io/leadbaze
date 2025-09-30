-- Correção simples da campanha
-- Campanha: a7893400-44cb-4da0-989a-710a61e2ce33

-- 1. Primeiro, vamos ver o estado atual
SELECT 'ESTADO ATUAL:' as info;

-- Dados da campanha
SELECT 
  'Campanha' as tipo,
  selected_lists_count::text as contador_campanhas,
  ignored_lists_count::text as contador_ignoradas,
  total_leads::text as total_leads_campanha,
  unique_leads::text as unique_leads_campanha
FROM campaigns 
WHERE id = 'a7893400-44cb-4da0-989a-710a61e2ce33'

UNION ALL

-- Dados reais do banco
SELECT 
  'Real' as tipo,
  (SELECT COUNT(*) FROM campaign_lists WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33' AND status = 'selected')::text,
  (SELECT COUNT(*) FROM campaign_lists WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33' AND status = 'ignored')::text,
  (SELECT COUNT(*) FROM campaign_unique_leads WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33')::text,
  (SELECT COUNT(*) FROM campaign_unique_leads WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33')::text;

-- 2. Identificar listas que têm leads mas não estão na campaign_lists
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

-- 3. Adicionar as listas que estão faltando (comentado por segurança)
-- Descomente as linhas abaixo para executar a correção:

/*
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
*/

-- 5. Verificar estado após correção (execute após descomentar e executar as correções acima)
SELECT 'ESTADO APÓS CORREÇÃO:' as info;

-- Dados da campanha após correção
SELECT 
  'Campanha' as tipo,
  selected_lists_count::text as contador_campanhas,
  ignored_lists_count::text as contador_ignoradas,
  total_leads::text as total_leads_campanha,
  unique_leads::text as unique_leads_campanha
FROM campaigns 
WHERE id = 'a7893400-44cb-4da0-989a-710a61e2ce33'

UNION ALL

-- Dados reais do banco após correção
SELECT 
  'Real' as tipo,
  (SELECT COUNT(*) FROM campaign_lists WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33' AND status = 'selected')::text,
  (SELECT COUNT(*) FROM campaign_lists WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33' AND status = 'ignored')::text,
  (SELECT COUNT(*) FROM campaign_unique_leads WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33')::text,
  (SELECT COUNT(*) FROM campaign_unique_leads WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33')::text;
