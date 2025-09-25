-- =====================================================
-- VERIFICAR CONSTRAINT ATUAL E CORRIGIR
-- =====================================================

-- 1. Verificar constraint atual
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname LIKE '%operation_type%';

-- 2. Verificar todos os valores únicos na tabela
SELECT DISTINCT operation_type, COUNT(*) as count
FROM leads_usage_history 
GROUP BY operation_type
ORDER BY operation_type;

-- 3. Verificar se a constraint existe
SELECT EXISTS (
  SELECT 1 FROM pg_constraint 
  WHERE conname = 'leads_usage_history_operation_type_check'
) as constraint_exists;


