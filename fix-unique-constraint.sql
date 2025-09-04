-- Recriar a constraint UNIQUE para evitar duplicatas
-- Execute este SQL no Supabase

-- 1. Recriar a constraint UNIQUE
ALTER TABLE campaign_leads 
ADD CONSTRAINT campaign_leads_unique_lead_per_campaign 
UNIQUE (campaign_id, lead_hash);

-- 2. Verificar se foi criada
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'campaign_leads'
AND tc.constraint_type = 'UNIQUE';
