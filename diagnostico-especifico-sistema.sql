-- =====================================================
-- DIAGNÓSTICO ESPECÍFICO DO SISTEMA QUEBRADO
-- =====================================================
-- Este script identifica exatamente o que está quebrado
-- e o que precisa ser restaurado
-- =====================================================

-- =====================================================
-- DIAGNÓSTICO 1: Verificar estado atual das tabelas
-- =====================================================
SELECT 
    'ESTADO ATUAL DAS TABELAS' as categoria,
    table_name as tabela,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = table_name) THEN 'EXISTE'
        ELSE 'NÃO EXISTE'
    END as existe,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = table_name AND rowsecurity = true) THEN 'RLS HABILITADO'
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = table_name AND rowsecurity = false) THEN 'RLS DESABILITADO'
        ELSE 'N/A'
    END as rls_status
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN (
    'lead_lists', 'whatsapp_templates', 'contact_attempts', 
    'user_preferences', 'whatsapp_instances', 'bulk_campaigns',
    'analytics_events', 'system_logs', 'user_tags', 'blog_posts',
    'campaign_leads', 'whatsapp_responses', 'sales_conversions',
    'message_templates', 'lead_quality_scores'
)
ORDER BY table_name;

-- =====================================================
-- DIAGNÓSTICO 2: Verificar políticas existentes
-- =====================================================
SELECT 
    'POLÍTICAS EXISTENTES' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    CASE 
        WHEN qual IS NULL THEN 'QUAL NULL'
        WHEN qual = '' THEN 'QUAL VAZIO'
        ELSE 'QUAL OK'
    END as qual_status,
    CASE 
        WHEN with_check IS NULL THEN 'WITH_CHECK NULL'
        WHEN with_check = '' THEN 'WITH_CHECK VAZIO'
        ELSE 'WITH_CHECK OK'
    END as with_check_status
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- DIAGNÓSTICO 3: Verificar índices existentes
-- =====================================================
SELECT 
    'ÍNDICES EXISTENTES' as categoria,
    tablename as tabela,
    indexname as indice,
    indexdef as definicao
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN (
    'lead_lists', 'bulk_campaigns', 'analytics_events'
)
ORDER BY tablename, indexname;

-- =====================================================
-- DIAGNÓSTICO 4: Verificar views existentes
-- =====================================================
SELECT 
    'VIEWS EXISTENTES' as categoria,
    table_name as view,
    view_definition as definicao
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- DIAGNÓSTICO 5: Verificar funções existentes
-- =====================================================
SELECT 
    'FUNÇÕES EXISTENTES' as categoria,
    routine_name as funcao,
    routine_type as tipo,
    routine_definition as definicao
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name NOT LIKE 'pg_%'
ORDER BY routine_name;

-- =====================================================
-- DIAGNÓSTICO 6: Verificar constraints existentes
-- =====================================================
SELECT 
    'CONSTRAINTS EXISTENTES' as categoria,
    table_name as tabela,
    constraint_name as constraint,
    constraint_type as tipo
FROM information_schema.table_constraints 
WHERE table_schema = 'public'
AND table_name IN (
    'lead_lists', 'whatsapp_templates', 'contact_attempts', 
    'user_preferences', 'whatsapp_instances', 'bulk_campaigns',
    'analytics_events', 'system_logs', 'user_tags', 'blog_posts',
    'campaign_leads', 'whatsapp_responses', 'sales_conversions',
    'message_templates', 'lead_quality_scores'
)
ORDER BY table_name, constraint_name;

-- =====================================================
-- DIAGNÓSTICO 7: Verificar colunas das tabelas principais
-- =====================================================
SELECT 
    'COLUNAS DAS TABELAS' as categoria,
    table_name as tabela,
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable,
    column_default as default_value
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name IN (
    'lead_lists', 'bulk_campaigns', 'campaign_leads'
)
ORDER BY table_name, ordinal_position;

-- =====================================================
-- DIAGNÓSTICO 8: Teste de acesso às tabelas principais
-- =====================================================
-- Testar se conseguimos acessar as tabelas principais
DO $$
DECLARE
    record_count integer;
BEGIN
    -- Testar lead_lists
    BEGIN
        SELECT COUNT(*) INTO record_count FROM lead_lists;
        RAISE NOTICE 'lead_lists: % registros', record_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'ERRO ao acessar lead_lists: %', SQLERRM;
    END;
    
    -- Testar bulk_campaigns
    BEGIN
        SELECT COUNT(*) INTO record_count FROM bulk_campaigns;
        RAISE NOTICE 'bulk_campaigns: % registros', record_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'ERRO ao acessar bulk_campaigns: %', SQLERRM;
    END;
    
    -- Testar whatsapp_instances
    BEGIN
        SELECT COUNT(*) INTO record_count FROM whatsapp_instances;
        RAISE NOTICE 'whatsapp_instances: % registros', record_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'ERRO ao acessar whatsapp_instances: %', SQLERRM;
    END;
END $$;

-- =====================================================
-- DIAGNÓSTICO 9: Resumo dos problemas encontrados
-- =====================================================
SELECT 
    'RESUMO DOS PROBLEMAS' as categoria,
    'Tabelas sem RLS' as tipo,
    COUNT(*) as total
FROM pg_tables 
WHERE schemaname = 'public'
AND rowsecurity = false
AND tablename IN (
    'lead_lists', 'whatsapp_templates', 'contact_attempts', 
    'user_preferences', 'whatsapp_instances', 'bulk_campaigns',
    'analytics_events', 'system_logs', 'user_tags', 'blog_posts',
    'campaign_leads', 'whatsapp_responses', 'sales_conversions',
    'message_templates', 'lead_quality_scores'
)

UNION ALL

SELECT 
    'RESUMO DOS PROBLEMAS' as categoria,
    'Tabelas sem políticas' as tipo,
    COUNT(*) as total
FROM information_schema.tables t
LEFT JOIN pg_policies p ON t.table_name = p.tablename AND p.schemaname = 'public'
WHERE t.table_schema = 'public'
AND t.table_name IN (
    'lead_lists', 'whatsapp_templates', 'contact_attempts', 
    'user_preferences', 'whatsapp_instances', 'bulk_campaigns',
    'analytics_events', 'system_logs', 'user_tags', 'blog_posts',
    'campaign_leads', 'whatsapp_responses', 'sales_conversions',
    'message_templates', 'lead_quality_scores'
)
AND p.policyname IS NULL

UNION ALL

SELECT 
    'RESUMO DOS PROBLEMAS' as categoria,
    'Tabelas sem índices' as tipo,
    COUNT(*) as total
FROM information_schema.tables t
LEFT JOIN pg_indexes i ON t.table_name = i.tablename AND i.schemaname = 'public'
WHERE t.table_schema = 'public'
AND t.table_name IN (
    'lead_lists', 'bulk_campaigns', 'analytics_events'
)
AND i.indexname IS NULL;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'DIAGNÓSTICO CONCLUÍDO' as status,
    'Analise os resultados acima' as mensagem,
    'Identifique o que precisa ser restaurado' as proximo_passo;






















