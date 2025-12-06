-- ============================================
-- SCRIPT DE ANÁLISE COMPLETA DO BANCO SUPABASE
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- =============================================
-- 1. LISTAR TODAS AS TABELAS
-- =============================================
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- =============================================
-- 2. ESTRUTURA DETALHADA DE CADA TABELA
-- =============================================
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.is_nullable,
    c.column_default,
    pgd.description as column_comment
FROM information_schema.tables t
JOIN information_schema.columns c 
    ON t.table_name = c.table_name 
    AND t.table_schema = c.table_schema
LEFT JOIN pg_catalog.pg_statio_all_tables st 
    ON st.relname = t.table_name
LEFT JOIN pg_catalog.pg_description pgd 
    ON pgd.objoid = st.relid 
    AND pgd.objsubid = c.ordinal_position
WHERE t.table_schema = 'public'
ORDER BY t.table_name, c.ordinal_position;

-- =============================================
-- 3. CONSTRAINTS E CHAVES PRIMÁRIAS
-- =============================================
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- =============================================
-- 4. ÍNDICES
-- =============================================
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =============================================
-- 5. POLÍTICAS RLS (Row Level Security)
-- =============================================
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================
-- 6. STATUS DO RLS POR TABELA
-- =============================================
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- =============================================
-- 7. TRIGGERS
-- =============================================
SELECT
    event_object_schema AS schema_name,
    event_object_table AS table_name,
    trigger_name,
    event_manipulation AS trigger_event,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =============================================
-- 8. FUNÇÕES CUSTOMIZADAS
-- =============================================
SELECT
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_arguments(p.oid) as arguments,
    CASE
        WHEN p.prokind = 'f' THEN 'FUNCTION'
        WHEN p.prokind = 'p' THEN 'PROCEDURE'
        WHEN p.prokind = 'a' THEN 'AGGREGATE'
        WHEN p.prokind = 'w' THEN 'WINDOW'
    END as function_type
FROM pg_proc p
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY function_name;

-- =============================================
-- 9. VERIFICAR SE TABELAS JÁ EXISTEM
-- =============================================
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversational_leads')
        THEN '❌ ATENÇÃO: Tabela conversational_leads JÁ EXISTE'
        ELSE '✅ OK: Tabela conversational_leads NÃO existe'
    END as conversational_leads_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'demo_appointments')
        THEN '❌ ATENÇÃO: Tabela demo_appointments JÁ EXISTE'
        ELSE '✅ OK: Tabela demo_appointments NÃO existe'
    END as demo_appointments_status;

-- =============================================
-- 10. CONTAGEM DE REGISTROS POR TABELA
-- =============================================
SELECT
    schemaname,
    relname as tablename,
    n_live_tup AS estimated_row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- =============================================
-- 11. TAMANHO DAS TABELAS
-- =============================================
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =============================================
-- 12. VERIFICAR RELACIONAMENTOS EXISTENTES
-- =============================================
SELECT
    tc.table_name as from_table,
    kcu.column_name as from_column,
    ccu.table_name AS to_table,
    ccu.column_name AS to_column,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- =============================================
-- FIM DO SCRIPT DE ANÁLISE
-- =============================================

-- INSTRUÇÕES:
-- 1. Execute cada seção separadamente no SQL Editor
-- 2. Analise os resultados de cada query
-- 3. Verifique especialmente a seção 9 para ver se as tabelas já existem
-- 4. Compartilhe os resultados para decidirmos a melhor estratégia
