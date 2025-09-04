-- Verificar estrutura atual da tabela campaign_leads
-- Execute este SQL no Supabase para diagnosticar o problema

-- 1. Verificar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'campaign_leads'
ORDER BY ordinal_position;

-- 2. Verificar constraints da tabela
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  tc.is_deferrable,
  tc.initially_deferred
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'campaign_leads'
ORDER BY tc.constraint_type, kcu.ordinal_position;

-- 3. Verificar índices da tabela
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'campaign_leads';

-- 4. Verificar se há dados na tabela
SELECT COUNT(*) as total_records FROM campaign_leads;

-- 5. Verificar uma amostra dos dados (se houver)
SELECT * FROM campaign_leads LIMIT 3;
