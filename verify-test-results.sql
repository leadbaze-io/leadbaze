-- Script para verificar se a função SQL funcionou
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a campanha foi atualizada
SELECT 
  id,
  name,
  unique_leads_count,
  total_leads,
  updated_at
FROM bulk_campaigns 
WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';

-- 2. Testar a função SQL novamente
SELECT update_campaign_unique_leads_count('7c0c9e83-accd-4cb2-a2e0-edf6397ef080');

-- 3. Verificar se a campanha foi atualizada após a função
SELECT 
  id,
  name,
  unique_leads_count,
  total_leads,
  updated_at
FROM bulk_campaigns 
WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';

-- 4. Verificar contadores de todas as campanhas
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



















