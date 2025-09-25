-- Migrar leads da tabela antiga para a nova tabela
-- Execute este SQL no Supabase

-- 1. Migrar leads de campaign_leads para campaign_unique_leads
INSERT INTO campaign_unique_leads (
  campaign_id,
  list_id,
  lead_name,
  lead_phone,
  lead_email,
  lead_company,
  lead_position,
  phone_hash,
  created_at
)
SELECT 
  campaign_id,
  list_id,
  lead_data->>'name' as lead_name,
  lead_data->>'phone' as lead_phone,
  lead_data->>'email' as lead_email,
  lead_data->>'company' as lead_company,
  lead_data->>'position' as lead_position,
  lead_hash as phone_hash,
  added_at as created_at
FROM campaign_leads
WHERE campaign_id = 'c7402e33-332b-436e-a747-d5eb4bd4a142'
ON CONFLICT (campaign_id, phone_hash) DO NOTHING;

-- 2. Verificar se a migração funcionou
SELECT 
  COUNT(*) as total_migrated_leads
FROM campaign_unique_leads
WHERE campaign_id = 'c7402e33-332b-436e-a747-d5eb4bd4a142';

-- 3. Verificar alguns leads migrados
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



















