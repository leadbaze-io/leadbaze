-- Script para limpar o teste e verificar campanhas existentes
-- Execute este script no SQL Editor do Supabase

-- 1. Limpar o teste anterior
DELETE FROM bulk_campaigns 
WHERE name = 'Teste Ignored Lists';

-- 2. Verificar campanhas existentes
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
LIMIT 10;

-- 3. Verificar se há campanhas com listas selecionadas
SELECT 
  id,
  name,
  selected_lists,
  ignored_lists,
  total_leads
FROM bulk_campaigns
WHERE selected_lists IS NOT NULL 
  AND array_length(selected_lists, 1) > 0
ORDER BY created_at DESC;