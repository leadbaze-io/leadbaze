-- Script para verificar dependências da função update_updated_at_column
-- Execute este script no SQL Editor do Supabase

-- ==============================================
-- VERIFICAR DEPENDÊNCIAS DA FUNÇÃO
-- ==============================================

-- Verificar se a função existe
SELECT 
  routine_name,
  routine_type,
  data_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'update_updated_at_column';

-- Verificar quais triggers usam esta função
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND action_statement LIKE '%update_updated_at_column%'
ORDER BY event_object_table, trigger_name;

-- Verificar todas as tabelas que têm triggers
SELECT 
  event_object_table as tabela,
  COUNT(*) as total_triggers,
  STRING_AGG(trigger_name, ', ') as triggers
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
GROUP BY event_object_table
ORDER BY event_object_table;

-- ==============================================
-- VERIFICAR TABELAS COM updated_at
-- ==============================================

-- Verificar quais tabelas têm coluna updated_at
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'updated_at'
ORDER BY table_name;

-- ==============================================
-- RESUMO
-- ==============================================

SELECT 
  '📊 RESUMO DE DEPENDÊNCIAS' as titulo,
  'A função update_updated_at_column() é usada por múltiplas tabelas do sistema.' as observacao,
  'NÃO remova esta função pois quebrará outras funcionalidades.' as aviso;
