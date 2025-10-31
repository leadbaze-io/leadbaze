-- =====================================================
-- CONSULTAR BACKUP SALVO
-- =====================================================
-- Este script permite consultar os dados do backup
-- que foram salvos nas consultas anteriores
-- =====================================================

-- =====================================================
-- CONSULTA 1: Verificar tabelas de campanhas existentes
-- =====================================================
SELECT 
    'TABELAS CAMPANHAS EXISTENTES' as categoria,
    table_name as tabela,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables pt WHERE pt.schemaname = 'public' AND pt.tablename = table_name AND pt.rowsecurity) THEN 'RLS ATIVO'
        ELSE 'RLS INATIVO'
    END as rls_status
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name LIKE '%campaign%'
ORDER BY table_name;

-- =====================================================
-- CONSULTA 2: Verificar políticas RLS das campanhas
-- =====================================================
SELECT 
    'POLÍTICAS RLS CAMPANHAS' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    permissive as permissiva
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename LIKE '%campaign%'
ORDER BY tablename, policyname;

-- =====================================================
-- CONSULTA 3: Contar registros nas tabelas de campanhas
-- =====================================================
DO $$
DECLARE
    tbl_name text;
    record_count integer;
BEGIN
    RAISE NOTICE '=== CONTAGEM ATUAL DE REGISTROS ===';
    
    FOR tbl_name IN SELECT unnest(ARRAY['campaigns', 'campaign_lists', 'campaign_unique_leads', 'campaign_leads', 'bulk_campaigns']) LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_schema = 'public' AND t.table_name = tbl_name) THEN
            BEGIN
                EXECUTE format('SELECT COUNT(*) FROM public.%I', tbl_name) INTO record_count;
                RAISE NOTICE 'Tabela %: % registros', tbl_name, record_count;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'Erro ao contar registros da tabela %: %', tbl_name, SQLERRM;
            END;
        ELSE
            RAISE NOTICE 'Tabela % não existe', tbl_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '=== CONTAGEM CONCLUÍDA ===';
END $$;

-- =====================================================
-- CONSULTA 4: Verificar estrutura das tabelas de campanhas
-- =====================================================
SELECT 
    'ESTRUTURA TABELAS CAMPANHAS' as categoria,
    table_name as tabela,
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name LIKE '%campaign%'
ORDER BY table_name, ordinal_position;

-- =====================================================
-- CONSULTA 5: Verificar índices das tabelas de campanhas
-- =====================================================
SELECT 
    'ÍNDICES TABELAS CAMPANHAS' as categoria,
    tablename as tabela,
    indexname as indice,
    indexdef as definicao
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename LIKE '%campaign%'
ORDER BY tablename, indexname;

-- =====================================================
-- CONSULTA 6: Verificar constraints das tabelas de campanhas
-- =====================================================
SELECT 
    'CONSTRAINTS TABELAS CAMPANHAS' as categoria,
    conname as constraint_name,
    contype as tipo,
    pg_get_constraintdef(oid) as definicao,
    conrelid::regclass as tabela
FROM pg_constraint 
WHERE connamespace = 'public'::regnamespace
AND conrelid::regclass::text LIKE '%campaign%'
ORDER BY conrelid::regclass, conname;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'CONSULTAS DE BACKUP CONCLUÍDAS' as status,
    'Use estas consultas para verificar o estado atual' as mensagem,
    'Compare com os resultados do backup anterior' as proximo_passo;


















