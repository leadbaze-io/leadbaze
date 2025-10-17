-- =====================================================
-- MONITORAMENTO DAS CORREÇÕES RLS PERFORMANCE
-- =====================================================
-- Este script monitora o progresso das correções
-- Execute antes e depois de cada correção para comparar
-- =====================================================

-- =====================================================
-- MONITORAMENTO 1: Status atual das políticas
-- =====================================================
SELECT 
    'ANTES DAS CORREÇÕES' as momento,
    'Políticas com auth.uid() não otimizado' as tipo,
    COUNT(*) as total
FROM pg_policies 
WHERE schemaname = 'public'
AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
AND (qual NOT LIKE '%(select auth.uid())%' AND with_check NOT LIKE '%(select auth.uid())%')

UNION ALL

SELECT 
    'ANTES DAS CORREÇÕES' as momento,
    'Políticas com auth.uid() otimizado' as tipo,
    COUNT(*) as total
FROM pg_policies 
WHERE schemaname = 'public'
AND (qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%')

UNION ALL

SELECT 
    'ANTES DAS CORREÇÕES' as momento,
    'Total de políticas RLS' as tipo,
    COUNT(*) as total
FROM pg_policies 
WHERE schemaname = 'public';

-- =====================================================
-- MONITORAMENTO 2: Tabelas que precisam de correção
-- =====================================================
SELECT 
    'TABELAS PARA CORREÇÃO' as categoria,
    tablename as tabela,
    COUNT(*) as politicas_para_corrigir,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PRECISA CORREÇÃO'
        ELSE 'OK'
    END as status
FROM pg_policies 
WHERE schemaname = 'public'
AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
AND (qual NOT LIKE '%(select auth.uid())%' AND with_check NOT LIKE '%(select auth.uid())%')
GROUP BY tablename
ORDER BY politicas_para_corrigir DESC;

-- =====================================================
-- MONITORAMENTO 3: Detalhes das políticas não corrigidas
-- =====================================================
SELECT 
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    CASE 
        WHEN qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%' THEN 'USING não otimizado'
        WHEN with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%' THEN 'WITH CHECK não otimizado'
        ELSE 'OK'
    END as status
FROM pg_policies 
WHERE schemaname = 'public'
AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
AND (qual NOT LIKE '%(select auth.uid())%' AND with_check NOT LIKE '%(select auth.uid())%')
ORDER BY tablename, policyname;

-- =====================================================
-- MONITORAMENTO 4: Verificação de RLS habilitado
-- =====================================================
SELECT 
    'RLS STATUS' as categoria,
    tablename as tabela,
    rowsecurity as rls_habilitado,
    CASE 
        WHEN rowsecurity THEN 'OK'
        ELSE 'RLS DESABILITADO'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
    'lead_lists', 'whatsapp_templates', 'contact_attempts', 
    'user_preferences', 'whatsapp_instances', 'bulk_campaigns',
    'analytics_events', 'system_logs', 'user_tags', 'blog_posts',
    'campaign_leads', 'whatsapp_responses', 'sales_conversions',
    'message_templates', 'lead_quality_scores'
)
ORDER BY tablename;

-- =====================================================
-- MONITORAMENTO 5: Resumo para execução
-- =====================================================
SELECT 
    'RESUMO PARA EXECUÇÃO' as categoria,
    'Tabelas com políticas para corrigir' as tipo,
    COUNT(DISTINCT tablename) as total
FROM pg_policies 
WHERE schemaname = 'public'
AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
AND (qual NOT LIKE '%(select auth.uid())%' AND with_check NOT LIKE '%(select auth.uid())%')

UNION ALL

SELECT 
    'RESUMO PARA EXECUÇÃO' as categoria,
    'Total de políticas para corrigir' as tipo,
    COUNT(*) as total
FROM pg_policies 
WHERE schemaname = 'public'
AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
AND (qual NOT LIKE '%(select auth.uid())%' AND with_check NOT LIKE '%(select auth.uid())%')

UNION ALL

SELECT 
    'RESUMO PARA EXECUÇÃO' as categoria,
    'Backup disponível' as tipo,
    COUNT(*) as total
FROM backup_policies_rls_performance;

-- =====================================================
-- INSTRUÇÕES PARA EXECUÇÃO
-- =====================================================
SELECT 
    'INSTRUÇÕES' as categoria,
    '1. Execute: correcao-conservadora-rls-performance.sql' as passo,
    '2. Execute: teste-correcoes-rls-performance.sql' as verificacao,
    '3. Se necessário: rollback-correcoes-rls-performance.sql' as rollback;











