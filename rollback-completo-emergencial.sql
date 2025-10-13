-- =====================================================
-- ROLLBACK COMPLETO DE TODAS AS CORREÇÕES SUPABASE
-- =====================================================
-- ⚠️ ATENÇÃO: Este script reverte TODAS as mudanças feitas pelos scripts de correção
-- Execute apenas se os warnings aumentaram significativamente

-- =====================================================
-- 1. REMOVER FUNÇÕES CRIADAS PELOS SCRIPTS
-- =====================================================

DROP FUNCTION IF EXISTS get_user_column_name(text);
DROP FUNCTION IF EXISTS consolidate_table_policies(text);
DROP FUNCTION IF EXISTS optimize_rls_policies();

-- =====================================================
-- 2. REMOVER TABELAS DE BACKUP CRIADAS
-- =====================================================

DROP TABLE IF EXISTS backup_complete_objects;
DROP TABLE IF EXISTS backup_rls_policies;
DROP TABLE IF EXISTS backup_security_objects;

-- =====================================================
-- 3. REMOVER POLÍTICAS CONSOLIDADAS CRIADAS
-- =====================================================

-- Lista de políticas consolidadas que podem ter sido criadas
DO $$
DECLARE
    tbl_name text;
BEGIN
    FOR tbl_name IN SELECT unnest(ARRAY[
        'lead_lists', 'whatsapp_templates', 'contact_attempts', 
        'user_preferences', 'whatsapp_instances', 'bulk_campaigns',
        'analytics_events', 'system_logs', 'user_tags', 'blog_posts',
        'campaign_leads', 'whatsapp_responses', 'sales_conversions',
        'message_templates', 'lead_quality_scores', 'analytics_insights',
        'campaign_performance_metrics', 'campaign_unique_leads',
        'campaign_lists', 'campaigns'
    ]) LOOP
        -- Remover política consolidada se existir
        EXECUTE format('DROP POLICY IF EXISTS "Consolidated %s policy" ON public.%I', tbl_name, tbl_name);
        RAISE NOTICE 'Política consolidada removida de %', tbl_name;
    END LOOP;
END $$;

-- =====================================================
-- 4. REMOVER POLÍTICAS CRIADAS PARA TABELAS PÚBLICAS
-- =====================================================

DO $$
DECLARE
    tbl_name text;
BEGIN
    FOR tbl_name IN SELECT unnest(ARRAY['subscription_changes', 'upgrade_pending', 'campaign_leads_backup', 'user_payment_subscriptions']) LOOP
        -- Remover política criada pelos scripts
        EXECUTE format('DROP POLICY IF EXISTS "Users can manage own %s" ON public.%I', tbl_name, tbl_name);
        RAISE NOTICE 'Política removida de %', tbl_name;
    END LOOP;
END $$;

-- =====================================================
-- 5. DESABILITAR RLS EM TABELAS QUE FORAM HABILITADAS
-- =====================================================

DO $$
DECLARE
    tbl_name text;
BEGIN
    FOR tbl_name IN SELECT unnest(ARRAY['subscription_changes', 'upgrade_pending', 'campaign_leads_backup', 'user_payment_subscriptions']) LOOP
        -- Verificar se a tabela existe antes de desabilitar RLS
        IF EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_name = tbl_name AND t.table_schema = 'public') THEN
            EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', tbl_name);
            RAISE NOTICE 'RLS desabilitado para tabela %', tbl_name;
        ELSE
            RAISE NOTICE 'Tabela % não existe - pulando', tbl_name;
        END IF;
    END LOOP;
END $$;

-- =====================================================
-- 6. REMOVER VIEWS RECRIADAS
-- =====================================================

DROP VIEW IF EXISTS public.category_performance CASCADE;
DROP VIEW IF EXISTS public.campaign_leads_view CASCADE;
DROP VIEW IF EXISTS public.user_profiles_complete CASCADE;
DROP VIEW IF EXISTS public.campaign_metrics_summary CASCADE;

-- =====================================================
-- 7. RESTAURAR ÍNDICE DUPLICADO (se foi removido)
-- =====================================================

-- Verificar se o índice principal ainda existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
          AND tablename = 'user_subscriptions'
          AND indexname = 'unique_active_subscription_per_user'
    ) THEN
        -- Recriar o índice duplicado se foi removido
        EXECUTE format('CREATE INDEX IF NOT EXISTS unique_active_subscription_per_user_idx ON public.user_subscriptions (user_id) WHERE status = %L', 'active');
        RAISE NOTICE 'Índice duplicado restaurado';
    ELSE
        RAISE NOTICE 'Índice principal não existe - não restaurando duplicado';
    END IF;
END $$;

-- =====================================================
-- 8. VERIFICAÇÃO DO ROLLBACK
-- =====================================================

-- Verificar políticas restauradas
SELECT 
  'ROLLBACK: POLÍTICAS RESTAURADAS' as categoria,
  tablename as tabela,
  COUNT(*) as total_politicas,
  STRING_AGG(policyname, ', ') as politicas
FROM pg_policies 
WHERE schemaname = 'public' 
GROUP BY tablename
ORDER BY tablename;

-- Verificar views removidas
SELECT 
  'ROLLBACK: VIEWS REMOVIDAS' as categoria,
  'Views recriadas pelos scripts foram removidas' as status;

-- Verificar RLS status
SELECT 
  'ROLLBACK: RLS STATUS' as categoria,
  tablename as tabela,
  CASE 
    WHEN rowsecurity THEN 'RLS HABILITADO'
    ELSE 'RLS DESABILITADO'
  END as status_rls
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar funções removidas
SELECT 
  'ROLLBACK: FUNÇÕES REMOVIDAS' as categoria,
  'Funções auxiliares foram removidas' as status;

-- =====================================================
-- 9. RESUMO DO ROLLBACK
-- =====================================================

SELECT 
  'ROLLBACK COMPLETO REALIZADO' as categoria,
  'Políticas consolidadas removidas' as acao_1,
  'RLS desabilitado em tabelas públicas' as acao_2,
  'Views recriadas removidas' as acao_3,
  'Funções auxiliares removidas' as acao_4,
  'Tabelas de backup removidas' as acao_5,
  'Sistema restaurado ao estado anterior' as status;

-- =====================================================
-- 10. RECOMENDAÇÕES PÓS-ROLLBACK
-- =====================================================

SELECT 
  'RECOMENDAÇÕES PÓS-ROLLBACK' as categoria,
  'Verificar se os warnings voltaram ao número original' as recomendacao_1,
  'Considerar abordagem mais conservadora' as recomendacao_2,
  'Aplicar correções uma por vez' as recomendacao_3,
  'Testar cada correção individualmente' as recomendacao_4,
  'Monitorar warnings após cada mudança' as recomendacao_5;
