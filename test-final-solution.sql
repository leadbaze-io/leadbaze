-- Script para testar a solução final
-- Execute este script no Supabase

-- 1. Verificar estado atual da campanha "Teste 2"
SELECT 
  id,
  name,
  unique_leads_count,
  total_leads,
  selected_lists_count,
  ignored_lists_count,
  updated_at
FROM bulk_campaigns 
WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';

-- 2. Verificar leads na tabela campaign_leads
SELECT 
  COUNT(*) as total_leads,
  COUNT(DISTINCT lead_hash) as unique_leads,
  COUNT(DISTINCT list_id) as unique_lists
FROM campaign_leads 
WHERE campaign_id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';

-- 3. Verificar alguns leads específicos
SELECT 
  list_id,
  lead_hash,
  lead_data->>'name' as name,
  lead_data->>'phone' as phone
FROM campaign_leads 
WHERE campaign_id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080'
LIMIT 5;



















