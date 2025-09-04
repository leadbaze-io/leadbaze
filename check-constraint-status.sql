-- Verificar se a constraint UNIQUE está realmente ativa
-- Execute este SQL no Supabase

-- 1. Verificar constraints ativas
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'campaign_leads'
ORDER BY tc.constraint_type, kcu.ordinal_position;

-- 2. Verificar se há duplicatas atuais
SELECT 
  campaign_id,
  lead_hash,
  COUNT(*) as count
FROM campaign_leads
GROUP BY campaign_id, lead_hash
HAVING COUNT(*) > 1;

-- 3. Verificar dados atuais
SELECT 
  campaign_id,
  COUNT(*) as total_records,
  COUNT(DISTINCT lead_hash) as unique_hashes
FROM campaign_leads
GROUP BY campaign_id;
