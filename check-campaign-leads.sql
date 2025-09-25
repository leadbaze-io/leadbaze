-- Script para verificar os leads da campanha específica
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar quantos leads existem para a campanha "Teste 2"
SELECT 
  COUNT(*) as total_leads,
  COUNT(DISTINCT lead_hash) as unique_leads,
  COUNT(DISTINCT list_id) as unique_lists
FROM campaign_leads 
WHERE campaign_id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';

-- 2. Verificar alguns leads da campanha
SELECT 
  campaign_id,
  list_id,
  lead_hash,
  lead_data->>'name' as name,
  lead_data->>'phone' as phone
FROM campaign_leads 
WHERE campaign_id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080'
LIMIT 5;

-- 3. Verificar se a função SQL está funcionando
SELECT update_campaign_unique_leads_count('7c0c9e83-accd-4cb2-a2e0-edf6397ef080');

-- 4. Verificar se a campanha foi atualizada
SELECT 
  id,
  name,
  unique_leads_count,
  total_leads,
  updated_at
FROM bulk_campaigns 
WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';

-- 5. Verificar todas as campanhas e seus contadores
SELECT 
  id,
  name,
  unique_leads_count,
  total_leads,
  selected_lists_count,
  ignored_lists_count
FROM bulk_campaigns 
ORDER BY created_at DESC
LIMIT 5;

-- 6. Atualizar manualmente o contador da campanha "Teste 2"
UPDATE bulk_campaigns 
SET 
  unique_leads_count = (
    SELECT COUNT(DISTINCT lead_hash)
    FROM campaign_leads 
    WHERE campaign_id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080'
  ),
  total_leads = (
    SELECT COUNT(*)
    FROM campaign_leads 
    WHERE campaign_id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080'
  ),
  updated_at = NOW()
WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';

-- 7. Verificar se a atualização manual funcionou
SELECT 
  id,
  name,
  unique_leads_count,
  total_leads,
  updated_at
FROM bulk_campaigns 
WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';



















