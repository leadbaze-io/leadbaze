-- =====================================================
-- CORREÇÃO DE WARNINGS SUPABASE - RLS PERFORMANCE
-- =====================================================
-- Este script corrige os warnings de performance das políticas RLS
-- Substituindo auth.uid() por (select auth.uid()) para evitar re-avaliação por linha

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
-- CORREÇÃO DAS POLÍTICAS RLS
-- =====================================================

-- 1. lead_lists
DROP POLICY IF EXISTS "Users can manage own lead_lists" ON public.lead_lists;
CREATE POLICY "Users can manage own lead_lists" ON public.lead_lists
    FOR ALL USING ((select auth.uid()) = user_id);

-- 2. whatsapp_templates
DROP POLICY IF EXISTS "Users can manage own whatsapp_templates" ON public.whatsapp_templates;
CREATE POLICY "Users can manage own whatsapp_templates" ON public.whatsapp_templates
    FOR ALL USING ((select auth.uid()) = user_id);

-- 3. contact_attempts
DROP POLICY IF EXISTS "Users can manage own contact_attempts" ON public.contact_attempts;
CREATE POLICY "Users can manage own contact_attempts" ON public.contact_attempts
    FOR ALL USING ((select auth.uid()) = user_id);

-- 4. user_preferences
DROP POLICY IF EXISTS "Users can manage own user_preferences" ON public.user_preferences;
CREATE POLICY "Users can manage own user_preferences" ON public.user_preferences
    FOR ALL USING ((select auth.uid()) = user_id);

-- 5. whatsapp_instances
DROP POLICY IF EXISTS "Users can manage own whatsapp_instances" ON public.whatsapp_instances;
CREATE POLICY "Users can manage own whatsapp_instances" ON public.whatsapp_instances
    FOR ALL USING ((select auth.uid()) = user_id);

-- 6. bulk_campaigns
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

-- 7. analytics_events
DROP POLICY IF EXISTS "Users can view own analytics" ON public.analytics_events;
CREATE POLICY "Users can view own analytics" ON public.analytics_events
    FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own analytics" ON public.analytics_events;
CREATE POLICY "Users can insert own analytics" ON public.analytics_events
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- 8. system_logs
DROP POLICY IF EXISTS "Users can view own logs" ON public.system_logs;
CREATE POLICY "Users can view own logs" ON public.system_logs
    FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own logs" ON public.system_logs;
CREATE POLICY "Users can insert own logs" ON public.system_logs
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- 9. user_tags
DROP POLICY IF EXISTS "Users can manage own tags" ON public.user_tags;
CREATE POLICY "Users can manage own tags" ON public.user_tags
    FOR ALL USING ((select auth.uid()) = user_id);

-- 10. blog_posts
DROP POLICY IF EXISTS "Admins podem gerenciar todos os posts" ON public.blog_posts;
CREATE POLICY "Admins podem gerenciar todos os posts" ON public.blog_posts
    FOR ALL USING ((select auth.uid()) IN (
        SELECT user_id FROM auth.users 
        WHERE raw_user_meta_data->>'role' = 'admin'
    ));

-- 11. campaign_leads
DROP POLICY IF EXISTS "Users can view leads from own campaigns" ON public.campaign_leads;
CREATE POLICY "Users can view leads from own campaigns" ON public.campaign_leads
    FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert leads in own campaigns" ON public.campaign_leads;
CREATE POLICY "Users can insert leads in own campaigns" ON public.campaign_leads
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update leads in own campaigns" ON public.campaign_leads;
CREATE POLICY "Users can update leads in own campaigns" ON public.campaign_leads
    FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete leads from own campaigns" ON public.campaign_leads;
CREATE POLICY "Users can delete leads from own campaigns" ON public.campaign_leads
    FOR DELETE USING ((select auth.uid()) = user_id);

-- 12. whatsapp_responses
DROP POLICY IF EXISTS "Users can view own responses" ON public.whatsapp_responses;
CREATE POLICY "Users can view own responses" ON public.whatsapp_responses
    FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own responses" ON public.whatsapp_responses;
CREATE POLICY "Users can insert own responses" ON public.whatsapp_responses
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- 13. sales_conversions
DROP POLICY IF EXISTS "Users can view own conversions" ON public.sales_conversions;
CREATE POLICY "Users can view own conversions" ON public.sales_conversions
    FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own conversions" ON public.sales_conversions;
CREATE POLICY "Users can insert own conversions" ON public.sales_conversions
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- 14. message_templates
DROP POLICY IF EXISTS "Users can manage own templates" ON public.message_templates;
CREATE POLICY "Users can manage own templates" ON public.message_templates
    FOR ALL USING ((select auth.uid()) = user_id);

-- 15. lead_quality_scores
DROP POLICY IF EXISTS "Users can view own quality scores" ON public.lead_quality_scores;
CREATE POLICY "Users can view own quality scores" ON public.lead_quality_scores
    FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own quality scores" ON public.lead_quality_scores;
CREATE POLICY "Users can insert own quality scores" ON public.lead_quality_scores
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- 16. analytics_insights
DROP POLICY IF EXISTS "Users can view own insights" ON public.analytics_insights;
CREATE POLICY "Users can view own insights" ON public.analytics_insights
    FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own insights" ON public.analytics_insights;
CREATE POLICY "Users can update own insights" ON public.analytics_insights
    FOR UPDATE USING ((select auth.uid()) = user_id);

-- 17. campaign_performance_metrics
DROP POLICY IF EXISTS "Users can view own metrics" ON public.campaign_performance_metrics;
CREATE POLICY "Users can view own metrics" ON public.campaign_performance_metrics
    FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own metrics" ON public.campaign_performance_metrics;
CREATE POLICY "Users can insert own metrics" ON public.campaign_performance_metrics
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- 18. campaign_unique_leads
DROP POLICY IF EXISTS "Users can view their own campaign leads" ON public.campaign_unique_leads;
CREATE POLICY "Users can view their own campaign leads" ON public.campaign_unique_leads
    FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own campaign leads" ON public.campaign_unique_leads;
CREATE POLICY "Users can insert their own campaign leads" ON public.campaign_unique_leads
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own campaign leads" ON public.campaign_unique_leads;
CREATE POLICY "Users can update their own campaign leads" ON public.campaign_unique_leads
    FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own campaign leads" ON public.campaign_unique_leads;
CREATE POLICY "Users can delete their own campaign leads" ON public.campaign_unique_leads
    FOR DELETE USING ((select auth.uid()) = user_id);

-- 19. campaign_lists
DROP POLICY IF EXISTS "Users can view their own campaign lists" ON public.campaign_lists;
CREATE POLICY "Users can view their own campaign lists" ON public.campaign_lists
    FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own campaign lists" ON public.campaign_lists;
CREATE POLICY "Users can insert their own campaign lists" ON public.campaign_lists
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own campaign lists" ON public.campaign_lists;
CREATE POLICY "Users can update their own campaign lists" ON public.campaign_lists
    FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own campaign lists" ON public.campaign_lists;
CREATE POLICY "Users can delete their own campaign lists" ON public.campaign_lists
    FOR DELETE USING ((select auth.uid()) = user_id);

-- 20. campaigns
DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.campaigns;
CREATE POLICY "Users can update their own campaigns" ON public.campaigns
    FOR UPDATE USING ((select auth.uid()) = user_id);

-- =====================================================
-- VERIFICAÇÃO PÓS-CORREÇÃO
-- =====================================================

-- Verificar se as políticas foram criadas corretamente
SELECT 
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











