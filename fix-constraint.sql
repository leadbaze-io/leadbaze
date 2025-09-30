-- Script para corrigir a constraint que pode estar causando o erro 400
-- Execute este SQL no Supabase

-- 1. Remover constraint UNIQUE problemática
ALTER TABLE campaign_leads DROP CONSTRAINT IF EXISTS campaign_leads_campaign_id_lead_hash_key;

-- 2. Verificar se foi removida
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'campaign_leads'
AND tc.constraint_type = 'UNIQUE';

-- 3. Se necessário, recriar a constraint com um nome mais específico
-- ALTER TABLE campaign_leads ADD CONSTRAINT campaign_leads_unique_lead_per_campaign 
-- UNIQUE (campaign_id, lead_hash);
