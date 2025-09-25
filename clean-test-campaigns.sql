-- Script para limpar dados de teste que estão causando duplicação de campanhas
-- Execute este SQL no Supabase

-- 1. Verificar campanhas com nomes de teste
SELECT 
  id,
  name,
  status,
  total_leads,
  unique_leads,
  created_at
FROM campaigns
WHERE name LIKE '%test%' 
   OR name LIKE '%teste%'
   OR name LIKE '%asdasd%'
   OR name = 'Teste Disparo LeadBaze V2'
   OR name = 'Teste Ignored Lists'
ORDER BY created_at DESC;

-- 2. Verificar campanhas com contadores zerados
SELECT 
  id,
  name,
  status,
  total_leads,
  unique_leads,
  selected_lists_count,
  created_at
FROM campaigns
WHERE (total_leads = 0 OR total_leads IS NULL)
  AND (unique_leads = 0 OR unique_leads IS NULL)
  AND (selected_lists_count = 0 OR selected_lists_count IS NULL)
ORDER BY created_at DESC;

-- 3. Limpar campanhas de teste (CUIDADO: Execute apenas se confirmar que são dados de teste)
-- DELETE FROM campaigns 
-- WHERE name LIKE '%test%' 
--    OR name LIKE '%teste%'
--    OR name LIKE '%asdasd%'
--    OR name = 'Teste Disparo LeadBaze V2'
--    OR name = 'Teste Ignored Lists';

-- 4. Limpar campanhas vazias (CUIDADO: Execute apenas se confirmar que são dados inválidos)
-- DELETE FROM campaigns
-- WHERE (total_leads = 0 OR total_leads IS NULL)
--   AND (unique_leads = 0 OR unique_leads IS NULL)
--   AND (selected_lists_count = 0 OR selected_lists_count IS NULL)
--   AND created_at < NOW() - INTERVAL '1 hour'; -- Apenas campanhas antigas

-- 5. Verificar se a tabela campaigns tem função de contadores automáticos
SELECT EXISTS (
  SELECT 1 
  FROM pg_proc 
  WHERE proname = 'update_campaign_counters'
) as update_counters_function_exists;

-- 6. Verificar se há RLS (Row Level Security) ativo
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'campaigns';

-- 7. Verificar políticas RLS se existirem
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'campaigns';



















