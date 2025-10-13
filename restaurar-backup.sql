-- =====================================================
-- RESTAURAR BACKUP (SE NECESSÁRIO)
-- =====================================================
-- Este script permite restaurar o estado anterior
-- baseado no backup feito
-- =====================================================

-- =====================================================
-- RESTAURAÇÃO 1: Remover tabelas criadas pelas correções
-- =====================================================
DO $$
DECLARE
    tbl_name text;
BEGIN
    RAISE NOTICE '=== INICIANDO RESTAURAÇÃO ===';
    
    -- Lista de tabelas que podem ter sido criadas pelas correções
    FOR tbl_name IN SELECT unnest(ARRAY['campaigns', 'campaign_lists', 'campaign_unique_leads', 'campaign_leads']) LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_schema = 'public' AND t.table_name = tbl_name) THEN
            BEGIN
                -- Remover políticas RLS primeiro
                EXECUTE format('DROP POLICY IF EXISTS "Users can view own %s" ON public.%I', tbl_name, tbl_name);
                EXECUTE format('DROP POLICY IF EXISTS "Users can insert own %s" ON public.%I', tbl_name, tbl_name);
                EXECUTE format('DROP POLICY IF EXISTS "Users can update own %s" ON public.%I', tbl_name, tbl_name);
                EXECUTE format('DROP POLICY IF EXISTS "Users can delete own %s" ON public.%I', tbl_name, tbl_name);
                
                -- Remover índices
                EXECUTE format('DROP INDEX IF EXISTS idx_%s_user_id', tbl_name);
                EXECUTE format('DROP INDEX IF EXISTS idx_%s_campaign_id', tbl_name);
                EXECUTE format('DROP INDEX IF EXISTS idx_%s_status', tbl_name);
                
                -- Remover tabela
                EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', tbl_name);
                
                RAISE NOTICE 'Tabela % removida', tbl_name;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'Erro ao remover tabela %: %', tbl_name, SQLERRM;
            END;
        ELSE
            RAISE NOTICE 'Tabela % não existe', tbl_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '=== RESTAURAÇÃO CONCLUÍDA ===';
END $$;

-- =====================================================
-- RESTAURAÇÃO 2: Verificar estado após restauração
-- =====================================================
SELECT 
    'ESTADO APÓS RESTAURAÇÃO' as categoria,
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
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'RESTAURAÇÃO CONCLUÍDA' as status,
    'Estado anterior foi restaurado' as mensagem,
    'Execute novamente o backup se necessário' as proximo_passo;









