-- =====================================================
-- DIAGNÓSTICO IMEDIATO - AUMENTO DE WARNINGS (240→368)
-- =====================================================
-- Este script investiga o que causou o aumento dos warnings
-- Execute imediatamente para identificar o problema
-- =====================================================

-- =====================================================
-- DIAGNÓSTICO 1: Verificar se as políticas foram criadas corretamente
-- =====================================================
SELECT 
    'POLÍTICAS CRIADAS' as categoria,
    tablename as tabela,
    COUNT(*) as total_politicas,
    CASE 
        WHEN COUNT(*) > 4 THEN 'MUITAS POLÍTICAS'
        WHEN COUNT(*) = 0 THEN 'SEM POLÍTICAS'
        ELSE 'OK'
    END as status
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY total_politicas DESC;

-- =====================================================
-- DIAGNÓSTICO 2: Verificar se há políticas duplicadas
-- =====================================================
SELECT 
    'POLÍTICAS DUPLICADAS' as categoria,
    tablename as tabela,
    policyname as politica,
    COUNT(*) as duplicatas
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename, policyname
HAVING COUNT(*) > 1
ORDER BY duplicatas DESC;

-- =====================================================
-- DIAGNÓSTICO 3: Verificar se há políticas com problemas de sintaxe
-- =====================================================
SELECT 
    'POLÍTICAS COM PROBLEMAS' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    CASE 
        WHEN qual IS NULL THEN 'QUAL NULL'
        WHEN with_check IS NULL THEN 'WITH_CHECK NULL'
        WHEN qual LIKE '%ERROR%' THEN 'QUAL COM ERROR'
        WHEN with_check LIKE '%ERROR%' THEN 'WITH_CHECK COM ERROR'
        ELSE 'OK'
    END as problema
FROM pg_policies 
WHERE schemaname = 'public'
AND (
    qual IS NULL OR 
    with_check IS NULL OR 
    qual LIKE '%ERROR%' OR 
    with_check LIKE '%ERROR%'
)
ORDER BY tablename, policyname;

-- =====================================================
-- DIAGNÓSTICO 4: Verificar se há políticas com auth.uid() malformado
-- =====================================================
SELECT 
    'POLÍTICAS MALFORMADAS' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    CASE 
        WHEN qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%' THEN 'auth.uid() não otimizado'
        WHEN qual LIKE '%(select auth.uid())%' THEN 'auth.uid() otimizado'
        WHEN qual LIKE '%auth.uid%' THEN 'auth.uid() parcial'
        ELSE 'Sem auth.uid()'
    END as status
FROM pg_policies 
WHERE schemaname = 'public'
AND qual LIKE '%auth.uid%'
ORDER BY tablename, policyname;

-- =====================================================
-- DIAGNÓSTICO 5: Verificar se há políticas com WITH CHECK malformado
-- =====================================================
SELECT 
    'WITH CHECK MALFORMADO' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    CASE 
        WHEN with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%' THEN 'auth.uid() não otimizado'
        WHEN with_check LIKE '%(select auth.uid())%' THEN 'auth.uid() otimizado'
        WHEN with_check LIKE '%auth.uid%' THEN 'auth.uid() parcial'
        ELSE 'Sem auth.uid()'
    END as status
FROM pg_policies 
WHERE schemaname = 'public'
AND with_check LIKE '%auth.uid%'
ORDER BY tablename, policyname;

-- =====================================================
-- DIAGNÓSTICO 6: Verificar se há políticas com problemas de referência
-- =====================================================
SELECT 
    'PROBLEMAS DE REFERÊNCIA' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    CASE 
        WHEN qual LIKE '%user_id%' AND qual NOT LIKE '%(select auth.uid())%' THEN 'user_id sem otimização'
        WHEN qual LIKE '%author_id%' AND qual NOT LIKE '%(select auth.uid())%' THEN 'author_id sem otimização'
        WHEN qual LIKE '%campaign_id%' AND qual NOT LIKE '%(select auth.uid())%' THEN 'campaign_id sem otimização'
        ELSE 'OK'
    END as status
FROM pg_policies 
WHERE schemaname = 'public'
AND (qual LIKE '%user_id%' OR qual LIKE '%author_id%' OR qual LIKE '%campaign_id%')
ORDER BY tablename, policyname;

-- =====================================================
-- DIAGNÓSTICO 7: Verificar se há políticas com problemas de sintaxe SQL
-- =====================================================
SELECT 
    'PROBLEMAS DE SINTAXE' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    CASE 
        WHEN qual LIKE '%SELECT%' AND qual NOT LIKE '%(select%' THEN 'SELECT malformado'
        WHEN qual LIKE '%FROM%' AND qual NOT LIKE '%(select%' THEN 'FROM malformado'
        WHEN qual LIKE '%WHERE%' AND qual NOT LIKE '%(select%' THEN 'WHERE malformado'
        ELSE 'OK'
    END as status
FROM pg_policies 
WHERE schemaname = 'public'
AND (qual LIKE '%SELECT%' OR qual LIKE '%FROM%' OR qual LIKE '%WHERE%')
ORDER BY tablename, policyname;

-- =====================================================
-- DIAGNÓSTICO 8: Resumo dos problemas encontrados
-- =====================================================
SELECT 
    'RESUMO DOS PROBLEMAS' as categoria,
    'Total de políticas' as tipo,
    COUNT(*) as total
FROM pg_policies 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'RESUMO DOS PROBLEMAS' as categoria,
    'Políticas com auth.uid() não otimizado' as tipo,
    COUNT(*) as total
FROM pg_policies 
WHERE schemaname = 'public'
AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
AND (qual NOT LIKE '%(select auth.uid())%' AND with_check NOT LIKE '%(select auth.uid())%')

UNION ALL

SELECT 
    'RESUMO DOS PROBLEMAS' as categoria,
    'Políticas com auth.uid() otimizado' as tipo,
    COUNT(*) as total
FROM pg_policies 
WHERE schemaname = 'public'
AND (qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%')

UNION ALL

SELECT 
    'RESUMO DOS PROBLEMAS' as categoria,
    'Backup disponível' as tipo,
    COUNT(*) as total
FROM backup_policies_rls_performance;

-- =====================================================
-- RECOMENDAÇÃO IMEDIATA
-- =====================================================
SELECT 
    'RECOMENDAÇÃO' as categoria,
    'Execute rollback se houver problemas' as acao,
    'rollback-correcoes-rls-performance.sql' as script;






















