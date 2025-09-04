-- Limpar dados da campanha específica e recriar sem duplicatas
-- Execute este SQL no Supabase

-- 1. Verificar dados atuais da campanha
SELECT 
  campaign_id,
  list_id,
  COUNT(*) as total_records,
  COUNT(DISTINCT lead_hash) as unique_leads
FROM campaign_leads 
WHERE campaign_id = 'acb05c70-3a0b-4f86-b4eb-177459aba267'
GROUP BY campaign_id, list_id;

-- 2. Verificar duplicatas específicas desta campanha
SELECT 
  campaign_id,
  lead_hash,
  COUNT(*) as count
FROM campaign_leads
WHERE campaign_id = 'acb05c70-3a0b-4f86-b4eb-177459aba267'
GROUP BY campaign_id, lead_hash
HAVING COUNT(*) > 1;

-- 3. Limpar TODOS os dados desta campanha
DELETE FROM campaign_leads 
WHERE campaign_id = 'acb05c70-3a0b-4f86-b4eb-177459aba267';

-- 4. Verificar se foi limpo
SELECT COUNT(*) as remaining_records 
FROM campaign_leads 
WHERE campaign_id = 'acb05c70-3a0b-4f86-b4eb-177459aba267';
