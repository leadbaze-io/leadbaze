-- =====================================================
-- ANÁLISE DE IMPACTO DAS CORREÇÕES RLS
-- =====================================================
-- Este script analisa o impacto das correções de RLS antes da aplicação

-- =====================================================
-- 1. VERIFICAÇÃO DE TABELAS EXISTENTES
-- =====================================================

-- Verificar quais tabelas realmente existem
SELECT 
    'TABELAS EXISTENTES' as categoria,
    table_name as tabela,
    'OK' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN (
        'lead_lists', 'whatsapp_templates', 'contact_attempts', 
        'user_preferences', 'whatsapp_instances', 'bulk_campaigns',
        'analytics_events', 'system_logs', 'user_tags', 'blog_posts',
        'campaign_leads', 'whatsapp_responses', 'sales_conversions',
        'message_templates', 'lead_quality_scores', 'analytics_insights',
        'campaign_performance_metrics', 'campaign_unique_leads',
        'campaign_lists', 'campaigns'
    )
ORDER BY table_name;

-- =====================================================
-- 2. VERIFICAÇÃO DE POLÍTICAS ATUAIS
-- =====================================================

-- Verificar políticas existentes que serão afetadas
SELECT 
    'POLÍTICAS ATUAIS' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    'SERÁ OTIMIZADA' as status
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN (
        'lead_lists', 'whatsapp_templates', 'contact_attempts', 
        'user_preferences', 'whatsapp_instances', 'bulk_campaigns',
        'analytics_events', 'system_logs', 'user_tags', 'blog_posts',
        'campaign_leads', 'whatsapp_responses', 'sales_conversions',
        'message_templates', 'lead_quality_scores', 'analytics_insights',
        'campaign_performance_metrics', 'campaign_unique_leads',
        'campaign_lists', 'campaigns'
    )
ORDER BY tablename, policyname;

-- =====================================================
-- 3. VERIFICAÇÃO DE FUNCIONALIDADES CRÍTICAS
-- =====================================================

-- Verificar se há dados que dependem das políticas atuais
DO $$
DECLARE
    tbl_name text;
    record_count integer;
BEGIN
    -- Verificar tabelas críticas
    FOR tbl_name IN 
        SELECT unnest(ARRAY[
            'lead_lists', 'whatsapp_instances', 'bulk_campaigns',
            'campaign_leads', 'analytics_events'
        ])
    LOOP
        -- Verificar se a tabela existe
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = tbl_name
        ) THEN
            EXECUTE format('SELECT COUNT(*) FROM public.%I', tbl_name) INTO record_count;
            
            RAISE NOTICE 'Tabela %: % registros', tbl_name, record_count;
        ELSE
            RAISE NOTICE 'Tabela %: NÃO EXISTE', tbl_name;
        END IF;
    END LOOP;
END $$;

-- =====================================================
-- 4. VERIFICAÇÃO DE ÍNDICES EXISTENTES
-- =====================================================

-- Verificar índices que podem ser afetados pelas políticas RLS
SELECT 
    'ÍNDICES EXISTENTES' as categoria,
    schemaname as schema,
    tablename as tabela,
    indexname as indice,
    indexdef as definicao
FROM pg_indexes 
WHERE schemaname = 'public'
    AND tablename IN (
        'lead_lists', 'whatsapp_instances', 'bulk_campaigns',
        'campaign_leads', 'analytics_events'
    )
ORDER BY tablename, indexname;

-- =====================================================
-- 5. VERIFICAÇÃO DE CONSTRAINTS
-- =====================================================

-- Verificar constraints que podem ser afetadas
SELECT 
    'CONSTRAINTS EXISTENTES' as categoria,
    table_name as tabela,
    constraint_name as constraint,
    constraint_type as tipo
FROM information_schema.table_constraints 
WHERE table_schema = 'public'
    AND table_name IN (
        'lead_lists', 'whatsapp_instances', 'bulk_campaigns',
        'campaign_leads', 'analytics_events'
    )
ORDER BY table_name, constraint_name;

-- =====================================================
-- 6. RESUMO DE IMPACTO
-- =====================================================

SELECT 
    'RESUMO DE IMPACTO' as categoria,
    'Políticas RLS serão otimizadas' as acao,
    'Melhoria de performance esperada' as resultado,
    'Baixo risco de impacto funcional' as risco;

-- =====================================================
-- 7. RECOMENDAÇÕES DE TESTE
-- =====================================================

SELECT 
    'RECOMENDAÇÕES DE TESTE' as categoria,
    'Testar consultas por user_id' as teste_1,
    'Verificar permissões de acesso' as teste_2,
    'Validar operações CRUD' as teste_3,
    'Monitorar performance pós-correção' as teste_4;
