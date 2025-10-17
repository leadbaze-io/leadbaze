-- =====================================================
-- VERIFICAÇÃO DO ROLLBACK COMPLETO
-- =====================================================
-- Este script verifica se o rollback foi bem-sucedido
-- e se voltamos ao estado inicial (80 warnings)
-- =====================================================

-- =====================================================
-- VERIFICAÇÃO 1: Políticas restantes
-- =====================================================
SELECT 
    'VERIFICAÇÃO ROLLBACK' as categoria,
    'Total de políticas restantes' as tipo,
    COUNT(*) as total
FROM pg_policies 
WHERE schemaname = 'public';

-- =====================================================
-- VERIFICAÇÃO 2: Políticas por tabela
-- =====================================================
SELECT 
    'POLÍTICAS POR TABELA' as categoria,
    tablename as tabela,
    COUNT(*) as total_politicas
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY total_politicas DESC;

-- =====================================================
-- VERIFICAÇÃO 3: Views restantes
-- =====================================================
SELECT 
    'VIEWS RESTANTES' as categoria,
    table_name as view,
    'OK' as status
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- VERIFICAÇÃO 4: Funções restantes
-- =====================================================
SELECT 
    'FUNÇÕES RESTANTES' as categoria,
    routine_name as funcao,
    routine_type as tipo
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name NOT LIKE 'pg_%'
ORDER BY routine_name;

-- =====================================================
-- VERIFICAÇÃO 5: RLS status
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
-- VERIFICAÇÃO 6: Índices restantes
-- =====================================================
SELECT 
    'ÍNDICES RESTANTES' as categoria,
    tablename as tabela,
    indexname as indice,
    indexdef as definicao
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN (
    'lead_lists', 'whatsapp_templates', 'contact_attempts', 
    'user_preferences', 'whatsapp_instances', 'bulk_campaigns',
    'analytics_events', 'system_logs', 'user_tags', 'blog_posts',
    'campaign_leads', 'whatsapp_responses', 'sales_conversions',
    'message_templates', 'lead_quality_scores'
)
ORDER BY tablename, indexname;

-- =====================================================
-- VERIFICAÇÃO 7: Resumo final
-- =====================================================
SELECT 
    'RESUMO FINAL' as categoria,
    'Políticas RLS' as tipo,
    COUNT(*) as total
FROM pg_policies 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'RESUMO FINAL' as categoria,
    'Views' as tipo,
    COUNT(*) as total
FROM information_schema.views 
WHERE table_schema = 'public'

UNION ALL

SELECT 
    'RESUMO FINAL' as categoria,
    'Funções customizadas' as tipo,
    COUNT(*) as total
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name NOT LIKE 'pg_%'

UNION ALL

SELECT 
    'RESUMO FINAL' as categoria,
    'Tabelas com RLS' as tipo,
    COUNT(*) as total
FROM pg_tables 
WHERE schemaname = 'public'
AND rowsecurity = true;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'ROLLBACK VERIFICADO' as status,
    'Banco restaurado para estado inicial' as mensagem,
    'Verifique os warnings no Supabase' as proximo_passo;











