-- =====================================================
-- VERIFICAÇÃO - 11 ERROS DE SEGURANÇA CORRIGIDOS
-- =====================================================
-- Este script verifica se os 11 erros de segurança
-- foram corrigidos com sucesso
-- =====================================================

-- =====================================================
-- VERIFICAÇÃO 1: Views com SECURITY DEFINER removidas
-- =====================================================
SELECT 
    'VERIFICAÇÃO VIEWS' as categoria,
    'campaign_metrics_summary' as view_name,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'campaign_metrics_summary') THEN '✅ REMOVIDA'
        ELSE '❌ AINDA EXISTE'
    END as status
UNION ALL
SELECT 
    'VERIFICAÇÃO VIEWS' as categoria,
    'user_profiles_complete' as view_name,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'user_profiles_complete') THEN '✅ REMOVIDA'
        ELSE '❌ AINDA EXISTE'
    END as status
UNION ALL
SELECT 
    'VERIFICAÇÃO VIEWS' as categoria,
    'campaign_leads_view' as view_name,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'campaign_leads_view') THEN '✅ REMOVIDA'
        ELSE '❌ AINDA EXISTE'
    END as status;

-- =====================================================
-- VERIFICAÇÃO 2: RLS habilitado em tabelas públicas
-- =====================================================
SELECT 
    'VERIFICAÇÃO RLS' as categoria,
    t.table_name as tabela,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables pt WHERE pt.schemaname = 'public' AND pt.tablename = t.table_name AND pt.rowsecurity) THEN '✅ RLS ATIVO'
        ELSE '❌ RLS INATIVO'
    END as rls_status
FROM information_schema.tables t
WHERE t.table_schema = 'public'
AND t.table_name IN (
    'subscription_changes',
    'upgrade_pending', 
    'campaign_leads_backup',
    'user_payment_subscriptions',
    'backup_rls_performance',
    'backup_seguro_antes_rollback'
)
ORDER BY t.table_name;

-- =====================================================
-- VERIFICAÇÃO 3: Políticas RLS criadas
-- =====================================================
SELECT 
    'VERIFICAÇÃO POLÍTICAS' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    CASE 
        WHEN permissive THEN 'PERMISSIVA'
        ELSE 'RESTRITIVA'
    END as tipo
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
    'subscription_changes',
    'upgrade_pending', 
    'campaign_leads_backup',
    'user_payment_subscriptions',
    'backup_rls_performance',
    'backup_seguro_antes_rollback'
)
ORDER BY tablename, policyname;

-- =====================================================
-- VERIFICAÇÃO 4: Resumo das correções
-- =====================================================
SELECT 
    'RESUMO CORREÇÕES' as categoria,
    'Views com SECURITY DEFINER removidas' as correcao,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name IN ('campaign_metrics_summary', 'user_profiles_complete', 'campaign_leads_view')) THEN '✅ CONCLUÍDA'
        ELSE '❌ PENDENTE'
    END as status
UNION ALL
SELECT 
    'RESUMO CORREÇÕES' as categoria,
    'RLS habilitado em tabelas públicas' as correcao,
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.tables t JOIN pg_tables pt ON t.table_name = pt.tablename WHERE t.table_schema = 'public' AND t.table_name IN ('subscription_changes', 'upgrade_pending', 'campaign_leads_backup', 'user_payment_subscriptions', 'backup_rls_performance', 'backup_seguro_antes_rollback') AND pt.rowsecurity) = 6 THEN '✅ CONCLUÍDA'
        ELSE '❌ PENDENTE'
    END as status
UNION ALL
SELECT 
    'RESUMO CORREÇÕES' as categoria,
    'Políticas RLS criadas' as correcao,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('subscription_changes', 'upgrade_pending', 'campaign_leads_backup', 'user_payment_subscriptions', 'backup_rls_performance', 'backup_seguro_antes_rollback')) >= 6 THEN '✅ CONCLUÍDA'
        ELSE '❌ PENDENTE'
    END as status;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'VERIFICAÇÃO CONCLUÍDA' as status,
    'Confirme se todos os 11 erros de segurança foram corrigidos' as mensagem,
    'Se tudo estiver OK, prossiga para os próximos problemas' as proximo_passo;











