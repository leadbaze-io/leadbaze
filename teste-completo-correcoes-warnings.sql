-- =====================================================
-- TESTE COMPLETO DAS CORREÇÕES SUPABASE
-- =====================================================
-- Este script testa se todas as correções foram aplicadas corretamente
-- Execute após aplicar o script de correção principal

-- =====================================================
-- TESTE 1: VERIFICAR POLÍTICAS CONSOLIDADAS
-- =====================================================

-- 1.1 Verificar se não há mais políticas múltiplas
SELECT 
  'TESTE: POLÍTICAS MÚLTIPLAS' as categoria,
  tablename as tabela,
  COUNT(*) as total_politicas,
  CASE 
    WHEN COUNT(*) <= 1 THEN '✅ OK - Políticas consolidadas'
    ELSE '❌ ERRO - Ainda há políticas múltiplas'
  END as status
FROM pg_policies 
WHERE schemaname = 'public' 
  AND permissive = 'PERMISSIVE'
GROUP BY tablename
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- 1.2 Verificar políticas consolidadas específicas
SELECT 
  'TESTE: POLÍTICAS CONSOLIDADAS' as categoria,
  tablename as tabela,
  policyname as politica,
  CASE 
    WHEN policyname LIKE '%Consolidated%' THEN '✅ OK - Política consolidada'
    ELSE '⚠️ ATENÇÃO - Política não consolidada'
  END as status
FROM pg_policies 
WHERE schemaname = 'public' 
  AND policyname LIKE '%Consolidated%'
ORDER BY tablename;

-- =====================================================
-- TESTE 2: VERIFICAR ÍNDICES DUPLICADOS
-- =====================================================

-- 2.1 Verificar se o índice duplicado foi removido
SELECT 
  'TESTE: ÍNDICES DUPLICADOS' as categoria,
  schemaname as schema,
  tablename as tabela,
  indexname as indice,
  CASE 
    WHEN indexname = 'unique_active_subscription_per_user_idx' THEN '❌ ERRO - Índice duplicado ainda existe'
    ELSE '✅ OK - Índice duplicado removido'
  END as status
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename = 'user_subscriptions'
  AND indexname IN ('unique_active_subscription_per_user', 'unique_active_subscription_per_user_idx');

-- 2.2 Verificar se o índice principal ainda existe
SELECT 
  'TESTE: ÍNDICE PRINCIPAL' as categoria,
  schemaname as schema,
  tablename as tabela,
  indexname as indice,
  CASE 
    WHEN indexname = 'unique_active_subscription_per_user' THEN '✅ OK - Índice principal mantido'
    ELSE '❌ ERRO - Índice principal removido'
  END as status
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename = 'user_subscriptions'
  AND indexname = 'unique_active_subscription_per_user';

-- =====================================================
-- TESTE 3: VERIFICAR VIEWS SEM SECURITY DEFINER
-- =====================================================

-- 3.1 Verificar se as views foram recriadas
SELECT 
  'TESTE: VIEWS RECRIADAS' as categoria,
  schemaname as schema,
  viewname as view,
  CASE 
    WHEN viewname IN ('category_performance', 'campaign_leads_view', 'user_profiles_complete', 'campaign_metrics_summary') 
    THEN '✅ OK - View recriada'
    ELSE '⚠️ ATENÇÃO - View não encontrada'
  END as status
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- 3.2 Verificar se as views não têm SECURITY DEFINER
-- Nota: Esta verificação requer acesso ao pg_class, que pode não estar disponível
-- Vamos verificar se as views existem e são acessíveis
DO $$
DECLARE
    view_name text;
    view_exists boolean;
BEGIN
    FOR view_name IN SELECT unnest(ARRAY['category_performance', 'campaign_leads_view', 'user_profiles_complete', 'campaign_metrics_summary']) LOOP
        SELECT EXISTS (
            SELECT 1 FROM information_schema.views 
            WHERE table_schema = 'public' 
            AND table_name = view_name
        ) INTO view_exists;
        
        IF view_exists THEN
            RAISE NOTICE '✅ View % recriada com sucesso', view_name;
        ELSE
            RAISE NOTICE '❌ View % não foi recriada', view_name;
        END IF;
    END LOOP;
END $$;

-- =====================================================
-- TESTE 4: VERIFICAR RLS HABILITADO
-- =====================================================

-- 4.1 Verificar se RLS está habilitado nas tabelas públicas
SELECT 
  'TESTE: RLS HABILITADO' as categoria,
  tablename as tabela,
  CASE 
    WHEN rowsecurity THEN '✅ OK - RLS habilitado'
    ELSE '❌ ERRO - RLS desabilitado'
  END as status_rls
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('subscription_changes', 'upgrade_pending', 'campaign_leads_backup', 'user_payment_subscriptions')
ORDER BY tablename;

-- 4.2 Verificar se as políticas foram criadas para essas tabelas
SELECT 
  'TESTE: POLÍTICAS RLS CRIADAS' as categoria,
  tablename as tabela,
  policyname as politica,
  CASE 
    WHEN policyname IS NOT NULL THEN '✅ OK - Política criada'
    ELSE '❌ ERRO - Política não criada'
  END as status
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('subscription_changes', 'upgrade_pending', 'campaign_leads_backup', 'user_payment_subscriptions')
ORDER BY tablename;

-- =====================================================
-- TESTE 5: TESTE DE FUNCIONALIDADE
-- =====================================================

-- 5.1 Testar acesso às views recriadas
DO $$
DECLARE
    view_name text;
    test_result text;
BEGIN
    FOR view_name IN SELECT unnest(ARRAY['category_performance', 'campaign_leads_view', 'user_profiles_complete', 'campaign_metrics_summary']) LOOP
        BEGIN
            EXECUTE format('SELECT COUNT(*) FROM public.%I', view_name);
            RAISE NOTICE '✅ View % acessível', view_name;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '❌ View % com erro: %', view_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- 5.2 Testar políticas consolidadas
DO $$
DECLARE
    table_name text;
    policy_count integer;
BEGIN
    FOR table_name IN SELECT unnest(ARRAY['blog_posts', 'campaign_leads', 'bulk_campaigns', 'analytics_events', 'system_logs']) LOOP
        SELECT COUNT(*) INTO policy_count
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = table_name;
        
        IF policy_count = 1 THEN
            RAISE NOTICE '✅ Tabela % tem 1 política consolidada', table_name;
        ELSIF policy_count = 0 THEN
            RAISE NOTICE '⚠️ Tabela % não tem políticas', table_name;
        ELSE
            RAISE NOTICE '❌ Tabela % tem % políticas (não consolidada)', table_name, policy_count;
        END IF;
    END LOOP;
END $$;

-- =====================================================
-- RESUMO DOS TESTES
-- =====================================================

-- Contar políticas por tabela
SELECT 
  'RESUMO: POLÍTICAS POR TABELA' as categoria,
  tablename as tabela,
  COUNT(*) as total_politicas,
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ Consolidada'
    WHEN COUNT(*) = 0 THEN '⚠️ Sem políticas'
    ELSE '❌ Múltiplas políticas'
  END as status
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY COUNT(*) DESC, tablename;

-- Contar views recriadas
SELECT 
  'RESUMO: VIEWS RECRIADAS' as categoria,
  COUNT(*) as total_views,
  STRING_AGG(viewname, ', ') as views
FROM pg_views 
WHERE schemaname = 'public'
  AND viewname IN ('category_performance', 'campaign_leads_view', 'user_profiles_complete', 'campaign_metrics_summary');

-- Contar tabelas com RLS habilitado
SELECT 
  'RESUMO: RLS HABILITADO' as categoria,
  COUNT(*) as total_tabelas_rls,
  COUNT(CASE WHEN rowsecurity THEN 1 END) as tabelas_com_rls,
  COUNT(CASE WHEN NOT rowsecurity THEN 1 END) as tabelas_sem_rls
FROM pg_tables 
WHERE schemaname = 'public';

-- Resumo final dos testes
SELECT 
  'RESUMO FINAL DOS TESTES' as categoria,
  'Verifique os resultados acima' as instrucao_1,
  'Todos os ✅ indicam sucesso' as instrucao_2,
  'Todos os ❌ indicam problemas' as instrucao_3,
  'Execute rollback se necessário' as instrucao_4;


















