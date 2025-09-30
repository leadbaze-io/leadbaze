-- Script para verificar a estrutura real da tabela contact_attempts
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura completa da tabela contact_attempts
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'contact_attempts'
ORDER BY ordinal_position;

-- 2. Verificar alguns exemplos de dados da tabela contact_attempts
SELECT *
FROM contact_attempts
LIMIT 3;

-- 3. Verificar quantos registros existem
SELECT COUNT(*) as total_records FROM contact_attempts;

-- 4. Verificar se há dados para as listas da campanha "Teste 2"
SELECT 
  COUNT(*) as total_contacts
FROM contact_attempts
WHERE list_id::text IN (
  SELECT unnest(selected_lists) 
  FROM bulk_campaigns 
  WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080'
);

-- 5. Verificar se há dados para qualquer lista
SELECT 
  list_id,
  COUNT(*) as total_contacts
FROM contact_attempts
GROUP BY list_id
ORDER BY total_contacts DESC
LIMIT 5;