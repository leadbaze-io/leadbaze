-- =====================================================
-- RESULTADOS ESPECÍFICOS - ANÁLISE PERFORMANCE RLS
-- =====================================================
-- Este script mostra os resultados específicos da análise
-- detalhada para entender o impacto real das correções
-- =====================================================

-- =====================================================
-- RESULTADO 1: Comparação ANTES vs DEPOIS
-- =====================================================
SELECT 
    'COMPARAÇÃO ANTES vs DEPOIS' as categoria,
    'Políticas problemáticas ANTES' as periodo,
    (SELECT COUNT(*) FROM backup_policies_performance_rls WHERE backup_tag = 'ANTES_CORRECAO_PERFORMANCE')::text as quantidade
UNION ALL
SELECT 
    'COMPARAÇÃO ANTES vs DEPOIS' as categoria,
    'Políticas problemáticas DEPOIS' as periodo,
    (
        (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND ((qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%') OR (with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%')))
        + (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND (qual LIKE '%current_setting%' OR with_check LIKE '%current_setting%'))
    )::text as quantidade
UNION ALL
SELECT 
    'COMPARAÇÃO ANTES vs DEPOIS' as categoria,
    'Políticas otimizadas' as periodo,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND ((qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%') OR (qual LIKE '%(select current_setting%' OR with_check LIKE '%(select current_setting%')))::text as quantidade;

-- =====================================================
-- RESULTADO 2: Breakdown por tipo de problema
-- =====================================================
SELECT 
    'BREAKDOWN POR TIPO' as categoria,
    'auth.uid() não otimizado ANTES' as tipo,
    (SELECT COUNT(*) FROM backup_policies_performance_rls WHERE backup_tag = 'ANTES_CORRECAO_PERFORMANCE' AND ((qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%') OR (with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%')))::text as quantidade
UNION ALL
SELECT 
    'BREAKDOWN POR TIPO' as categoria,
    'auth.uid() não otimizado DEPOIS' as tipo,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND ((qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%') OR (with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%')))::text as quantidade
UNION ALL
SELECT 
    'BREAKDOWN POR TIPO' as categoria,
    'current_setting não otimizado ANTES' as tipo,
    (SELECT COUNT(*) FROM backup_policies_performance_rls WHERE backup_tag = 'ANTES_CORRECAO_PERFORMANCE' AND (qual LIKE '%current_setting%' OR with_check LIKE '%current_setting%'))::text as quantidade
UNION ALL
SELECT 
    'BREAKDOWN POR TIPO' as categoria,
    'current_setting não otimizado DEPOIS' as tipo,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND (qual LIKE '%current_setting%' OR with_check LIKE '%current_setting%'))::text as quantidade;

-- =====================================================
-- RESULTADO 3: Políticas que foram realmente otimizadas
-- =====================================================
SELECT 
    'POLÍTICAS OTIMIZADAS' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    CASE 
        WHEN qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%' THEN 'auth.uid() otimizado'
        WHEN qual LIKE '%(select current_setting%' OR with_check LIKE '%(select current_setting%' THEN 'current_setting() otimizado'
        ELSE 'Outro'
    END as tipo_otimizacao
FROM pg_policies 
WHERE schemaname = 'public'
AND (
    (qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%')
    OR (qual LIKE '%(select current_setting%' OR with_check LIKE '%(select current_setting%')
)
ORDER BY tablename, policyname;

-- =====================================================
-- RESULTADO 4: Outros tipos de warnings que ainda existem
-- =====================================================
SELECT 
    'OUTROS WARNINGS' as categoria,
    'duplicate_index' as tipo,
    COUNT(*) as quantidade
FROM (
    SELECT DISTINCT i1.tablename, i1.indexname
    FROM pg_indexes i1
    JOIN pg_indexes i2 ON i1.tablename = i2.tablename AND i1.schemaname = i2.schemaname AND i1.indexname != i2.indexname
    WHERE i1.schemaname = 'public' AND i2.schemaname = 'public'
    AND ((i1.indexname LIKE '%_user_id' AND i2.indexname LIKE '%_user_id_%') OR (i1.indexname LIKE '%_status' AND i2.indexname LIKE '%_status_%') OR (i1.indexname LIKE '%_created_at' AND i2.indexname LIKE '%_created_at_%') OR (LENGTH(i1.indexdef) < LENGTH(i2.indexdef) AND i2.indexdef LIKE '%' || i1.indexdef || '%'))
) subquery
UNION ALL
SELECT 
    'OUTROS WARNINGS' as categoria,
    'multiple_permissive_policies' as tipo,
    COUNT(*) as quantidade
FROM (
    SELECT tablename, cmd FROM pg_policies WHERE schemaname = 'public' AND permissive = 'PERMISSIVE' GROUP BY tablename, cmd HAVING COUNT(*) > 1
) subquery
UNION ALL
SELECT 
    'OUTROS WARNINGS' as categoria,
    'rls_disabled_in_public' as tipo,
    COUNT(*) as quantidade
FROM pg_tables 
WHERE schemaname = 'public'
AND NOT rowsecurity
AND tablename NOT LIKE 'backup_%'
AND tablename NOT IN (
    'subscription_changes',
    'upgrade_pending', 
    'campaign_leads_backup',
    'user_payment_subscriptions',
    'backup_rls_performance',
    'backup_seguro_antes_rollback'
);

-- =====================================================
-- RESULTADO 5: Cálculo da redução de warnings
-- =====================================================
SELECT 
    'CÁLCULO REDUÇÃO' as categoria,
    'Total de políticas problemáticas ANTES' as metrica,
    (SELECT COUNT(*) FROM backup_policies_performance_rls WHERE backup_tag = 'ANTES_CORRECAO_PERFORMANCE')::text as valor
UNION ALL
SELECT 
    'CÁLCULO REDUÇÃO' as categoria,
    'Total de políticas problemáticas DEPOIS' as metrica,
    (
        (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND ((qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%') OR (with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%')))
        + (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND (qual LIKE '%current_setting%' OR with_check LIKE '%current_setting%'))
    )::text as valor
UNION ALL
SELECT 
    'CÁLCULO REDUÇÃO' as categoria,
    'Políticas otimizadas' as metrica,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND ((qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%') OR (qual LIKE '%(select current_setting%' OR with_check LIKE '%(select current_setting%')))::text as valor
UNION ALL
SELECT 
    'CÁLCULO REDUÇÃO' as categoria,
    'Percentual de redução' as metrica,
    CASE 
        WHEN (SELECT COUNT(*) FROM backup_policies_performance_rls WHERE backup_tag = 'ANTES_CORRECAO_PERFORMANCE') > 0 THEN
            ROUND(
                (100.0 * (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND ((qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%') OR (qual LIKE '%(select current_setting%' OR with_check LIKE '%(select current_setting%'))) / 
                (SELECT COUNT(*) FROM backup_policies_performance_rls WHERE backup_tag = 'ANTES_CORRECAO_PERFORMANCE'))
            )::text || '%'
        ELSE '0%'
    END as valor;

-- =====================================================
-- RESULTADO 6: Recomendação baseada nos resultados
-- =====================================================
SELECT 
    'RECOMENDAÇÃO' as categoria,
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
        ) = 0 THEN '✅ Performance RLS completamente corrigido'
        ELSE '❌ Ainda há problemas de Performance RLS'
    END as status_performance,
    CASE 
        WHEN (
            SELECT COUNT(*) FROM (
                SELECT DISTINCT i1.tablename, i1.indexname
                FROM pg_indexes i1
                JOIN pg_indexes i2 ON i1.tablename = i2.tablename AND i1.schemaname = i2.schemaname AND i1.indexname != i2.indexname
                WHERE i1.schemaname = 'public' AND i2.schemaname = 'public'
                AND ((i1.indexname LIKE '%_user_id' AND i2.indexname LIKE '%_user_id_%') OR (i1.indexname LIKE '%_status' AND i2.indexname LIKE '%_status_%') OR (i1.indexname LIKE '%_created_at' AND i2.indexname LIKE '%_created_at_%') OR (LENGTH(i1.indexdef) < LENGTH(i2.indexdef) AND i2.indexdef LIKE '%' || i1.indexdef || '%'))
            ) subquery
        ) > 0 THEN '🔄 Próximo: Corrigir Duplicatas de Índices'
        ELSE '✅ Duplicatas de Índices OK'
    END as proximo_passo;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'RESULTADOS ESPECÍFICOS CONCLUÍDOS' as status,
    'Confirme os resultados acima' as mensagem,
    'Baseado nos resultados, decida o próximo passo' as proximo_passo;









