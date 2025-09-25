-- Limpar listas duplicadas da campanha
-- Campanha: a7893400-44cb-4da0-989a-710a61e2ce33

-- 1. Verificar duplicatas atuais
SELECT 'DUPLICATAS ATUAIS:' as info;
SELECT 
  list_id,
  COUNT(*) as count
FROM campaign_lists 
WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33'
GROUP BY list_id
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 2. Remover duplicatas (manter apenas o primeiro registro)
DELETE FROM campaign_lists 
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY campaign_id, list_id ORDER BY created_at) as rn
    FROM campaign_lists 
    WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33'
  ) t
  WHERE rn > 1
);

-- 3. Verificar resultado
SELECT 'APÓS LIMPEZA:' as info;
SELECT 
  list_id,
  COUNT(*) as count
FROM campaign_lists 
WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33'
GROUP BY list_id
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 4. Contar total de listas únicas
SELECT 'TOTAL DE LISTAS ÚNICAS:' as info;
SELECT COUNT(DISTINCT list_id) as total_listas_unicas
FROM campaign_lists 
WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33';

-- 5. Atualizar contador da campanha
UPDATE campaigns 
SET 
  selected_lists_count = (
    SELECT COUNT(DISTINCT list_id) 
    FROM campaign_lists 
    WHERE campaign_id = 'a7893400-44cb-4da0-989a-710a61e2ce33' 
    AND status = 'selected'
  )
WHERE id = 'a7893400-44cb-4da0-989a-710a61e2ce33';

-- 6. Verificar contador atualizado
SELECT 'CONTADOR ATUALIZADO:' as info;
SELECT 
  selected_lists_count,
  total_leads,
  unique_leads
FROM campaigns 
WHERE id = 'a7893400-44cb-4da0-989a-710a61e2ce33';


















