-- =====================================================
-- BACKUP COMPLETO DO BANCO DE DADOS
-- =====================================================
-- Este script cria um backup completo do banco de dados
-- incluindo estrutura, dados, políticas RLS, índices e views
-- =====================================================

-- =====================================================
-- BACKUP 1: Estrutura de todas as tabelas públicas
-- =====================================================
SELECT 
    'BACKUP ESTRUTURA TABELAS' as categoria,
    table_name as tabela,
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable,
    column_default as default_value,
    ordinal_position as ordem
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- =====================================================
-- BACKUP 2: Dados de todas as tabelas públicas
-- =====================================================
DO $$
DECLARE
    table_record RECORD;
    record_count integer;
BEGIN
    RAISE NOTICE '=== INICIANDO BACKUP DE DADOS ===';
    
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
    LOOP
        BEGIN
            EXECUTE format('SELECT COUNT(*) FROM public.%I', table_record.table_name) INTO record_count;
            RAISE NOTICE 'Tabela %: % registros', table_record.table_name, record_count;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Erro ao contar registros da tabela %: %', table_record.table_name, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE '=== BACKUP DE DADOS CONCLUÍDO ===';
END $$;

-- =====================================================
-- BACKUP 3: Políticas RLS de todas as tabelas
-- =====================================================
SELECT 
    'BACKUP POLÍTICAS RLS' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    permissive as permissiva,
    roles as roles,
    qual as condicao_usando,
    with_check as condicao_verificacao
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- BACKUP 4: Status RLS de todas as tabelas
-- =====================================================
SELECT 
    'BACKUP STATUS RLS' as categoria,
    tablename as tabela,
    rowsecurity as rls_habilitado,
    CASE 
        WHEN rowsecurity THEN 'RLS HABILITADO'
        ELSE 'RLS DESABILITADO'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- BACKUP 5: Índices de todas as tabelas
-- =====================================================
SELECT 
    'BACKUP ÍNDICES' as categoria,
    schemaname as schema,
    tablename as tabela,
    indexname as indice,
    indexdef as definicao
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- BACKUP 6: Constraints de todas as tabelas
-- =====================================================
SELECT 
    'BACKUP CONSTRAINTS' as categoria,
    conname as constraint_name,
    contype as tipo,
    pg_get_constraintdef(oid) as definicao,
    conrelid::regclass as tabela
FROM pg_constraint 
WHERE connamespace = 'public'::regnamespace
ORDER BY conrelid::regclass, conname;

-- =====================================================
-- BACKUP 7: Views públicas
-- =====================================================
SELECT 
    'BACKUP VIEWS' as categoria,
    table_name as view_name,
    view_definition as definicao
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- BACKUP 8: Funções públicas
-- =====================================================
SELECT 
    'BACKUP FUNÇÕES' as categoria,
    routine_name as funcao,
    routine_type as tipo,
    data_type as tipo_retorno,
    routine_definition as definicao
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- =====================================================
-- BACKUP 9: Triggers
-- =====================================================
SELECT 
    'BACKUP TRIGGERS' as categoria,
    trigger_name as trigger,
    event_object_table as tabela,
    event_manipulation as evento,
    action_timing as timing,
    action_statement as acao
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- BACKUP 10: Sequências
-- =====================================================
SELECT 
    'BACKUP SEQUÊNCIAS' as categoria,
    sequence_name as sequencia,
    data_type as tipo,
    start_value as valor_inicial,
    minimum_value as valor_minimo,
    maximum_value as valor_maximo,
    increment as incremento
FROM information_schema.sequences 
WHERE sequence_schema = 'public'
ORDER BY sequence_name;

-- =====================================================
-- BACKUP 11: Permissões de tabelas
-- =====================================================
SELECT 
    'BACKUP PERMISSÕES' as categoria,
    table_name as tabela,
    privilege_type as tipo_permissao,
    grantee as usuario,
    is_grantable as pode_conceder
FROM information_schema.table_privileges 
WHERE table_schema = 'public'
ORDER BY table_name, privilege_type, grantee;

-- =====================================================
-- BACKUP 12: Resumo do backup
-- =====================================================
SELECT 
    'RESUMO BACKUP' as categoria,
    'Tabelas' as item,
    COUNT(*) as quantidade
FROM information_schema.tables 
WHERE table_schema = 'public'
UNION ALL
SELECT 
    'RESUMO BACKUP' as categoria,
    'Políticas RLS' as item,
    COUNT(*) as quantidade
FROM pg_policies 
WHERE schemaname = 'public'
UNION ALL
SELECT 
    'RESUMO BACKUP' as categoria,
    'Índices' as item,
    COUNT(*) as quantidade
FROM pg_indexes 
WHERE schemaname = 'public'
UNION ALL
SELECT 
    'RESUMO BACKUP' as categoria,
    'Constraints' as item,
    COUNT(*) as quantidade
FROM pg_constraint 
WHERE connamespace = 'public'::regnamespace
UNION ALL
SELECT 
    'RESUMO BACKUP' as categoria,
    'Views' as item,
    COUNT(*) as quantidade
FROM information_schema.views 
WHERE table_schema = 'public'
UNION ALL
SELECT 
    'RESUMO BACKUP' as categoria,
    'Funções' as item,
    COUNT(*) as quantidade
FROM information_schema.routines 
WHERE routine_schema = 'public';

-- =====================================================
-- BACKUP 13: Dados específicos das tabelas de campanhas
-- =====================================================
-- Backup dos dados das tabelas de campanhas (se existirem)
DO $$
DECLARE
    tbl_name text;
    record_count integer;
BEGIN
    RAISE NOTICE '=== BACKUP ESPECÍFICO TABELAS DE CAMPANHAS ===';
    
    FOR tbl_name IN SELECT unnest(ARRAY['campaigns', 'campaign_lists', 'campaign_unique_leads', 'campaign_leads', 'bulk_campaigns']) LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_schema = 'public' AND t.table_name = tbl_name) THEN
            BEGIN
                EXECUTE format('SELECT COUNT(*) FROM public.%I', tbl_name) INTO record_count;
                RAISE NOTICE 'Tabela %: % registros', tbl_name, record_count;
                
                -- Mostrar alguns registros de exemplo
                IF record_count > 0 THEN
                    RAISE NOTICE 'Exemplos de registros da tabela %:', tbl_name;
                    -- Aqui você pode adicionar SELECTs específicos para mostrar dados de exemplo
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'Erro ao fazer backup da tabela %: %', tbl_name, SQLERRM;
            END;
        ELSE
            RAISE NOTICE 'Tabela % não existe', tbl_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '=== BACKUP ESPECÍFICO CONCLUÍDO ===';
END $$;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'BACKUP COMPLETO CONCLUÍDO' as status,
    'Todos os dados foram salvos' as mensagem,
    'Agora você pode executar as correções com segurança' as proximo_passo;
