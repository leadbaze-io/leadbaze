-- Verificar e corrigir a constraint UNIQUE definitivamente
-- Execute este SQL no Supabase

-- 1. Verificar constraints atuais
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'campaign_leads'
AND tc.constraint_type = 'UNIQUE';

-- 2. Remover constraint existente (se houver)
ALTER TABLE campaign_leads DROP CONSTRAINT IF EXISTS campaign_leads_unique_lead_per_campaign;

-- 3. Recriar constraint UNIQUE
ALTER TABLE campaign_leads 
ADD CONSTRAINT campaign_leads_unique_lead_per_campaign 
UNIQUE (campaign_id, lead_hash);

-- 4. Verificar se foi criada
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'campaign_leads'
AND tc.constraint_type = 'UNIQUE';

-- 5. Limpar dados existentes para teste
DELETE FROM campaign_leads;

-- 6. Verificar se foi limpo
SELECT COUNT(*) as remaining_records FROM campaign_leads;
