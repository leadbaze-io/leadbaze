-- Script para testar a persistência de campanhas com ignored_lists
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar campanhas existentes
SELECT 
  id,
  name,
  selected_lists,
  ignored_lists,
  total_leads,
  status,
  created_at
FROM bulk_campaigns
ORDER BY created_at DESC
LIMIT 5;

-- 2. Testar atualização de uma campanha existente
-- (Substitua 'SEU_CAMPAIGN_ID' pelo ID real de uma campanha)
UPDATE bulk_campaigns 
SET 
  selected_lists = ARRAY['lista1', 'lista2', 'lista3'],
  ignored_lists = ARRAY['lista4', 'lista5'],
  total_leads = 150
WHERE id = 'SEU_CAMPAIGN_ID'
RETURNING id, name, selected_lists, ignored_lists, total_leads;

-- 3. Verificar se a atualização funcionou
SELECT 
  id,
  name,
  selected_lists,
  ignored_lists,
  total_leads,
  updated_at
FROM bulk_campaigns
WHERE id = 'SEU_CAMPAIGN_ID';




















