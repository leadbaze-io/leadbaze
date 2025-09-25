-- =====================================================
-- VERIFICAÇÃO DE TABELAS DE CAMPANHAS
-- =====================================================

-- 1. Verificar se a tabela 'campaigns' existe
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('campaigns', 'bulk_campaigns')
ORDER BY table_name;

-- 2. Verificar estrutura da tabela 'campaigns' (se existir)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'campaigns'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da tabela 'bulk_campaigns' (se existir)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'bulk_campaigns'
ORDER BY ordinal_position;

-- 4. Verificar dados de exemplo na tabela 'campaigns'
SELECT 
    id,
    name,
    status,
    total_leads,
    success_count,
    failed_count,
    sent_at,
    completed_at,
    created_at,
    updated_at
FROM campaigns 
LIMIT 5;

-- 5. Verificar dados de exemplo na tabela 'bulk_campaigns' (se existir)
SELECT 
    id,
    name,
    status,
    total_leads,
    success_count,
    failed_count,
    sent_at,
    completed_at,
    created_at,
    updated_at
FROM bulk_campaigns 
LIMIT 5;

-- 6. Verificar políticas RLS das tabelas
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
WHERE tablename IN ('campaigns', 'bulk_campaigns')
ORDER BY tablename, policyname;

-- 7. Verificar se existem triggers nas tabelas
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('campaigns', 'bulk_campaigns')
ORDER BY event_object_table, trigger_name;


















