-- =====================================================
-- RESUMO EXECUTIVO - RESULTADOS PERFORMANCE RLS
-- =====================================================
-- Este script mostra um resumo executivo dos resultados
-- específicos para tomada de decisão
-- =====================================================

-- =====================================================
-- RESUMO 1: Impacto das correções Performance RLS
-- =====================================================
SELECT 
    'IMPACTO PERFORMANCE RLS' as categoria,
    'Políticas problemáticas ANTES' as metrica,
    COALESCE((SELECT COUNT(*) FROM backup_policies_performance_rls WHERE backup_tag = 'ANTES_CORRECAO_PERFORMANCE'), 0)::text as valor
UNION ALL
SELECT 
    'IMPACTO PERFORMANCE RLS' as categoria,
    'Políticas problemáticas DEPOIS' as metrica,
    (
        COALESCE((SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND ((qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%') OR (with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%'))), 0)
        + COALESCE((SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND (qual LIKE '%current_setting%' OR with_check LIKE '%current_setting%')), 0)
    )::text as valor
UNION ALL
SELECT 
    'IMPACTO PERFORMANCE RLS' as categoria,
    'Políticas otimizadas' as metrica,
    COALESCE((SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND ((qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%') OR (qual LIKE '%(select current_setting%' OR with_check LIKE '%(select current_setting%'))), 0)::text as valor
UNION ALL
SELECT 
    'IMPACTO PERFORMANCE RLS' as categoria,
    'Redução de warnings' as metrica,
    CASE 
        WHEN COALESCE((SELECT COUNT(*) FROM backup_policies_performance_rls WHERE backup_tag = 'ANTES_CORRECAO_PERFORMANCE'), 0) > 0 THEN
            (
                COALESCE((SELECT COUNT(*) FROM backup_policies_performance_rls WHERE backup_tag = 'ANTES_CORRECAO_PERFORMANCE'), 0) - 
                (
                    COALESCE((SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND ((qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%') OR (with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%'))), 0)
                    + COALESCE((SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND (qual LIKE '%current_setting%' OR with_check LIKE '%current_setting%')), 0)
                )
            )::text
        ELSE '0'
    END as valor;

-- =====================================================
-- RESUMO 2: Status atual de outros warnings
-- =====================================================
SELECT 
    'OUTROS WARNINGS ATUAIS' as categoria,
    'Duplicatas de Índices' as tipo,
    COALESCE((
        SELECT COUNT(*) FROM (
            SELECT DISTINCT i1.tablename, i1.indexname
            FROM pg_indexes i1
            JOIN pg_indexes i2 ON i1.tablename = i2.tablename AND i1.schemaname = i2.schemaname AND i1.indexname != i2.indexname
            WHERE i1.schemaname = 'public' AND i2.schemaname = 'public'
            AND ((i1.indexname LIKE '%_user_id' AND i2.indexname LIKE '%_user_id_%') OR (i1.indexname LIKE '%_status' AND i2.indexname LIKE '%_status_%') OR (i1.indexname LIKE '%_created_at' AND i2.indexname LIKE '%_created_at_%') OR (LENGTH(i1.indexdef) < LENGTH(i2.indexdef) AND i2.indexdef LIKE '%' || i1.indexdef || '%'))
        ) subquery
    ), 0)::text as quantidade
UNION ALL
SELECT 
    'OUTROS WARNINGS ATUAIS' as categoria,
    'Múltiplas Políticas Permissivas' as tipo,
    COALESCE((
        SELECT COUNT(*) FROM (
            SELECT tablename, cmd FROM pg_policies WHERE schemaname = 'public' AND permissive = 'PERMISSIVE' GROUP BY tablename, cmd HAVING COUNT(*) > 1
        ) subquery
    ), 0)::text as quantidade
UNION ALL
SELECT 
    'OUTROS WARNINGS ATUAIS' as categoria,
    'RLS Desabilitado em Público' as tipo,
    COALESCE((
        SELECT COUNT(*) FROM pg_tables 
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
        )
    ), 0)::text as quantidade;

-- =====================================================
-- RESUMO 3: Recomendação de próximo passo
-- =====================================================
SELECT 
    'RECOMENDAÇÃO PRÓXIMO PASSO' as categoria,
    CASE 
        WHEN (
            COALESCE((SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND ((qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%') OR (with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%'))), 0)
            + COALESCE((SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND (qual LIKE '%current_setting%' OR with_check LIKE '%current_setting%')), 0)
        ) = 0 THEN '✅ Performance RLS: COMPLETO'
        ELSE '❌ Performance RLS: INCOMPLETO'
    END as status_performance,
    CASE 
        WHEN COALESCE((
            SELECT COUNT(*) FROM (
                SELECT DISTINCT i1.tablename, i1.indexname
                FROM pg_indexes i1
                JOIN pg_indexes i2 ON i1.tablename = i2.tablename AND i1.schemaname = i2.schemaname AND i1.indexname != i2.indexname
                WHERE i1.schemaname = 'public' AND i2.schemaname = 'public'
                AND ((i1.indexname LIKE '%_user_id' AND i2.indexname LIKE '%_user_id_%') OR (i1.indexname LIKE '%_status' AND i2.indexname LIKE '%_status_%') OR (i1.indexname LIKE '%_created_at' AND i2.indexname LIKE '%_created_at_%') OR (LENGTH(i1.indexdef) < LENGTH(i2.indexdef) AND i2.indexdef LIKE '%' || i1.indexdef || '%'))
            ) subquery
        ), 0) > 0 THEN '🔄 Próximo: Duplicatas de Índices'
        ELSE '✅ Duplicatas de Índices: OK'
    END as proximo_passo,
    CASE 
        WHEN COALESCE((
            SELECT COUNT(*) FROM (
                SELECT tablename, cmd FROM pg_policies WHERE schemaname = 'public' AND permissive = 'PERMISSIVE' GROUP BY tablename, cmd HAVING COUNT(*) > 1
            ) subquery
        ), 0) > 0 THEN '🔄 Depois: Múltiplas Políticas'
        ELSE '✅ Múltiplas Políticas: OK'
    END as passo_seguinte;

-- =====================================================
-- RESUMO 4: Ações recomendadas
-- =====================================================
SELECT 
    'AÇÕES RECOMENDADAS' as categoria,
    CASE 
        WHEN (
            COALESCE((SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND ((qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%') OR (with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%'))), 0)
            + COALESCE((SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND (qual LIKE '%current_setting%' OR with_check LIKE '%current_setting%')), 0)
        ) = 0 THEN '1. ✅ Performance RLS corrigido - Prossiga para próximo'
        ELSE '1. ❌ Revisar Performance RLS - Alguns problemas persistem'
    END as acao_1,
    CASE 
        WHEN COALESCE((
            SELECT COUNT(*) FROM (
                SELECT DISTINCT i1.tablename, i1.indexname
                FROM pg_indexes i1
                JOIN pg_indexes i2 ON i1.tablename = i2.tablename AND i1.schemaname = i2.schemaname AND i1.indexname != i2.indexname
                WHERE i1.schemaname = 'public' AND i2.schemaname = 'public'
                AND ((i1.indexname LIKE '%_user_id' AND i2.indexname LIKE '%_user_id_%') OR (i1.indexname LIKE '%_status' AND i2.indexname LIKE '%_status_%') OR (i1.indexname LIKE '%_created_at' AND i2.indexname LIKE '%_created_at_%') OR (LENGTH(i1.indexdef) < LENGTH(i2.indexdef) AND i2.indexdef LIKE '%' || i1.indexdef || '%'))
            ) subquery
        ), 0) > 0 THEN '2. 🔄 Executar correção de Duplicatas de Índices'
        ELSE '2. ✅ Duplicatas de Índices OK - Pular para próximo'
    END as acao_2,
    CASE 
        WHEN COALESCE((
            SELECT COUNT(*) FROM (
                SELECT tablename, cmd FROM pg_policies WHERE schemaname = 'public' AND permissive = 'PERMISSIVE' GROUP BY tablename, cmd HAVING COUNT(*) > 1
            ) subquery
        ), 0) > 0 THEN '3. 🔄 Executar correção de Múltiplas Políticas'
        ELSE '3. ✅ Múltiplas Políticas OK - Pular para próximo'
    END as acao_3;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'RESUMO EXECUTIVO CONCLUÍDO' as status,
    'Baseado nos resultados acima, decida o próximo passo' as mensagem,
    'Recomendação: Continuar com Duplicatas de Índices se Performance RLS estiver OK' as proximo_passo;









