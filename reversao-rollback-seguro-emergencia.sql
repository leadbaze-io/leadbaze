-- =====================================================
-- REVERSÃO DO ROLLBACK SEGURO - EMERGÊNCIA TOTAL
-- =====================================================
-- Este script reverte o rollback seguro que quebrou tudo
-- e restaura o sistema funcional
-- =====================================================

-- =====================================================
-- REVERSÃO 1: Restaurar políticas essenciais para todas as tabelas
-- =====================================================

-- lead_lists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lead_lists') THEN
        ALTER TABLE public.lead_lists ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can manage own lead_lists" ON public.lead_lists;
        CREATE POLICY "Users can manage own lead_lists" ON public.lead_lists FOR ALL USING (user_id = auth.uid());
        RAISE NOTICE 'Política restaurada para lead_lists';
    END IF;
END $$;

-- whatsapp_templates
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'whatsapp_templates') THEN
        ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can manage own whatsapp_templates" ON public.whatsapp_templates;
        CREATE POLICY "Users can manage own whatsapp_templates" ON public.whatsapp_templates FOR ALL USING (user_id = auth.uid());
        RAISE NOTICE 'Política restaurada para whatsapp_templates';
    END IF;
END $$;

-- contact_attempts
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contact_attempts') THEN
        ALTER TABLE public.contact_attempts ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can manage own contact_attempts" ON public.contact_attempts;
        CREATE POLICY "Users can manage own contact_attempts" ON public.contact_attempts FOR ALL USING (user_id = auth.uid());
        RAISE NOTICE 'Política restaurada para contact_attempts';
    END IF;
END $$;

-- user_preferences
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences') THEN
        ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can manage own user_preferences" ON public.user_preferences;
        CREATE POLICY "Users can manage own user_preferences" ON public.user_preferences FOR ALL USING (user_id = auth.uid());
        RAISE NOTICE 'Política restaurada para user_preferences';
    END IF;
END $$;

-- whatsapp_instances
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'whatsapp_instances') THEN
        ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can manage own whatsapp_instances" ON public.whatsapp_instances;
        CREATE POLICY "Users can manage own whatsapp_instances" ON public.whatsapp_instances FOR ALL USING (user_id = auth.uid());
        RAISE NOTICE 'Política restaurada para whatsapp_instances';
    END IF;
END $$;

-- bulk_campaigns
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bulk_campaigns') THEN
        ALTER TABLE public.bulk_campaigns ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can view own campaigns" ON public.bulk_campaigns;
        DROP POLICY IF EXISTS "Users can insert own campaigns" ON public.bulk_campaigns;
        DROP POLICY IF EXISTS "Users can update own campaigns" ON public.bulk_campaigns;
        DROP POLICY IF EXISTS "Users can delete own campaigns" ON public.bulk_campaigns;
        CREATE POLICY "Users can view own campaigns" ON public.bulk_campaigns FOR SELECT USING (user_id = auth.uid());
        CREATE POLICY "Users can insert own campaigns" ON public.bulk_campaigns FOR INSERT WITH CHECK (user_id = auth.uid());
        CREATE POLICY "Users can update own campaigns" ON public.bulk_campaigns FOR UPDATE USING (user_id = auth.uid());
        CREATE POLICY "Users can delete own campaigns" ON public.bulk_campaigns FOR DELETE USING (user_id = auth.uid());
        RAISE NOTICE 'Políticas restauradas para bulk_campaigns';
    END IF;
END $$;

-- analytics_events
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'analytics_events') THEN
        ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can view own analytics" ON public.analytics_events;
        DROP POLICY IF EXISTS "Users can insert own analytics" ON public.analytics_events;
        CREATE POLICY "Users can view own analytics" ON public.analytics_events FOR SELECT USING (user_id = auth.uid());
        CREATE POLICY "Users can insert own analytics" ON public.analytics_events FOR INSERT WITH CHECK (user_id = auth.uid());
        RAISE NOTICE 'Políticas restauradas para analytics_events';
    END IF;
END $$;

-- system_logs
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'system_logs') THEN
        ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can view own logs" ON public.system_logs;
        DROP POLICY IF EXISTS "Users can insert own logs" ON public.system_logs;
        CREATE POLICY "Users can view own logs" ON public.system_logs FOR SELECT USING (user_id = auth.uid());
        CREATE POLICY "Users can insert own logs" ON public.system_logs FOR INSERT WITH CHECK (user_id = auth.uid());
        RAISE NOTICE 'Políticas restauradas para system_logs';
    END IF;
END $$;

-- user_tags
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_tags') THEN
        ALTER TABLE public.user_tags ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can manage own tags" ON public.user_tags;
        CREATE POLICY "Users can manage own tags" ON public.user_tags FOR ALL USING (user_id = auth.uid());
        RAISE NOTICE 'Política restaurada para user_tags';
    END IF;
END $$;

-- blog_posts
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'blog_posts') THEN
        ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Admins podem gerenciar todos os posts" ON public.blog_posts;
        CREATE POLICY "Admins podem gerenciar todos os posts" ON public.blog_posts FOR ALL USING (author_id = auth.uid());
        RAISE NOTICE 'Política restaurada para blog_posts';
    END IF;
END $$;

-- campaign_leads
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_leads') THEN
        ALTER TABLE public.campaign_leads ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can view leads from own campaigns" ON public.campaign_leads;
        DROP POLICY IF EXISTS "Users can insert leads in own campaigns" ON public.campaign_leads;
        DROP POLICY IF EXISTS "Users can update leads in own campaigns" ON public.campaign_leads;
        DROP POLICY IF EXISTS "Users can delete leads from own campaigns" ON public.campaign_leads;
        CREATE POLICY "Users can view leads from own campaigns" ON public.campaign_leads FOR SELECT USING (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = auth.uid()));
        CREATE POLICY "Users can insert leads in own campaigns" ON public.campaign_leads FOR INSERT WITH CHECK (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = auth.uid()));
        CREATE POLICY "Users can update leads in own campaigns" ON public.campaign_leads FOR UPDATE USING (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = auth.uid()));
        CREATE POLICY "Users can delete leads from own campaigns" ON public.campaign_leads FOR DELETE USING (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = auth.uid()));
        RAISE NOTICE 'Políticas restauradas para campaign_leads';
    END IF;
END $$;

-- whatsapp_responses
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'whatsapp_responses') THEN
        ALTER TABLE public.whatsapp_responses ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can view own responses" ON public.whatsapp_responses;
        DROP POLICY IF EXISTS "Users can insert own responses" ON public.whatsapp_responses;
        CREATE POLICY "Users can view own responses" ON public.whatsapp_responses FOR SELECT USING (user_id = auth.uid());
        CREATE POLICY "Users can insert own responses" ON public.whatsapp_responses FOR INSERT WITH CHECK (user_id = auth.uid());
        RAISE NOTICE 'Políticas restauradas para whatsapp_responses';
    END IF;
END $$;

-- sales_conversions
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sales_conversions') THEN
        ALTER TABLE public.sales_conversions ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can view own conversions" ON public.sales_conversions;
        DROP POLICY IF EXISTS "Users can insert own conversions" ON public.sales_conversions;
        CREATE POLICY "Users can view own conversions" ON public.sales_conversions FOR SELECT USING (user_id = auth.uid());
        CREATE POLICY "Users can insert own conversions" ON public.sales_conversions FOR INSERT WITH CHECK (user_id = auth.uid());
        RAISE NOTICE 'Políticas restauradas para sales_conversions';
    END IF;
END $$;

-- message_templates
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'message_templates') THEN
        ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can manage own templates" ON public.message_templates;
        CREATE POLICY "Users can manage own templates" ON public.message_templates FOR ALL USING (user_id = auth.uid());
        RAISE NOTICE 'Política restaurada para message_templates';
    END IF;
END $$;

-- lead_quality_scores
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lead_quality_scores') THEN
        ALTER TABLE public.lead_quality_scores ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can view own quality scores" ON public.lead_quality_scores;
        DROP POLICY IF EXISTS "Users can insert own quality scores" ON public.lead_quality_scores;
        CREATE POLICY "Users can view own quality scores" ON public.lead_quality_scores FOR SELECT USING (user_id = auth.uid());
        CREATE POLICY "Users can insert own quality scores" ON public.lead_quality_scores FOR INSERT WITH CHECK (user_id = auth.uid());
        RAISE NOTICE 'Políticas restauradas para lead_quality_scores';
    END IF;
END $$;

-- =====================================================
-- REVERSÃO 2: Restaurar índices essenciais
-- =====================================================

-- Índices para lead_lists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lead_lists') THEN
        CREATE INDEX IF NOT EXISTS idx_lead_lists_user_id ON public.lead_lists(user_id);
        CREATE INDEX IF NOT EXISTS idx_lead_lists_created_at ON public.lead_lists(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_lead_lists_status ON public.lead_lists(status);
        CREATE INDEX IF NOT EXISTS idx_lead_lists_name ON public.lead_lists(name);
        RAISE NOTICE 'Índices restaurados para lead_lists';
    END IF;
END $$;

-- Índices para bulk_campaigns
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bulk_campaigns') THEN
        CREATE INDEX IF NOT EXISTS idx_bulk_campaigns_user_id ON public.bulk_campaigns(user_id);
        CREATE INDEX IF NOT EXISTS idx_bulk_campaigns_created_at ON public.bulk_campaigns(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_bulk_campaigns_status ON public.bulk_campaigns(status);
        RAISE NOTICE 'Índices restaurados para bulk_campaigns';
    END IF;
END $$;

-- Índices para analytics_events
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'analytics_events') THEN
        CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
        CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
        RAISE NOTICE 'Índices restaurados para analytics_events';
    END IF;
END $$;

-- =====================================================
-- REVERSÃO 3: Restaurar views essenciais
-- =====================================================

-- View campaign_leads_view
DO $$
BEGIN
    DROP VIEW IF EXISTS public.campaign_leads_view;
    CREATE VIEW public.campaign_leads_view AS
    SELECT
        cl.id,
        cl.campaign_id,
        cl.lead_data,
        cl.added_at as created_at
    FROM campaign_leads cl
    WHERE EXISTS (
        SELECT 1 FROM bulk_campaigns bc
        WHERE bc.id = cl.campaign_id
        AND bc.user_id = auth.uid()
    );
    RAISE NOTICE 'View campaign_leads_view restaurada';
END $$;

-- View user_profiles_complete
DO $$
BEGIN
    DROP VIEW IF EXISTS public.user_profiles_complete;
    CREATE VIEW public.user_profiles_complete AS
    SELECT
        u.id,
        u.email,
        u.created_at,
        up.whatsapp_number,
        up.default_message_template,
        up.auto_follow_up,
        up.follow_up_delay_hours
    FROM auth.users u
    LEFT JOIN user_preferences up ON u.id = up.user_id
    WHERE u.id = auth.uid();
    RAISE NOTICE 'View user_profiles_complete restaurada';
END $$;

-- View campaign_metrics_summary
DO $$
BEGIN
    DROP VIEW IF EXISTS public.campaign_metrics_summary;
    CREATE VIEW public.campaign_metrics_summary AS
    SELECT
        bc.id as campaign_id,
        bc.name as campaign_name,
        bc.user_id,
        COUNT(cl.id) as total_leads,
        COUNT(CASE WHEN bc.status = 'completed' THEN 1 END) as completed_leads,
        bc.status
    FROM bulk_campaigns bc
    LEFT JOIN campaign_leads cl ON bc.id = cl.campaign_id
    WHERE bc.user_id = auth.uid()
    GROUP BY bc.id, bc.name, bc.user_id, bc.status;
    RAISE NOTICE 'View campaign_metrics_summary restaurada';
END $$;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
-- Mostrar quantas políticas foram restauradas
SELECT 
    'REVERSÃO DO ROLLBACK CONCLUÍDA' as status,
    'Políticas restauradas' as tipo,
    COUNT(*) as total
FROM pg_policies 
WHERE schemaname = 'public';

-- Mostrar quantas tabelas têm RLS habilitado
SELECT 
    'REVERSÃO DO ROLLBACK CONCLUÍDA' as status,
    'Tabelas com RLS' as tipo,
    COUNT(*) as total
FROM pg_tables 
WHERE schemaname = 'public'
AND rowsecurity = true;

-- Mostrar quantos índices foram restaurados
SELECT 
    'REVERSÃO DO ROLLBACK CONCLUÍDA' as status,
    'Índices restaurados' as tipo,
    COUNT(*) as total
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%';

-- Mostrar quantas views foram restauradas
SELECT 
    'REVERSÃO DO ROLLBACK CONCLUÍDA' as status,
    'Views restauradas' as tipo,
    COUNT(*) as total
FROM information_schema.views 
WHERE table_schema = 'public';

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'SISTEMA RESTAURADO' as status,
    'Rollback seguro foi revertido' as mensagem,
    'Teste o sistema agora' as proximo_passo;






















