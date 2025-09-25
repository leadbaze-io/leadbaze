-- Correção ultra simples da campanha
-- Campanha: a7893400-44cb-4da0-989a-710a61e2ce33

-- 1. Verificar estado atual
SELECT 'ESTADO ATUAL:' as info;
SELECT 
  selected_lists_count,
  total_leads,
  unique_leads
FROM campaigns 
WHERE id = 'a7893400-44cb-4da0-989a-710a61e2ce33';

-- 2. Adicionar listas que estão faltando (mínimo necessário)
INSERT INTO campaign_lists (campaign_id, list_id, status)
SELECT DISTINCT 
  cul.campaign_id,
  cul.list_id,
  'selected'
FROM campaign_unique_leads cul
LEFT JOIN campaign_lists cl ON cul.campaign_id = cl.campaign_id AND cul.list_id = cl.list_id
WHERE cul.campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33'
AND cl.list_id IS NULL;

-- 3. Atualizar contadores da campanha
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
  )
WHERE id = 'a7893400-44cb-4da0-989a-710a61e2ce33';

-- 4. Verificar estado após correção
SELECT 'ESTADO APÓS CORREÇÃO:' as info;
SELECT 
  selected_lists_count,
  total_leads,
  unique_leads
FROM campaigns 
WHERE id = 'a7893400-44cb-4da0-989a-710a61e2ce33';

-- 5. Verificar quantas listas foram associadas
SELECT 'LISTAS ASSOCIADAS:' as info;
SELECT COUNT(*) as total_listas_associadas
FROM campaign_lists 
WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33' 
AND status = 'selected';


















