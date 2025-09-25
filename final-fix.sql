-- Script final para corrigir o problema
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se há leads na campanha "Teste 2"
SELECT 
  COUNT(*) as total_leads,
  COUNT(DISTINCT lead_hash) as unique_leads
FROM campaign_leads 
WHERE campaign_id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';

-- 2. Verificar a campanha atual
SELECT 
  id,
  name,
  unique_leads_count,
  total_leads,
  selected_lists_count,
  ignored_lists_count
FROM bulk_campaigns 
WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';

-- 3. Atualizar manualmente os contadores
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

-- 4. Verificar se foi atualizado
SELECT 
  id,
  name,
  unique_leads_count,
  total_leads,
  selected_lists_count,
  ignored_lists_count
FROM bulk_campaigns 
WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';



















