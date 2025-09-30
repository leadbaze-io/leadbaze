-- Script para diagnosticar problema das campanhas com mesmo nome e sem dados
-- Execute este SQL no Supabase

-- 1. Verificar se a tabela campaigns existe
SELECT COUNT(*) as campaigns_table_exists 
FROM information_schema.tables 
WHERE table_name = 'campaigns' AND table_schema = 'public';

-- 2. Verificar estrutura da tabela campaigns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'campaigns' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar todas as campanhas existentes na nova tabela
SELECT 
  id,
  name,
  message,
  status,
  total_leads,
  unique_leads,
  selected_lists_count,
  ignored_lists_count,
  created_at,
  updated_at
FROM campaigns
ORDER BY created_at DESC;

-- 4. Verificar tabelas relacionadas
SELECT COUNT(*) as campaign_unique_leads_count FROM campaign_unique_leads;
SELECT COUNT(*) as campaign_lists_count FROM campaign_lists;

-- 5. Verificar se há campaigns com mesmo nome
SELECT 
  name,
  COUNT(*) as count,
  array_agg(id) as campaign_ids
FROM campaigns 
GROUP BY name
HAVING COUNT(*) > 1;

-- 6. Verificar se há campanhas vazias (sem contadores)
SELECT 
  id,
  name,
  total_leads,
  unique_leads,
  selected_lists_count,
  ignored_lists_count
FROM campaigns
WHERE (total_leads = 0 OR total_leads IS NULL)
  AND (unique_leads = 0 OR unique_leads IS NULL)
  AND (selected_lists_count = 0 OR selected_lists_count IS NULL);

-- 7. Verificar triggers e funções automáticas
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'campaigns';

-- 8. Verificar se há função de atualização de contadores
SELECT 
  p.proname as function_name,
  pg_get_function_result(p.oid) as return_type,
  pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname LIKE '%campaign%counter%';



















