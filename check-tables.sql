-- Script para verificar as tabelas existentes no banco
-- Execute este script no SQL Editor do Supabase

-- 1. Listar todas as tabelas do banco
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Verificar especificamente tabelas relacionadas a leads
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name LIKE '%lead%'
ORDER BY table_name;

-- 3. Verificar colunas da tabela lead_lists
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'lead_lists'
ORDER BY ordinal_position;

-- 4. Verificar se existe alguma tabela com dados de contato/telefone
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND (table_name LIKE '%contact%' OR table_name LIKE '%phone%' OR table_name LIKE '%person%')
ORDER BY table_name;