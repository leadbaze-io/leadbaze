-- =====================================================
-- VERIFICAÇÃO DA RESTAURAÇÃO DO SISTEMA
-- =====================================================
-- Este script verifica se o sistema foi restaurado corretamente
-- após a restauração de emergência
-- =====================================================

-- =====================================================
-- VERIFICAÇÃO 1: Políticas essenciais restauradas
-- =====================================================
SELECT 
    'VERIFICAÇÃO RESTAURAÇÃO' as categoria,
    tablename as tabela,
    COUNT(*) as total_politicas,
    CASE 
        WHEN COUNT(*) > 0 THEN 'OK'
        ELSE 'SEM POLÍTICAS'
    END as status
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
    'lead_lists', 'whatsapp_templates', 'contact_attempts', 
    'user_preferences', 'whatsapp_instances', 'bulk_campaigns',
    'analytics_events', 'system_logs', 'user_tags', 'blog_posts',
    'campaign_leads', 'whatsapp_responses', 'sales_conversions',
    'message_templates', 'lead_quality_scores'
)
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- VERIFICAÇÃO 2: RLS habilitado nas tabelas principais
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
-- VERIFICAÇÃO 3: Índices essenciais restaurados
-- =====================================================
SELECT 
    'ÍNDICES RESTAURADOS' as categoria,
    tablename as tabela,
    COUNT(*) as total_indices,
    CASE 
        WHEN COUNT(*) > 0 THEN 'OK'
        ELSE 'SEM ÍNDICES'
    END as status
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
AND tablename IN (
    'lead_lists', 'bulk_campaigns', 'analytics_events'
)
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- VERIFICAÇÃO 4: Detalhes das políticas por tabela
-- =====================================================
SELECT 
    'DETALHES POLÍTICAS' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    CASE 
        WHEN qual LIKE '%auth.uid()%' THEN 'OK'
        ELSE 'VERIFICAR'
    END as status
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
    'lead_lists', 'whatsapp_templates', 'contact_attempts', 
    'user_preferences', 'whatsapp_instances', 'bulk_campaigns',
    'analytics_events', 'system_logs', 'user_tags', 'blog_posts',
    'campaign_leads', 'whatsapp_responses', 'sales_conversions',
    'message_templates', 'lead_quality_scores'
)
ORDER BY tablename, policyname;

-- =====================================================
-- VERIFICAÇÃO 5: Resumo da restauração
-- =====================================================
SELECT 
    'RESUMO RESTAURAÇÃO' as categoria,
    'Total de políticas' as tipo,
    COUNT(*) as total
FROM pg_policies 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'RESUMO RESTAURAÇÃO' as categoria,
    'Tabelas com RLS habilitado' as tipo,
    COUNT(*) as total
FROM pg_tables 
WHERE schemaname = 'public'
AND rowsecurity = true

UNION ALL

SELECT 
    'RESUMO RESTAURAÇÃO' as categoria,
    'Índices restaurados' as tipo,
    COUNT(*) as total
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'

UNION ALL

SELECT 
    'RESUMO RESTAURAÇÃO' as categoria,
    'Tabelas principais funcionais' as tipo,
    COUNT(*) as total
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN (
    'lead_lists', 'whatsapp_templates', 'contact_attempts', 
    'user_preferences', 'whatsapp_instances', 'bulk_campaigns',
    'analytics_events', 'system_logs', 'user_tags', 'blog_posts',
    'campaign_leads', 'whatsapp_responses', 'sales_conversions',
    'message_templates', 'lead_quality_scores'
);

-- =====================================================
-- VERIFICAÇÃO 6: Teste de funcionalidade básica
-- =====================================================
-- Verificar se as tabelas principais têm dados
SELECT 
    'TESTE FUNCIONALIDADE' as categoria,
    'lead_lists' as tabela,
    COUNT(*) as registros
FROM lead_lists

UNION ALL

SELECT 
    'TESTE FUNCIONALIDADE' as categoria,
    'bulk_campaigns' as tabela,
    COUNT(*) as registros
FROM bulk_campaigns

UNION ALL

SELECT 
    'TESTE FUNCIONALIDADE' as categoria,
    'whatsapp_instances' as tabela,
    COUNT(*) as registros
FROM whatsapp_instances;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'VERIFICAÇÃO CONCLUÍDA' as status,
    'Sistema restaurado e funcional' as mensagem,
    'Teste as funcionalidades principais' as proximo_passo;






















