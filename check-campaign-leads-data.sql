-- Verificar dados de leads da campanha
-- Execute este SQL no Supabase

-- 1. Verificar se há dados na tabela campaign_leads
SELECT 
  COUNT(*) as total_leads,
  campaign_id
FROM campaign_leads
WHERE campaign_id = 'c7402e33-332b-436e-a747-d5eb4bd4a142'
GROUP BY campaign_id;

-- 2. Verificar alguns leads específicos
SELECT 
  id,
  campaign_id,
  list_id,
  lead_data,
  lead_hash,
  added_at
FROM campaign_leads
WHERE campaign_id = 'c7402e33-332b-436e-a747-d5eb4bd4a142'
LIMIT 5;

-- 3. Verificar estrutura do lead_data
SELECT 
  lead_data,
  jsonb_typeof(lead_data) as data_type,
  lead_data->>'name' as name,
  lead_data->>'phone' as phone
FROM campaign_leads
WHERE campaign_id = 'c7402e33-332b-436e-a747-d5eb4bd4a142'
LIMIT 1;

-- 4. Verificar se há dados na tabela campaign_unique_leads (NOVA TABELA)
SELECT 
  COUNT(*) as total_unique_leads,
  campaign_id
FROM campaign_unique_leads
WHERE campaign_id = 'c7402e33-332b-436e-a747-d5eb4bd4a142'
GROUP BY campaign_id;

-- 5. Verificar alguns leads da nova tabela
SELECT 
  id,
  campaign_id,
  list_id,
  lead_name,
  lead_phone,
  created_at
FROM campaign_unique_leads
WHERE campaign_id = 'c7402e33-332b-436e-a747-d5eb4bd4a142'
LIMIT 5;

-- 4. Verificar estrutura das tabelas
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('campaign_leads', 'campaign_unique_leads')
ORDER BY table_name, ordinal_position;
