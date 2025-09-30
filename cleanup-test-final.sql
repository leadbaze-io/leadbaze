-- Script para limpar o teste e deixar a campanha pronta para teste na interface
-- Execute este script no SQL Editor do Supabase

-- Limpar o teste (voltar ao estado original)
UPDATE bulk_campaigns 
SET 
  ignored_lists = ARRAY[]::text[],
  updated_at = NOW()
WHERE id = '33c02711-b0de-4a82-b803-f0bd0f3081a0'
RETURNING id, name, selected_lists, ignored_lists, total_leads;

-- Verificar estado final
SELECT 
  id,
  name,
  selected_lists,
  ignored_lists,
  total_leads,
  updated_at
FROM bulk_campaigns
WHERE id = '33c02711-b0de-4a82-b803-f0bd0f3081a0';




















