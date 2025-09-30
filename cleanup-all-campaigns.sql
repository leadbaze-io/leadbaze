-- Limpar TODAS as campanhas existentes e recomeçar com dados limpos
-- Execute este SQL no Supabase

-- 1. Verificar dados atuais de todas as campanhas
SELECT 
  campaign_id,
  COUNT(*) as total_records,
  COUNT(DISTINCT lead_hash) as unique_leads,
  COUNT(*) - COUNT(DISTINCT lead_hash) as duplicates
FROM campaign_leads 
GROUP BY campaign_id
ORDER BY campaign_id;

-- 2. Verificar todas as duplicatas existentes
SELECT 
  campaign_id,
  lead_hash,
  COUNT(*) as count
FROM campaign_leads
GROUP BY campaign_id, lead_hash
HAVING COUNT(*) > 1
ORDER BY campaign_id, count DESC;

-- 3. Limpar TODOS os dados de TODAS as campanhas
DELETE FROM campaign_leads;

-- 4. Verificar se foi limpo completamente
SELECT COUNT(*) as remaining_records FROM campaign_leads;

-- 5. Verificar se a constraint UNIQUE ainda está ativa
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'campaign_leads'
AND tc.constraint_type = 'UNIQUE';

-- 6. Verificar estrutura final da tabela
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'campaign_leads'
ORDER BY ordinal_position;
