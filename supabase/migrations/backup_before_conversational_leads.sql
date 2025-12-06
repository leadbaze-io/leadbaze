-- ============================================
-- SCRIPT DE BACKUP COMPLETO - SUPABASE
-- Execute ANTES de criar as novas tabelas
-- Data: 2025-12-05
-- ============================================

-- =============================================
-- 1. BACKUP DE TODAS AS TABELAS (ESTRUTURA)
-- =============================================

-- Criar schema de backup
CREATE SCHEMA IF NOT EXISTS backup_2025_12_05;

-- Comentário no schema
COMMENT ON SCHEMA backup_2025_12_05 IS 
    'Backup completo antes de criar conversational_leads e demo_appointments';

-- =============================================
-- 2. BACKUP DAS POLÍTICAS RLS
-- =============================================

CREATE TABLE IF NOT EXISTS backup_2025_12_05.rls_policies_backup AS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check,
    now() as backup_timestamp
FROM pg_policies
WHERE schemaname = 'public';

-- =============================================
-- 3. BACKUP DO STATUS DE RLS
-- =============================================

CREATE TABLE IF NOT EXISTS backup_2025_12_05.rls_status_backup AS
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    now() as backup_timestamp
FROM pg_tables
WHERE schemaname = 'public';

-- =============================================
-- 4. BACKUP DE TRIGGERS
-- =============================================

CREATE TABLE IF NOT EXISTS backup_2025_12_05.triggers_backup AS
SELECT
    event_object_schema,
    event_object_table,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement,
    now() as backup_timestamp
FROM information_schema.triggers
WHERE event_object_schema = 'public';

-- =============================================
-- 5. BACKUP DE CONSTRAINTS
-- =============================================

CREATE TABLE IF NOT EXISTS backup_2025_12_05.constraints_backup AS
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    now() as backup_timestamp
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public';

-- =============================================
-- 6. BACKUP DE ÍNDICES
-- =============================================

CREATE TABLE IF NOT EXISTS backup_2025_12_05.indexes_backup AS
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef,
    now() as backup_timestamp
FROM pg_indexes
WHERE schemaname = 'public';

-- =============================================
-- 7. BACKUP DE FUNÇÕES
-- =============================================

CREATE TABLE IF NOT EXISTS backup_2025_12_05.functions_backup AS
SELECT
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_functiondef(p.oid) as function_definition,
    now() as backup_timestamp
FROM pg_proc p
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public';

-- =============================================
-- 8. BACKUP DE ESTRUTURA DAS TABELAS
-- =============================================

CREATE TABLE IF NOT EXISTS backup_2025_12_05.table_structure_backup AS
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.is_nullable,
    c.column_default,
    c.ordinal_position,
    now() as backup_timestamp
FROM information_schema.tables t
JOIN information_schema.columns c 
    ON t.table_name = c.table_name 
    AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public'
ORDER BY t.table_name, c.ordinal_position;

-- =============================================
-- 9. REGISTRO DO BACKUP
-- =============================================

CREATE TABLE IF NOT EXISTS backup_2025_12_05.backup_metadata AS
SELECT
    'backup_2025_12_05' as backup_name,
    'Backup completo antes de criar conversational_leads e demo_appointments' as description,
    now() as backup_timestamp,
    (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
    (SELECT count(*) FROM pg_policies WHERE schemaname = 'public') as total_policies,
    (SELECT count(*) FROM information_schema.triggers WHERE event_object_schema = 'public') as total_triggers,
    current_user as backup_user,
    version() as postgres_version;

-- =============================================
-- VERIFICAÇÃO DO BACKUP
-- =============================================

-- Ver resumo do backup
SELECT * FROM backup_2025_12_05.backup_metadata;

-- Ver quantas tabelas foram backupeadas
SELECT 
    'Políticas RLS' as item,
    count(*) as quantidade
FROM backup_2025_12_05.rls_policies_backup
UNION ALL
SELECT 
    'Triggers' as item,
    count(*) as quantidade
FROM backup_2025_12_05.triggers_backup
UNION ALL
SELECT 
    'Constraints' as item,
    count(*) as quantidade
FROM backup_2025_12_05.constraints_backup
UNION ALL
SELECT 
    'Índices' as item,
    count(*) as quantidade
FROM backup_2025_12_05.indexes_backup
UNION ALL
SELECT 
    'Funções' as item,
    count(*) as quantidade
FROM backup_2025_12_05.functions_backup;

-- =============================================
-- INSTRUÇÕES DE RESTAURAÇÃO (SE NECESSÁRIO)
-- =============================================

-- Para restaurar as políticas RLS:
-- SELECT * FROM backup_2025_12_05.rls_policies_backup;

-- Para restaurar triggers:
-- SELECT * FROM backup_2025_12_05.triggers_backup;

-- Para ver estrutura original das tabelas:
-- SELECT * FROM backup_2025_12_05.table_structure_backup 
-- WHERE table_name = 'nome_da_tabela';

-- =============================================
-- PARA DELETAR O BACKUP (DEPOIS DE CONFIRMAR)
-- =============================================

-- DROP SCHEMA backup_2025_12_05 CASCADE;

-- =============================================
-- FIM DO SCRIPT DE BACKUP
-- =============================================
