-- Script para testar a campanha "Estéticas Savassi"
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar dados atuais da campanha
SELECT 
  id,
  name,
  selected_lists,
  ignored_lists,
  total_leads,
  status,
  updated_at
FROM bulk_campaigns
WHERE id = '33c02711-b0de-4a82-b803-f0bd0f3081a0';

-- 2. Simular atualização com listas ignoradas
UPDATE bulk_campaigns 
SET 
  ignored_lists = ARRAY['lista-duplicada-1', 'lista-duplicada-2'],
  updated_at = NOW()
WHERE id = '33c02711-b0de-4a82-b803-f0bd0f3081a0'
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
WHERE id = '33c02711-b0de-4a82-b803-f0bd0f3081a0';

-- 4. Limpar o teste (voltar ao estado original)
UPDATE bulk_campaigns 
SET 
  ignored_lists = ARRAY[]::text[],
  updated_at = NOW()
WHERE id = '33c02711-b0de-4a82-b803-f0bd0f3081a0';




















