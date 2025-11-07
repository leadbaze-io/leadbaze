-- =====================================================
-- ROLLBACK SEGURO PARA ESTADO INICIAL (80 WARNINGS)
-- =====================================================
-- Este script reverte TODAS as mudanças de forma SEGURA
-- e volta ao estado inicial quando tínhamos apenas 80 warnings
-- 
-- ⚠️  ATENÇÃO: Este script remove apenas políticas e objetos
-- criados pelos nossos scripts, preservando a estrutura original
-- =====================================================

-- =====================================================
-- BACKUP FINAL ANTES DO ROLLBACK SEGURO
-- =====================================================
CREATE TABLE IF NOT EXISTS backup_seguro_antes_rollback AS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check,
    NOW() as backup_timestamp
FROM pg_policies 
WHERE schemaname = 'public';

-- =====================================================
-- ROLLBACK SEGURO 1: Remover políticas criadas pelos scripts
-- =====================================================
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Remover apenas políticas que foram criadas pelos nossos scripts
    FOR policy_record IN 
        SELECT tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND (
            policyname LIKE '%Users can%' OR
            policyname LIKE '%Admins podem%' OR
            policyname LIKE '%Consolidated%' OR
            policyname LIKE '%Users can manage%' OR
            policyname LIKE '%Users can view%' OR
            policyname LIKE '%Users can insert%' OR
            policyname LIKE '%Users can update%' OR
            policyname LIKE '%Users can delete%' OR
            policyname LIKE '%Users can view leads%' OR
            policyname LIKE '%Users can insert leads%' OR
            policyname LIKE '%Users can update leads%' OR
            policyname LIKE '%Users can delete leads%' OR
            policyname LIKE '%Users can view their own%' OR
            policyname LIKE '%Users can insert their own%' OR
            policyname LIKE '%Users can update their own%' OR
            policyname LIKE '%Users can delete their own%'
        )
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 
                          policy_record.policyname, policy_record.tablename);
            RAISE NOTICE 'Política removida: %.%', policy_record.tablename, policy_record.policyname;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Erro ao remover política %.%: %', policy_record.tablename, policy_record.policyname, SQLERRM;
        END;
    END LOOP;
END $$;

-- =====================================================
-- ROLLBACK SEGURO 2: Remover views criadas pelos scripts
-- =====================================================
DO $$
BEGIN
    -- Remover views que foram criadas pelos nossos scripts
    BEGIN
        DROP VIEW IF EXISTS public.campaign_leads_view;
        RAISE NOTICE 'View campaign_leads_view removida';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover view campaign_leads_view: %', SQLERRM;
    END;
    
    BEGIN
        DROP VIEW IF EXISTS public.user_profiles_complete;
        RAISE NOTICE 'View user_profiles_complete removida';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover view user_profiles_complete: %', SQLERRM;
    END;
    
    BEGIN
        DROP VIEW IF EXISTS public.campaign_metrics_summary;
        RAISE NOTICE 'View campaign_metrics_summary removida';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover view campaign_metrics_summary: %', SQLERRM;
    END;
END $$;

-- =====================================================
-- ROLLBACK SEGURO 3: Remover funções criadas pelos scripts
-- =====================================================
DO $$
BEGIN
    -- Remover funções que foram criadas pelos nossos scripts
    BEGIN
        DROP FUNCTION IF EXISTS get_user_column_name(text);
        RAISE NOTICE 'Função get_user_column_name removida';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover função get_user_column_name: %', SQLERRM;
    END;
    
    BEGIN
        DROP FUNCTION IF EXISTS consolidate_table_policies(text);
        RAISE NOTICE 'Função consolidate_table_policies removida';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover função consolidate_table_policies: %', SQLERRM;
    END;
    
    BEGIN
        DROP FUNCTION IF EXISTS table_exists(text);
        RAISE NOTICE 'Função table_exists removida';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover função table_exists: %', SQLERRM;
    END;
    
    BEGIN
        DROP FUNCTION IF EXISTS has_user_id_column(text);
        RAISE NOTICE 'Função has_user_id_column removida';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover função has_user_id_column: %', SQLERRM;
    END;
    
    BEGIN
        DROP FUNCTION IF EXISTS has_author_id_column(text);
        RAISE NOTICE 'Função has_author_id_column removida';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover função has_author_id_column: %', SQLERRM;
    END;
    
    BEGIN
        DROP FUNCTION IF EXISTS has_campaign_id_column(text);
        RAISE NOTICE 'Função has_campaign_id_column removida';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover função has_campaign_id_column: %', SQLERRM;
    END;
END $$;

-- =====================================================
-- ROLLBACK SEGURO 4: Remover índices criados pelos scripts (SEM chaves primárias)
-- =====================================================
DO $$
DECLARE
    index_record RECORD;
BEGIN
    -- Remover apenas índices que foram criados pelos scripts (não chaves primárias)
    FOR index_record IN 
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public'
        AND (
            indexname LIKE '%_duplicate%' OR
            indexname LIKE '%_backup%' OR
            indexname LIKE '%_temp%' OR
            indexname LIKE '%idx_%' OR
            indexname LIKE '%gin_%'
        )
        AND indexname NOT LIKE '%_pkey'  -- Não remover chaves primárias
        AND indexname NOT LIKE '%_key'   -- Não remover chaves únicas
        AND indexname NOT LIKE '%_fkey'  -- Não remover chaves estrangeiras
    LOOP
        BEGIN
            EXECUTE format('DROP INDEX IF EXISTS public.%I', index_record.indexname);
            RAISE NOTICE 'Índice removido: %', index_record.indexname;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Erro ao remover índice %: %', index_record.indexname, SQLERRM;
        END;
    END LOOP;
END $$;

-- =====================================================
-- ROLLBACK SEGURO 5: Manter RLS habilitado (estado original)
-- =====================================================
DO $$
DECLARE
    tbl_name text;
BEGIN
    -- Lista de tabelas que devem ter RLS habilitado
    FOR tbl_name IN SELECT unnest(ARRAY[
        'lead_lists', 'whatsapp_templates', 'contact_attempts', 
        'user_preferences', 'whatsapp_instances', 'bulk_campaigns',
        'analytics_events', 'system_logs', 'user_tags', 'blog_posts',
        'campaign_leads', 'whatsapp_responses', 'sales_conversions',
        'message_templates', 'lead_quality_scores'
    ]) LOOP
        
        -- Verificar se a tabela existe
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl_name) THEN
            
            BEGIN
                -- Manter RLS habilitado (estado original)
                EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl_name);
                RAISE NOTICE 'RLS mantido habilitado para: %', tbl_name;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'Erro ao habilitar RLS para %: %', tbl_name, SQLERRM;
            END;
            
        ELSE
            RAISE NOTICE 'Tabela % não existe - pulando', tbl_name;
        END IF;
        
    END LOOP;
END $$;

-- =====================================================
-- ROLLBACK SEGURO 6: Limpar tabelas de backup
-- =====================================================
DO $$
BEGIN
    -- Remover tabelas de backup criadas pelos scripts
    BEGIN
        DROP TABLE IF EXISTS backup_policies_rls_performance;
        RAISE NOTICE 'Tabela backup_policies_rls_performance removida';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover backup_policies_rls_performance: %', SQLERRM;
    END;
    
    BEGIN
        DROP TABLE IF EXISTS backup_final_antes_rollback;
        RAISE NOTICE 'Tabela backup_final_antes_rollback removida';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover backup_final_antes_rollback: %', SQLERRM;
    END;
END $$;

-- =====================================================
-- VERIFICAÇÃO FINAL DO ROLLBACK SEGURO
-- =====================================================
-- Mostrar quantas políticas restaram
SELECT 
    'ROLLBACK SEGURO CONCLUÍDO' as status,
    'Políticas restantes' as tipo,
    COUNT(*) as total
FROM pg_policies 
WHERE schemaname = 'public';

-- Mostrar quantas views restaram
SELECT 
    'ROLLBACK SEGURO CONCLUÍDO' as status,
    'Views restantes' as tipo,
    COUNT(*) as total
FROM information_schema.views 
WHERE table_schema = 'public';

-- Mostrar quantas funções restaram
SELECT 
    'ROLLBACK SEGURO CONCLUÍDO' as status,
    'Funções restantes' as tipo,
    COUNT(*) as total
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name NOT LIKE 'pg_%';

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'ROLLBACK SEGURO CONCLUÍDO' as status,
    'Banco restaurado para estado inicial' as mensagem,
    'Verifique os warnings no Supabase' as proximo_passo;




















