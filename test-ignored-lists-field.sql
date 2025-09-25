-- Script simples para testar o campo ignored_lists
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se o campo existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bulk_campaigns' 
  AND column_name = 'ignored_lists';

-- 2. Testar inserção com o novo campo
INSERT INTO bulk_campaigns (
  user_id, 
  name, 
  message, 
  selected_lists, 
  ignored_lists, 
  total_leads
) VALUES (
  auth.uid(),
  'Teste Ignored Lists',
  'Mensagem de teste',
  ARRAY['lista1', 'lista2'],
  ARRAY['lista3', 'lista4'],
  10
);

-- 3. Verificar se foi inserido corretamente
SELECT 
  id,
  name,
  selected_lists,
  ignored_lists,
  total_leads
FROM bulk_campaigns 
WHERE name = 'Teste Ignored Lists'
ORDER BY created_at DESC
LIMIT 1;

-- 4. Limpar o teste
DELETE FROM bulk_campaigns 
WHERE name = 'Teste Ignored Lists';




















