-- =====================================================
-- TESTE RÁPIDO - ESTRUTURA PG_POLICIES
-- =====================================================
-- Script para verificar a estrutura correta da tabela pg_policies
-- =====================================================

-- Verificar estrutura da tabela pg_policies
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'pg_policies'
ORDER BY ordinal_position;

-- Testar consulta simples para verificar tipos
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
LIMIT 5;

-- Verificar valores possíveis para permissive
SELECT DISTINCT permissive
FROM pg_policies 
WHERE schemaname = 'public';




















