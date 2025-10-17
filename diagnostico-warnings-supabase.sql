-- =====================================================
-- DIAGNÓSTICO COMPLETO DE WARNINGS SUPABASE
-- =====================================================
-- Este script analisa por que os warnings estão aumentando
-- Execute para entender a situação atual

-- =====================================================
-- 1. ANÁLISE GERAL DE POLÍTICAS RLS
-- =====================================================

-- Contar políticas por tabela
SELECT 
  'ANÁLISE: POLÍTICAS POR TABELA' as categoria,
  tablename as tabela,
  COUNT(*) as total_politicas,
  STRING_AGG(policyname, ', ') as politicas,
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ Consolidada'
    WHEN COUNT(*) = 0 THEN '⚠️ Sem políticas'
    ELSE '❌ Múltiplas políticas'
  END as status
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY COUNT(*) DESC, tablename;

-- =====================================================
-- 2. ANÁLISE DE POLÍTICAS PROBLEMÁTICAS
-- =====================================================

-- Verificar políticas que podem estar causando problemas
SELECT 
  'ANÁLISE: POLÍTICAS PROBLEMÁTICAS' as categoria,
  tablename as tabela,
  policyname as politica,
  permissive as tipo,
  cmd as operacao,
  qual as condicao,
  CASE 
    WHEN qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%' THEN '❌ Performance ruim'
    WHEN qual LIKE '%(select auth.uid())%' THEN '✅ Otimizada'
    ELSE '⚠️ Verificar'
  END as performance_status
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 3. ANÁLISE DE VIEWS
-- =====================================================

-- Verificar views existentes
SELECT 
  'ANÁLISE: VIEWS EXISTENTES' as categoria,
  schemaname as schema,
  viewname as view,
  'Verificar se tem SECURITY DEFINER' as observacao
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- =====================================================
-- 4. ANÁLISE DE ÍNDICES
-- =====================================================

-- Verificar índices duplicados ou problemáticos
SELECT 
  'ANÁLISE: ÍNDICES PROBLEMÁTICOS' as categoria,
  schemaname as schema,
  tablename as tabela,
  indexname as indice,
  indexdef as definicao,
  CASE 
    WHEN indexname LIKE '%_idx' AND EXISTS (
      SELECT 1 FROM pg_indexes p2 
      WHERE p2.schemaname = pg_indexes.schemaname 
        AND p2.tablename = pg_indexes.tablename 
        AND p2.indexname = REPLACE(pg_indexes.indexname, '_idx', '')
    ) THEN '❌ Possível duplicado'
    ELSE '✅ OK'
  END as status
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- 5. ANÁLISE DE RLS
-- =====================================================

-- Verificar status do RLS
SELECT 
  'ANÁLISE: STATUS RLS' as categoria,
  tablename as tabela,
  CASE 
    WHEN rowsecurity THEN 'RLS HABILITADO'
    ELSE 'RLS DESABILITADO'
  END as status_rls,
  CASE 
    WHEN rowsecurity AND NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename = pg_tables.tablename
    ) THEN '❌ RLS sem políticas'
    WHEN rowsecurity AND EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename = pg_tables.tablename
    ) THEN '✅ RLS com políticas'
    WHEN NOT rowsecurity THEN '⚠️ RLS desabilitado'
    ELSE '❓ Status desconhecido'
  END as politica_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- 6. ANÁLISE DE TABELAS RECÉM-CRIADAS
-- =====================================================

-- Verificar se há tabelas que foram criadas pelos scripts
SELECT 
  'ANÁLISE: TABELAS RECÉM-CRIADAS' as categoria,
  tablename as tabela,
  'Verificar se foi criada pelos scripts' as observacao
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN (
    'backup_complete_objects',
    'backup_rls_policies',
    'backup_security_objects'
  )
ORDER BY tablename;

-- =====================================================
-- 7. ANÁLISE DE FUNÇÕES CRIADAS
-- =====================================================

-- Verificar funções que podem ter sido criadas
SELECT 
  'ANÁLISE: FUNÇÕES CRIADAS' as categoria,
  routine_name as funcao,
  routine_type as tipo,
  'Verificar se deve ser removida' as observacao
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_user_column_name',
    'consolidate_table_policies',
    'optimize_rls_policies'
  )
ORDER BY routine_name;

-- =====================================================
-- 8. RESUMO DIAGNÓSTICO
-- =====================================================

-- Contar problemas identificados
SELECT 
  'RESUMO DIAGNÓSTICO' as categoria,
  'Total de tabelas com políticas múltiplas' as problema_1,
  (SELECT COUNT(*) FROM (
    SELECT tablename 
    FROM pg_policies 
    WHERE schemaname = 'public'
    GROUP BY tablename
    HAVING COUNT(*) > 1
  ) as multiple_policies) as valor_1
UNION ALL
SELECT 
  'RESUMO DIAGNÓSTICO' as categoria,
  'Total de tabelas sem RLS' as problema_2,
  (SELECT COUNT(*) FROM pg_tables 
   WHERE schemaname = 'public' 
     AND rowsecurity = false) as valor_2
UNION ALL
SELECT 
  'RESUMO DIAGNÓSTICO' as categoria,
  'Total de políticas com performance ruim' as problema_3,
  (SELECT COUNT(*) FROM pg_policies 
   WHERE schemaname = 'public'
     AND qual LIKE '%auth.uid()%' 
     AND qual NOT LIKE '%(select auth.uid())%') as valor_3
UNION ALL
SELECT 
  'RESUMO DIAGNÓSTICO' as categoria,
  'Total de views existentes' as problema_4,
  (SELECT COUNT(*) FROM pg_views 
   WHERE schemaname = 'public') as valor_4;

-- =====================================================
-- 9. RECOMENDAÇÕES BASEADAS NO DIAGNÓSTICO
-- =====================================================

SELECT 
  'RECOMENDAÇÕES' as categoria,
  'Se políticas múltiplas > 0: Consolidar políticas' as recomendacao_1,
  'Se RLS desabilitado > 0: Habilitar RLS' as recomendacao_2,
  'Se performance ruim > 0: Otimizar auth.uid()' as recomendacao_3,
  'Se views > 4: Verificar SECURITY DEFINER' as recomendacao_4,
  'Considerar rollback se warnings aumentaram' as recomendacao_5;











