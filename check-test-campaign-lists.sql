-- Script para verificar as listas da campanha "Teste 2"
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar as listas selecionadas da campanha "Teste 2"
SELECT 
  id,
  name,
  selected_lists,
  ignored_lists
FROM bulk_campaigns 
WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';

-- 2. Verificar se há dados na tabela campaign_leads para essas listas
SELECT 
  list_id,
  COUNT(*) as total_leads,
  COUNT(DISTINCT campaign_id) as unique_campaigns
FROM campaign_leads
WHERE list_id::text IN (
  SELECT unnest(selected_lists) 
  FROM bulk_campaigns 
  WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080'
)
GROUP BY list_id
ORDER BY total_leads DESC;

-- 3. Verificar se há dados na tabela contact_attempts para essas listas
SELECT 
  list_id,
  COUNT(*) as total_contacts
FROM contact_attempts
WHERE list_id::text IN (
  SELECT unnest(selected_lists) 
  FROM bulk_campaigns 
  WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080'
)
GROUP BY list_id
ORDER BY total_contacts DESC;

-- 4. Verificar se há dados em outras tabelas para essas listas
-- Vamos verificar se há dados na tabela lead_lists
SELECT 
  id,
  name,
  user_id,
  created_at
FROM lead_lists
WHERE id::text IN (
  SELECT unnest(selected_lists) 
  FROM bulk_campaigns 
  WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080'
);

-- 5. Verificar se há dados na tabela campaign_leads para a campanha "Teste 2"
SELECT 
  COUNT(*) as total_leads,
  COUNT(DISTINCT list_id) as unique_lists
FROM campaign_leads 
WHERE campaign_id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';



















