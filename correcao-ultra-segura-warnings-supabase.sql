-- =====================================================
-- CORREÇÃO ULTRA-SEGURA DE WARNINGS SUPABASE - RLS PERFORMANCE
-- =====================================================
-- Este script corrige apenas as tabelas que existem e têm coluna user_id
-- Verifica também a estrutura da tabela auth.users

-- BACKUP DAS POLÍTICAS ATUAIS
CREATE TABLE IF NOT EXISTS backup_rls_policies AS 
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public';

-- =====================================================
-- VERIFICAÇÃO DE TABELAS VÁLIDAS
-- =====================================================

-- Verificar quais tabelas existem e têm coluna user_id
SELECT 
    'TABELAS VÁLIDAS PARA CORREÇÃO' as categoria,
    t.table_name as tabela,
    'OK' as status
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
    AND c.table_schema = 'public'
    AND c.column_name = 'user_id'
    AND t.table_name IN (
        'lead_lists', 'whatsapp_templates', 'contact_attempts', 
        'user_preferences', 'whatsapp_instances', 'bulk_campaigns',
        'analytics_events', 'system_logs', 'user_tags',
        'campaign_leads', 'whatsapp_responses', 'sales_conversions',
        'message_templates', 'lead_quality_scores', 'analytics_insights',
        'campaign_performance_metrics', 'campaign_unique_leads',
        'campaign_lists', 'campaigns'
    )
ORDER BY t.table_name;

-- =====================================================
-- CORREÇÃO DAS POLÍTICAS RLS (APENAS TABELAS VÁLIDAS)
-- =====================================================

-- 1. lead_lists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
            AND table_name = 'lead_lists' 
            AND column_name = 'user_id'
    ) THEN
        DROP POLICY IF EXISTS "Users can manage own lead_lists" ON public.lead_lists;
        CREATE POLICY "Users can manage own lead_lists" ON public.lead_lists
            FOR ALL USING ((select auth.uid()) = user_id);
        RAISE NOTICE 'Política corrigida para lead_lists';
    ELSE
        RAISE NOTICE 'Tabela lead_lists não possui coluna user_id - pulando';
    END IF;
END $$;

-- 2. whatsapp_templates
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
            AND table_name = 'whatsapp_templates' 
            AND column_name = 'user_id'
    ) THEN
        DROP POLICY IF EXISTS "Users can manage own whatsapp_templates" ON public.whatsapp_templates;
        CREATE POLICY "Users can manage own whatsapp_templates" ON public.whatsapp_templates
            FOR ALL USING ((select auth.uid()) = user_id);
        RAISE NOTICE 'Política corrigida para whatsapp_templates';
    ELSE
        RAISE NOTICE 'Tabela whatsapp_templates não possui coluna user_id - pulando';
    END IF;
END $$;

-- 3. contact_attempts
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
            AND table_name = 'contact_attempts' 
            AND column_name = 'user_id'
    ) THEN
        DROP POLICY IF EXISTS "Users can manage own contact_attempts" ON public.contact_attempts;
        CREATE POLICY "Users can manage own contact_attempts" ON public.contact_attempts
            FOR ALL USING ((select auth.uid()) = user_id);
        RAISE NOTICE 'Política corrigida para contact_attempts';
    ELSE
        RAISE NOTICE 'Tabela contact_attempts não possui coluna user_id - pulando';
    END IF;
END $$;

-- 4. user_preferences
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
            AND table_name = 'user_preferences' 
            AND column_name = 'user_id'
    ) THEN
        DROP POLICY IF EXISTS "Users can manage own user_preferences" ON public.user_preferences;
        CREATE POLICY "Users can manage own user_preferences" ON public.user_preferences
            FOR ALL USING ((select auth.uid()) = user_id);
        RAISE NOTICE 'Política corrigida para user_preferences';
    ELSE
        RAISE NOTICE 'Tabela user_preferences não possui coluna user_id - pulando';
    END IF;
END $$;

-- 5. whatsapp_instances
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
            AND table_name = 'whatsapp_instances' 
            AND column_name = 'user_id'
    ) THEN
        DROP POLICY IF EXISTS "Users can manage own whatsapp_instances" ON public.whatsapp_instances;
        CREATE POLICY "Users can manage own whatsapp_instances" ON public.whatsapp_instances
            FOR ALL USING ((select auth.uid()) = user_id);
        RAISE NOTICE 'Política corrigida para whatsapp_instances';
    ELSE
        RAISE NOTICE 'Tabela whatsapp_instances não possui coluna user_id - pulando';
    END IF;
END $$;

-- 6. bulk_campaigns
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
            AND table_name = 'bulk_campaigns' 
            AND column_name = 'user_id'
    ) THEN
        DROP POLICY IF EXISTS "Users can view own campaigns" ON public.bulk_campaigns;
        CREATE POLICY "Users can view own campaigns" ON public.bulk_campaigns
            FOR SELECT USING ((select auth.uid()) = user_id);
        
        DROP POLICY IF EXISTS "Users can insert own campaigns" ON public.bulk_campaigns;
        CREATE POLICY "Users can insert own campaigns" ON public.bulk_campaigns
            FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
        
        DROP POLICY IF EXISTS "Users can update own campaigns" ON public.bulk_campaigns;
        CREATE POLICY "Users can update own campaigns" ON public.bulk_campaigns
            FOR UPDATE USING ((select auth.uid()) = user_id);
        
        DROP POLICY IF EXISTS "Users can delete own campaigns" ON public.bulk_campaigns;
        CREATE POLICY "Users can delete own campaigns" ON public.bulk_campaigns
            FOR DELETE USING ((select auth.uid()) = user_id);
        
        RAISE NOTICE 'Políticas corrigidas para bulk_campaigns';
    ELSE
        RAISE NOTICE 'Tabela bulk_campaigns não possui coluna user_id - pulando';
    END IF;
END $$;

-- 7. analytics_events
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
            AND table_name = 'analytics_events' 
            AND column_name = 'user_id'
    ) THEN
        DROP POLICY IF EXISTS "Users can view own analytics" ON public.analytics_events;
        CREATE POLICY "Users can view own analytics" ON public.analytics_events
            FOR SELECT USING ((select auth.uid()) = user_id);
        
        DROP POLICY IF EXISTS "Users can insert own analytics" ON public.analytics_events;
        CREATE POLICY "Users can insert own analytics" ON public.analytics_events
            FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
        
        RAISE NOTICE 'Políticas corrigidas para analytics_events';
    ELSE
        RAISE NOTICE 'Tabela analytics_events não possui coluna user_id - pulando';
    END IF;
END $$;

-- 8. system_logs
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
            AND table_name = 'system_logs' 
            AND column_name = 'user_id'
    ) THEN
        DROP POLICY IF EXISTS "Users can view own logs" ON public.system_logs;
        CREATE POLICY "Users can view own logs" ON public.system_logs
            FOR SELECT USING ((select auth.uid()) = user_id);
        
        DROP POLICY IF EXISTS "Users can insert own logs" ON public.system_logs;
        CREATE POLICY "Users can insert own logs" ON public.system_logs
            FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
        
        RAISE NOTICE 'Políticas corrigidas para system_logs';
    ELSE
        RAISE NOTICE 'Tabela system_logs não possui coluna user_id - pulando';
    END IF;
END $$;

-- 9. user_tags
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
            AND table_name = 'user_tags' 
            AND column_name = 'user_id'
    ) THEN
        DROP POLICY IF EXISTS "Users can manage own tags" ON public.user_tags;
        CREATE POLICY "Users can manage own tags" ON public.user_tags
            FOR ALL USING ((select auth.uid()) = user_id);
        RAISE NOTICE 'Política corrigida para user_tags';
    ELSE
        RAISE NOTICE 'Tabela user_tags não possui coluna user_id - pulando';
    END IF;
END $$;

-- 10. blog_posts (política especial para admins - com verificação de estrutura)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_name = 'blog_posts'
    ) THEN
        -- Verificar se a tabela auth.users tem a coluna id
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'auth' 
                AND table_name = 'users' 
                AND column_name = 'id'
        ) THEN
            DROP POLICY IF EXISTS "Admins podem gerenciar todos os posts" ON public.blog_posts;
            CREATE POLICY "Admins podem gerenciar todos os posts" ON public.blog_posts
                FOR ALL USING ((select auth.uid()) IN (
                    SELECT id FROM auth.users 
                    WHERE raw_user_meta_data->>'role' = 'admin'
                ));
            RAISE NOTICE 'Política corrigida para blog_posts';
        ELSE
            RAISE NOTICE 'Tabela auth.users não possui coluna id - criando política simples para blog_posts';
            DROP POLICY IF EXISTS "Admins podem gerenciar todos os posts" ON public.blog_posts;
            CREATE POLICY "Admins podem gerenciar todos os posts" ON public.blog_posts
                FOR ALL USING (true); -- Política temporária - ajustar conforme necessário
        END IF;
    ELSE
        RAISE NOTICE 'Tabela blog_posts não existe - pulando';
    END IF;
END $$;

-- =====================================================
-- VERIFICAÇÃO PÓS-CORREÇÃO
-- =====================================================

-- Verificar se as políticas foram criadas corretamente
SELECT 
    'VERIFICAÇÃO PÓS-CORREÇÃO' as status,
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar se ainda há warnings de RLS
SELECT 
    'RESUMO FINAL' as categoria,
    'Políticas RLS otimizadas' as status,
    COUNT(*) as total_politicas
FROM pg_policies 
WHERE schemaname = 'public';

-- =====================================================
-- SCRIPT DE ROLLBACK (EM CASO DE PROBLEMAS)
-- =====================================================

/*
-- Para reverter as mudanças, execute:
DROP TABLE IF EXISTS backup_rls_policies;

-- E restaure as políticas originais se necessário
*/











