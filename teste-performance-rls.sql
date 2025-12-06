-- =====================================================
-- TESTE - PERFORMANCE RLS CORREÇÕES
-- =====================================================
-- Este script testa se as correções de Performance RLS
-- foram aplicadas corretamente
-- =====================================================

-- =====================================================
-- TESTE 1: Verificar se auth.uid() foi otimizado
-- =====================================================
SELECT 
    'TESTE AUTH.UID()' as categoria,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ TODOS otimizados'
        ELSE '❌ ' || COUNT(*)::text || ' ainda não otimizados'
    END as resultado,
    STRING_AGG(tablename || '.' || policyname, ', ') as politicas_problema
FROM pg_policies 
WHERE schemaname = 'public'
AND (
    (qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%')
    OR (with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%')
);

-- =====================================================
-- TESTE 2: Verificar se current_setting() foi otimizado
-- =====================================================
SELECT 
    'TESTE CURRENT_SETTING()' as categoria,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ TODOS otimizados'
        ELSE '❌ ' || COUNT(*)::text || ' ainda não otimizados'
    END as resultado,
    STRING_AGG(tablename || '.' || policyname, ', ') as politicas_problema
FROM pg_policies 
WHERE schemaname = 'public'
AND (
    qual LIKE '%current_setting%'
    OR with_check LIKE '%current_setting%'
);

-- =====================================================
-- TESTE 3: Contar políticas otimizadas
-- =====================================================
SELECT 
    'TESTE CONTAGEM' as categoria,
    'Políticas otimizadas' as metrica,
    COUNT(*) as quantidade
FROM pg_policies 
WHERE schemaname = 'public'
AND (
    (qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%')
    OR (qual LIKE '%(select current_setting%' OR with_check LIKE '%(select current_setting%')
);

-- =====================================================
-- TESTE 4: Verificar backup foi criado
-- =====================================================
SELECT 
    'TESTE BACKUP' as categoria,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_policies_performance_rls') THEN '✅ Backup criado'
        ELSE '❌ Backup não encontrado'
    END as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_policies_performance_rls') THEN (SELECT COUNT(*)::text FROM backup_policies_performance_rls WHERE backup_tag = 'ANTES_CORRECAO_PERFORMANCE')
        ELSE '0'
    END as politicas_backup;

-- =====================================================
-- TESTE 5: Resumo geral
-- =====================================================
SELECT 
    'RESUMO TESTE' as categoria,
    CASE 
        WHEN (
            SELECT COUNT(*) FROM pg_policies 
            WHERE schemaname = 'public'
            AND (
                (qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%')
                OR (with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%')
                OR qual LIKE '%current_setting%'
                OR with_check LIKE '%current_setting%'
            )
        ) = 0 THEN '✅ CORREÇÃO COMPLETA'
        ELSE '❌ CORREÇÃO INCOMPLETA'
    END as resultado_final;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'TESTE CONCLUÍDO' as status,
    'Verifique os resultados acima' as mensagem,
    'Se tudo estiver OK, prossiga para próximas correções' as proximo_passo;






















