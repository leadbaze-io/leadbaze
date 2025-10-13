-- =====================================================
-- ROLLBACK COMPLETO PARA ESTADO INICIAL (80 WARNINGS)
-- =====================================================
-- Este script reverte TODAS as mudanças e volta ao estado inicial
-- quando tínhamos apenas 80 warnings
-- 
-- ⚠️  ATENÇÃO: Este script remove TODAS as políticas criadas
-- e restaura o estado original do banco
-- =====================================================

-- =====================================================
-- BACKUP FINAL ANTES DO ROLLBACK COMPLETO
-- =====================================================
CREATE TABLE IF NOT EXISTS backup_final_antes_rollback AS
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
-- ROLLBACK 1: Remover TODAS as políticas criadas pelos scripts
-- =====================================================
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Remover todas as políticas que foram criadas pelos nossos scripts
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
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 
                      policy_record.policyname, policy_record.tablename);
        RAISE NOTICE 'Política removida: %.%', policy_record.tablename, policy_record.policyname;
    END LOOP;
END $$;

-- =====================================================
-- ROLLBACK 2: Remover views criadas pelos scripts
-- =====================================================
DO $$
BEGIN
    -- Remover views que foram criadas pelos nossos scripts
    DROP VIEW IF EXISTS public.campaign_leads_view;
    DROP VIEW IF EXISTS public.user_profiles_complete;
    DROP VIEW IF EXISTS public.campaign_metrics_summary;
    
    RAISE NOTICE 'Views removidas';
END $$;

-- =====================================================
-- ROLLBACK 3: Remover funções criadas pelos scripts
-- =====================================================
DO $$
BEGIN
    -- Remover funções que foram criadas pelos nossos scripts
    DROP FUNCTION IF EXISTS get_user_column_name(text);
    DROP FUNCTION IF EXISTS consolidate_table_policies(text);
    DROP FUNCTION IF EXISTS table_exists(text);
    DROP FUNCTION IF EXISTS has_user_id_column(text);
    DROP FUNCTION IF EXISTS has_author_id_column(text);
    DROP FUNCTION IF EXISTS has_campaign_id_column(text);
    
    RAISE NOTICE 'Funções removidas';
END $$;

-- =====================================================
-- ROLLBACK 4: Remover índices duplicados criados pelos scripts
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
    LOOP
        EXECUTE format('DROP INDEX IF EXISTS public.%I', index_record.indexname);
        RAISE NOTICE 'Índice removido: %', index_record.indexname;
    END LOOP;
END $$;

-- =====================================================
-- ROLLBACK 5: Restaurar RLS para estado original
-- =====================================================
DO $$
DECLARE
    tbl_name text;
BEGIN
    -- Lista de tabelas que podem ter tido RLS alterado
    FOR tbl_name IN SELECT unnest(ARRAY[
        'subscription_changes', 'upgrade_pending', 'campaign_leads_backup', 
        'user_payment_subscriptions', 'lead_lists', 'whatsapp_templates', 
        'contact_attempts', 'user_preferences', 'whatsapp_instances',
        'bulk_campaigns', 'analytics_events', 'system_logs', 'user_tags',
        'blog_posts', 'campaign_leads', 'whatsapp_responses', 'sales_conversions',
        'message_templates', 'lead_quality_scores'
    ]) LOOP
        
        -- Verificar se a tabela existe
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl_name) THEN
            
            -- Manter RLS habilitado (estado original)
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl_name);
            RAISE NOTICE 'RLS mantido habilitado para: %', tbl_name;
            
        ELSE
            RAISE NOTICE 'Tabela % não existe - pulando', tbl_name;
        END IF;
        
    END LOOP;
END $$;

-- =====================================================
-- ROLLBACK 6: Limpar tabelas de backup
-- =====================================================
DO $$
BEGIN
    -- Remover tabelas de backup criadas pelos scripts
    DROP TABLE IF EXISTS backup_policies_rls_performance;
    DROP TABLE IF EXISTS backup_final_antes_rollback;
    
    RAISE NOTICE 'Tabelas de backup removidas';
END $$;

-- =====================================================
-- VERIFICAÇÃO FINAL DO ROLLBACK
-- =====================================================
-- Mostrar quantas políticas restaram
SELECT 
    'ROLLBACK COMPLETO' as status,
    'Políticas restantes' as tipo,
    COUNT(*) as total
FROM pg_policies 
WHERE schemaname = 'public';

-- Mostrar quantas views restaram
SELECT 
    'ROLLBACK COMPLETO' as status,
    'Views restantes' as tipo,
    COUNT(*) as total
FROM information_schema.views 
WHERE table_schema = 'public';

-- Mostrar quantas funções restaram
SELECT 
    'ROLLBACK COMPLETO' as status,
    'Funções restantes' as tipo,
    COUNT(*) as total
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name NOT LIKE 'pg_%';

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'ROLLBACK CONCLUÍDO' as status,
    'Banco restaurado para estado inicial' as mensagem,
    'Execute diagnóstico para verificar warnings' as proximo_passo;
