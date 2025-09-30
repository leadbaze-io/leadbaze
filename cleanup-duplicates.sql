-- Limpar duplicatas existentes na tabela campaign_leads
-- Execute este SQL no Supabase

-- 1. Verificar duplicatas
SELECT 
  campaign_id,
  lead_hash,
  COUNT(*) as count
FROM campaign_leads
GROUP BY campaign_id, lead_hash
HAVING COUNT(*) > 1;

-- 2. Remover duplicatas (manter apenas o primeiro)
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY campaign_id, lead_hash 
      ORDER BY added_at ASC
    ) as rn
  FROM campaign_leads
)
DELETE FROM campaign_leads 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 3. Verificar se ainda há duplicatas
SELECT 
  campaign_id,
  lead_hash,
  COUNT(*) as count
FROM campaign_leads
GROUP BY campaign_id, lead_hash
HAVING COUNT(*) > 1;
