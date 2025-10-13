-- =====================================================
-- ROLLBACK COMPLETO DE CORREÇÕES SUPABASE
-- =====================================================
-- Este script reverte todas as correções aplicadas pelo script principal
-- Use apenas se houver problemas após aplicar as correções

-- =====================================================
-- ROLLBACK 1: RESTAURAR POLÍTICAS MÚLTIPLAS
-- =====================================================

-- blog_posts - Restaurar políticas originais
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blog_posts' AND table_schema = 'public') THEN
        -- Remover política consolidada
        DROP POLICY IF EXISTS "Consolidated blog posts policy" ON public.blog_posts;
        
        -- Recriar políticas originais
        CREATE POLICY "Admins podem gerenciar todos os posts" ON public.blog_posts
        FOR ALL USING (
            (select auth.uid()) IN (
                SELECT id FROM auth.users 
                WHERE raw_user_meta_data->>'role' = 'admin'
            )
        );
        
        CREATE POLICY "Users can view own blog posts" ON public.blog_posts
        FOR SELECT USING (author_id = (select auth.uid()));
        
        CREATE POLICY "Users can insert own blog posts" ON public.blog_posts
        FOR INSERT WITH CHECK (author_id = (select auth.uid()));
        
        CREATE POLICY "Users can update own blog posts" ON public.blog_posts
        FOR UPDATE USING (author_id = (select auth.uid()));
        
        CREATE POLICY "Users can delete own blog posts" ON public.blog_posts
        FOR DELETE USING (author_id = (select auth.uid()));
        
        RAISE NOTICE 'Políticas originais de blog_posts restauradas';
    END IF;
END $$;

-- campaign_leads - Restaurar políticas originais
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaign_leads' AND table_schema = 'public') THEN
        -- Remover política consolidada
        DROP POLICY IF EXISTS "Consolidated campaign leads policy" ON public.campaign_leads;
        
        -- Recriar políticas originais
        CREATE POLICY "Users can view leads from own campaigns" ON public.campaign_leads
        FOR SELECT USING (
            campaign_id IN (
                SELECT id FROM bulk_campaigns 
                WHERE user_id = (select auth.uid())
            )
        );
        
        CREATE POLICY "Users can insert leads in own campaigns" ON public.campaign_leads
        FOR INSERT WITH CHECK (
            campaign_id IN (
                SELECT id FROM bulk_campaigns 
                WHERE user_id = (select auth.uid())
            )
        );
        
        CREATE POLICY "Users can update leads in own campaigns" ON public.campaign_leads
        FOR UPDATE USING (
            campaign_id IN (
                SELECT id FROM bulk_campaigns 
                WHERE user_id = (select auth.uid())
            )
        );
        
        CREATE POLICY "Users can delete leads from own campaigns" ON public.campaign_leads
        FOR DELETE USING (
            campaign_id IN (
                SELECT id FROM bulk_campaigns 
                WHERE user_id = (select auth.uid())
            )
        );
        
        RAISE NOTICE 'Políticas originais de campaign_leads restauradas';
    END IF;
END $$;

-- bulk_campaigns - Restaurar políticas originais
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bulk_campaigns' AND table_schema = 'public') THEN
        -- Remover política consolidada
        DROP POLICY IF EXISTS "Consolidated bulk campaigns policy" ON public.bulk_campaigns;
        
        -- Recriar políticas originais
        CREATE POLICY "Users can view own campaigns" ON public.bulk_campaigns
        FOR SELECT USING (user_id = (select auth.uid()));
        
        CREATE POLICY "Users can insert own campaigns" ON public.bulk_campaigns
        FOR INSERT WITH CHECK (user_id = (select auth.uid()));
        
        CREATE POLICY "Users can update own campaigns" ON public.bulk_campaigns
        FOR UPDATE USING (user_id = (select auth.uid()));
        
        CREATE POLICY "Users can delete own campaigns" ON public.bulk_campaigns
        FOR DELETE USING (user_id = (select auth.uid()));
        
        RAISE NOTICE 'Políticas originais de bulk_campaigns restauradas';
    END IF;
END $$;

-- analytics_events - Restaurar políticas originais
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_events' AND table_schema = 'public') THEN
        -- Remover política consolidada
        DROP POLICY IF EXISTS "Consolidated analytics events policy" ON public.analytics_events;
        
        -- Recriar políticas originais
        CREATE POLICY "Users can view own analytics" ON public.analytics_events
        FOR SELECT USING (user_id = (select auth.uid()));
        
        CREATE POLICY "Users can insert own analytics" ON public.analytics_events
        FOR INSERT WITH CHECK (user_id = (select auth.uid()));
        
        RAISE NOTICE 'Políticas originais de analytics_events restauradas';
    END IF;
END $$;

-- system_logs - Restaurar políticas originais
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_logs' AND table_schema = 'public') THEN
        -- Remover política consolidada
        DROP POLICY IF EXISTS "Consolidated system logs policy" ON public.system_logs;
        
        -- Recriar políticas originais
        CREATE POLICY "Users can view own logs" ON public.system_logs
        FOR SELECT USING (user_id = (select auth.uid()));
        
        CREATE POLICY "Users can insert own logs" ON public.system_logs
        FOR INSERT WITH CHECK (user_id = (select auth.uid()));
        
        RAISE NOTICE 'Políticas originais de system_logs restauradas';
    END IF;
END $$;

-- whatsapp_responses - Restaurar políticas originais
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'whatsapp_responses' AND table_schema = 'public') THEN
        -- Remover política consolidada
        DROP POLICY IF EXISTS "Consolidated whatsapp responses policy" ON public.whatsapp_responses;
        
        -- Recriar políticas originais
        CREATE POLICY "Users can view own responses" ON public.whatsapp_responses
        FOR SELECT USING (user_id = (select auth.uid()));
        
        CREATE POLICY "Users can insert own responses" ON public.whatsapp_responses
        FOR INSERT WITH CHECK (user_id = (select auth.uid()));
        
        RAISE NOTICE 'Políticas originais de whatsapp_responses restauradas';
    END IF;
END $$;

-- sales_conversions - Restaurar políticas originais
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sales_conversions' AND table_schema = 'public') THEN
        -- Remover política consolidada
        DROP POLICY IF EXISTS "Consolidated sales conversions policy" ON public.sales_conversions;
        
        -- Recriar políticas originais
        CREATE POLICY "Users can view own conversions" ON public.sales_conversions
        FOR SELECT USING (user_id = (select auth.uid()));
        
        CREATE POLICY "Users can insert own conversions" ON public.sales_conversions
        FOR INSERT WITH CHECK (user_id = (select auth.uid()));
        
        RAISE NOTICE 'Políticas originais de sales_conversions restauradas';
    END IF;
END $$;

-- lead_quality_scores - Restaurar políticas originais
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lead_quality_scores' AND table_schema = 'public') THEN
        -- Remover política consolidada
        DROP POLICY IF EXISTS "Consolidated lead quality scores policy" ON public.lead_quality_scores;
        
        -- Recriar políticas originais
        CREATE POLICY "Users can view own quality scores" ON public.lead_quality_scores
        FOR SELECT USING (user_id = (select auth.uid()));
        
        CREATE POLICY "Users can insert own quality scores" ON public.lead_quality_scores
        FOR INSERT WITH CHECK (user_id = (select auth.uid()));
        
        RAISE NOTICE 'Políticas originais de lead_quality_scores restauradas';
    END IF;
END $$;

-- analytics_insights - Restaurar políticas originais
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_insights' AND table_schema = 'public') THEN
        -- Remover política consolidada
        DROP POLICY IF EXISTS "Consolidated analytics insights policy" ON public.analytics_insights;
        
        -- Recriar políticas originais
        CREATE POLICY "Users can view own insights" ON public.analytics_insights
        FOR SELECT USING (user_id = (select auth.uid()));
        
        CREATE POLICY "Users can update own insights" ON public.analytics_insights
        FOR UPDATE USING (user_id = (select auth.uid()));
        
        RAISE NOTICE 'Políticas originais de analytics_insights restauradas';
    END IF;
END $$;

-- campaign_performance_metrics - Restaurar políticas originais
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaign_performance_metrics' AND table_schema = 'public') THEN
        -- Remover política consolidada
        DROP POLICY IF EXISTS "Consolidated campaign performance metrics policy" ON public.campaign_performance_metrics;
        
        -- Recriar políticas originais
        CREATE POLICY "Users can view own metrics" ON public.campaign_performance_metrics
        FOR SELECT USING (user_id = (select auth.uid()));
        
        CREATE POLICY "Users can insert own metrics" ON public.campaign_performance_metrics
        FOR INSERT WITH CHECK (user_id = (select auth.uid()));
        
        RAISE NOTICE 'Políticas originais de campaign_performance_metrics restauradas';
    END IF;
END $$;

-- campaign_unique_leads - Restaurar políticas originais
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaign_unique_leads' AND table_schema = 'public') THEN
        -- Remover política consolidada
        DROP POLICY IF EXISTS "Consolidated campaign unique leads policy" ON public.campaign_unique_leads;
        
        -- Recriar políticas originais
        CREATE POLICY "Users can view their own campaign leads" ON public.campaign_unique_leads
        FOR SELECT USING (
            campaign_id IN (
                SELECT id FROM campaigns 
                WHERE user_id = (select auth.uid())
            )
        );
        
        CREATE POLICY "Users can insert their own campaign leads" ON public.campaign_unique_leads
        FOR INSERT WITH CHECK (
            campaign_id IN (
                SELECT id FROM campaigns 
                WHERE user_id = (select auth.uid())
            )
        );
        
        CREATE POLICY "Users can update their own campaign leads" ON public.campaign_unique_leads
        FOR UPDATE USING (
            campaign_id IN (
                SELECT id FROM campaigns 
                WHERE user_id = (select auth.uid())
            )
        );
        
        CREATE POLICY "Users can delete their own campaign leads" ON public.campaign_unique_leads
        FOR DELETE USING (
            campaign_id IN (
                SELECT id FROM campaigns 
                WHERE user_id = (select auth.uid())
            )
        );
        
        RAISE NOTICE 'Políticas originais de campaign_unique_leads restauradas';
    END IF;
END $$;

-- campaign_lists - Restaurar políticas originais
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaign_lists' AND table_schema = 'public') THEN
        -- Remover política consolidada
        DROP POLICY IF EXISTS "Consolidated campaign lists policy" ON public.campaign_lists;
        
        -- Recriar políticas originais
        CREATE POLICY "Users can view their own campaign lists" ON public.campaign_lists
        FOR SELECT USING (
            campaign_id IN (
                SELECT id FROM campaigns 
                WHERE user_id = (select auth.uid())
            )
        );
        
        CREATE POLICY "Users can insert their own campaign lists" ON public.campaign_lists
        FOR INSERT WITH CHECK (
            campaign_id IN (
                SELECT id FROM campaigns 
                WHERE user_id = (select auth.uid())
            )
        );
        
        CREATE POLICY "Users can update their own campaign lists" ON public.campaign_lists
        FOR UPDATE USING (
            campaign_id IN (
                SELECT id FROM campaigns 
                WHERE user_id = (select auth.uid())
            )
        );
        
        CREATE POLICY "Users can delete their own campaign lists" ON public.campaign_lists
        FOR DELETE USING (
            campaign_id IN (
                SELECT id FROM campaigns 
                WHERE user_id = (select auth.uid())
            )
        );
        
        RAISE NOTICE 'Políticas originais de campaign_lists restauradas';
    END IF;
END $$;

-- campaigns - Restaurar políticas originais
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaigns' AND table_schema = 'public') THEN
        -- Remover política consolidada
        DROP POLICY IF EXISTS "Consolidated campaigns policy" ON public.campaigns;
        
        -- Recriar políticas originais
        CREATE POLICY "Users can update their own campaigns" ON public.campaigns
        FOR UPDATE USING (user_id = (select auth.uid()));
        
        RAISE NOTICE 'Políticas originais de campaigns restauradas';
    END IF;
END $$;

-- =====================================================
-- ROLLBACK 2: RESTAURAR ÍNDICE DUPLICADO
-- =====================================================

-- Recriar índice duplicado
CREATE INDEX IF NOT EXISTS public.unique_active_subscription_per_user_idx 
ON public.user_subscriptions (user_id) 
WHERE status = 'active';

-- =====================================================
-- ROLLBACK 3: RESTAURAR VIEWS COM SECURITY DEFINER
-- =====================================================

-- Remover views recriadas
DROP VIEW IF EXISTS public.category_performance CASCADE;
DROP VIEW IF EXISTS public.campaign_leads_view CASCADE;
DROP VIEW IF EXISTS public.user_profiles_complete CASCADE;
DROP VIEW IF EXISTS public.campaign_metrics_summary CASCADE;

-- Recriar views com SECURITY DEFINER (se necessário)
-- Nota: Você precisará fornecer as definições originais das views

-- =====================================================
-- ROLLBACK 4: DESABILITAR RLS EM TABELAS PÚBLICAS
-- =====================================================

-- Desabilitar RLS nas tabelas que foram habilitadas
ALTER TABLE public.subscription_changes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.upgrade_pending DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_leads_backup DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_payment_subscriptions DISABLE ROW LEVEL SECURITY;

-- Remover políticas criadas
DROP POLICY IF EXISTS "Users can manage own subscription changes" ON public.subscription_changes;
DROP POLICY IF EXISTS "Users can manage own upgrade pending" ON public.upgrade_pending;
DROP POLICY IF EXISTS "Users can manage own campaign leads backup" ON public.campaign_leads_backup;
DROP POLICY IF EXISTS "Users can manage own payment subscriptions" ON public.user_payment_subscriptions;

-- =====================================================
-- VERIFICAÇÃO DO ROLLBACK
-- =====================================================

-- Verificar políticas restauradas
SELECT 
  'POLÍTICAS RESTAURADAS' as categoria,
  tablename as tabela,
  COUNT(*) as total_politicas,
  STRING_AGG(policyname, ', ') as politicas
FROM pg_policies 
WHERE schemaname = 'public' 
GROUP BY tablename
ORDER BY tablename;

-- Verificar índice restaurado
SELECT 
  'ÍNDICE RESTAURADO' as categoria,
  schemaname as schema,
  tablename as tabela,
  indexname as indice,
  'Índice duplicado restaurado' as status
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename = 'user_subscriptions'
  AND indexname = 'unique_active_subscription_per_user_idx';

-- Verificar RLS status
SELECT 
  'RLS STATUS APÓS ROLLBACK' as categoria,
  tablename as tabela,
  CASE 
    WHEN rowsecurity THEN 'RLS HABILITADO'
    ELSE 'RLS DESABILITADO'
  END as status_rls
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Resumo do rollback
SELECT 
  'ROLLBACK COMPLETO' as categoria,
  'Políticas múltiplas restauradas' as acao_1,
  'Índice duplicado restaurado' as acao_2,
  'Views removidas (precisam ser recriadas manualmente)' as acao_3,
  'RLS desabilitado em tabelas públicas' as acao_4,
  'Rollback aplicado com sucesso' as status;
