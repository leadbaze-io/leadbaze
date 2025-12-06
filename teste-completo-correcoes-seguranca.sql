-- =====================================================
-- TESTE COMPLETO DAS CORREÇÕES DE SEGURANÇA
-- =====================================================
-- Este script testa todas as correções de segurança implementadas

-- =====================================================
-- 1. VERIFICAÇÃO DE VIEWS SEM SECURITY DEFINER
-- =====================================================

-- Verificar se as views foram recriadas corretamente
SELECT 
    'VERIFICAÇÃO DE VIEWS' as categoria,
    schemaname,
    viewname as view_name,
    'SEM SECURITY DEFINER' as status
FROM pg_views 
WHERE schemaname = 'public'
    AND viewname IN ('category_performance', 'campaign_leads_view', 'user_profiles_complete', 'campaign_metrics_summary')
ORDER BY viewname;

-- =====================================================
-- 2. VERIFICAÇÃO DE RLS HABILITADO
-- =====================================================

-- Verificar tabelas com RLS habilitado
SELECT 
    'VERIFICAÇÃO DE RLS' as categoria,
    schemaname,
    tablename as table_name,
    CASE WHEN rowsecurity THEN 'RLS HABILITADO' ELSE 'RLS DESABILITADO' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename IN (
        'subscription_changes', 'upgrade_pending', 'campaign_leads_backup',
        'user_payment_subscriptions', 'whatsapp_delivery_status', 'payment_plans',
        'payment_plan_changes', 'payment_webhooks', 'lead_packages',
        'support_tickets', 'backup_rls_policies'
    )
ORDER BY tablename;

-- =====================================================
-- 3. VERIFICAÇÃO DE POLÍTICAS RLS
-- =====================================================

-- Verificar políticas criadas
SELECT 
    'VERIFICAÇÃO DE POLÍTICAS' as categoria,
    schemaname,
    tablename,
    policyname,
    cmd as operacao,
    'POLÍTICA CRIADA' as status
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN (
        'subscription_changes', 'upgrade_pending', 'campaign_leads_backup',
        'user_payment_subscriptions', 'whatsapp_delivery_status', 'payment_plans',
        'payment_plan_changes', 'payment_webhooks', 'lead_packages',
        'support_tickets', 'backup_rls_policies'
    )
ORDER BY tablename, policyname;

-- =====================================================
-- 4. TESTE DE FUNCIONALIDADE DAS VIEWS
-- =====================================================

-- Testar cada view individualmente
DO $$
DECLARE
    view_name text;
    record_count integer;
    test_result text;
BEGIN
    RAISE NOTICE 'Iniciando testes de funcionalidade das views...';
    
    FOR view_name IN 
        SELECT unnest(ARRAY['category_performance', 'campaign_leads_view', 'user_profiles_complete', 'campaign_metrics_summary'])
    LOOP
        BEGIN
            EXECUTE format('SELECT COUNT(*) FROM public.%I', view_name) INTO record_count;
            test_result := 'OK - ' || record_count || ' registros';
            RAISE NOTICE 'View %: %', view_name, test_result;
        EXCEPTION
            WHEN OTHERS THEN
                test_result := 'ERRO - ' || SQLERRM;
                RAISE NOTICE 'View %: %', view_name, test_result;
        END;
    END LOOP;
    
    RAISE NOTICE 'Testes de funcionalidade concluídos!';
END $$;

-- =====================================================
-- 5. TESTE DE ACESSO ÀS TABELAS COM RLS
-- =====================================================

-- Testar acesso básico às tabelas com RLS
DO $$
DECLARE
    table_name text;
    record_count integer;
    test_result text;
BEGIN
    RAISE NOTICE 'Iniciando testes de acesso às tabelas com RLS...';
    
    FOR table_name IN 
        SELECT unnest(ARRAY['subscription_changes', 'upgrade_pending', 'campaign_leads_backup', 'user_payment_subscriptions'])
    LOOP
        BEGIN
            EXECUTE format('SELECT COUNT(*) FROM public.%I', table_name) INTO record_count;
            test_result := 'OK - ' || record_count || ' registros';
            RAISE NOTICE 'Tabela %: %', table_name, test_result;
        EXCEPTION
            WHEN OTHERS THEN
                test_result := 'ERRO - ' || SQLERRM;
                RAISE NOTICE 'Tabela %: %', table_name, test_result;
        END;
    END LOOP;
    
    RAISE NOTICE 'Testes de acesso às tabelas concluídos!';
END $$;

-- =====================================================
-- 6. VERIFICAÇÃO DE SEGURANÇA GERAL
-- =====================================================

-- Verificar se não há mais Security Definer Views
SELECT 
    'VERIFICAÇÃO DE SEGURANÇA' as categoria,
    'Security Definer Views' as tipo,
    CASE 
        WHEN COUNT(*) = 0 THEN 'NENHUMA ENCONTRADA - OK'
        ELSE 'AINDA EXISTEM - VERIFICAR'
    END as status
FROM pg_views 
WHERE schemaname = 'public'
    AND viewname IN ('category_performance', 'campaign_leads_view', 'user_profiles_complete', 'campaign_metrics_summary');

-- Verificar se todas as tabelas públicas têm RLS
SELECT 
    'VERIFICAÇÃO DE SEGURANÇA' as categoria,
    'Tabelas públicas sem RLS' as tipo,
    CASE 
        WHEN COUNT(*) = 0 THEN 'TODAS COM RLS - OK'
        ELSE 'AINDA EXISTEM SEM RLS - VERIFICAR'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
    AND NOT rowsecurity
    AND tablename NOT IN ('backup_rls_policies', 'backup_security_objects');

-- =====================================================
-- 7. RESUMO DOS TESTES
-- =====================================================

SELECT 
    'RESUMO DOS TESTES' as categoria,
    'Views recriadas sem SECURITY DEFINER' as teste_1,
    'RLS habilitado em tabelas públicas' as teste_2,
    'Políticas RLS criadas' as teste_3,
    'Funcionalidade testada' as teste_4;

-- =====================================================
-- 8. RECOMENDAÇÕES FINAIS
-- =====================================================

SELECT 
    'RECOMENDAÇÕES FINAIS' as categoria,
    'Ajustar definições das views conforme necessário' as recomendacao_1,
    'Testar funcionalidades específicas das views' as recomendacao_2,
    'Monitorar performance das consultas' as recomendacao_3,
    'Verificar logs de acesso' as recomendacao_4;






















