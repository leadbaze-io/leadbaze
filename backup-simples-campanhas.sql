-- =====================================================
-- BACKUP SIMPLES E DIRETO
-- =====================================================
-- Este script cria um backup simples e direto
-- focado nas tabelas de campanhas
-- =====================================================

-- =====================================================
-- BACKUP 1: Status atual das tabelas de campanhas
-- =====================================================
SELECT 
    'STATUS ATUAL' as categoria,
    t.table_name as tabela,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables pt WHERE pt.schemaname = 'public' AND pt.tablename = t.table_name AND pt.rowsecurity) THEN 'RLS ATIVO'
        ELSE 'RLS INATIVO'
    END as rls_status,
    (SELECT COUNT(*) FROM information_schema.table_privileges tp WHERE tp.table_schema = 'public' AND tp.table_name = t.table_name) as privilegios
FROM information_schema.tables t
WHERE t.table_schema = 'public'
AND t.table_name LIKE '%campaign%'
ORDER BY t.table_name;

-- =====================================================
-- BACKUP 2: Políticas RLS das tabelas de campanhas
-- =====================================================
SELECT 
    'POLÍTICAS RLS' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    permissive as permissiva,
    qual as condicao_usando,
    with_check as condicao_verificacao
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename LIKE '%campaign%'
ORDER BY tablename, policyname;

-- =====================================================
-- BACKUP 3: Dados das tabelas de campanhas
-- =====================================================
DO $$
DECLARE
    table_name text;
    record_count integer;
BEGIN
    RAISE NOTICE '=== BACKUP DADOS TABELAS DE CAMPANHAS ===';
    
    FOR table_name IN SELECT unnest(ARRAY['campaigns', 'campaign_lists', 'campaign_unique_leads', 'campaign_leads', 'bulk_campaigns']) LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_schema = 'public' AND t.table_name = table_name) THEN
            BEGIN
                EXECUTE format('SELECT COUNT(*) FROM public.%I', table_name) INTO record_count;
                RAISE NOTICE 'Tabela %: % registros', table_name, record_count;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'Erro ao contar registros da tabela %: %', table_name, SQLERRM;
            END;
        ELSE
            RAISE NOTICE 'Tabela % não existe', table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '=== BACKUP DADOS CONCLUÍDO ===';
END $$;

-- =====================================================
-- BACKUP 4: Índices das tabelas de campanhas
-- =====================================================
SELECT 
    'ÍNDICES' as categoria,
    tablename as tabela,
    indexname as indice,
    indexdef as definicao
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename LIKE '%campaign%'
ORDER BY tablename, indexname;

-- =====================================================
-- BACKUP 5: Constraints das tabelas de campanhas
-- =====================================================
SELECT 
    'CONSTRAINTS' as categoria,
    conname as constraint_name,
    contype as tipo,
    pg_get_constraintdef(oid) as definicao,
    conrelid::regclass as tabela
FROM pg_constraint 
WHERE connamespace = 'public'::regnamespace
AND conrelid::regclass::text LIKE '%campaign%'
ORDER BY conrelid::regclass, conname;

-- =====================================================
-- BACKUP 6: Estrutura das tabelas de campanhas
-- =====================================================
SELECT 
    'ESTRUTURA' as categoria,
    table_name as tabela,
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable,
    column_default as default_value
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name LIKE '%campaign%'
ORDER BY table_name, ordinal_position;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'BACKUP SIMPLES CONCLUÍDO' as status,
    'Backup das tabelas de campanhas salvo' as mensagem,
    'Agora você pode executar as correções com segurança' as proximo_passo;









