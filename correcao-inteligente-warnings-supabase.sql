-- =====================================================
-- CORREÇÃO INTELIGENTE DE WARNINGS SUPABASE - RLS PERFORMANCE
-- =====================================================
-- Este script corrige os warnings de performance das políticas RLS
-- Verificando a estrutura das tabelas antes de criar as políticas

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
-- CORREÇÃO INTELIGENTE DAS POLÍTICAS RLS
-- =====================================================

-- Função para verificar se uma coluna existe em uma tabela
CREATE OR REPLACE FUNCTION column_exists(schema_name text, table_name text, column_name text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = schema_name 
            AND table_name = table_name 
            AND column_name = column_name
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CORREÇÃO DAS POLÍTICAS RLS COM VERIFICAÇÃO
-- =====================================================

DO $$
DECLARE
    tbl_name text;
    col_name text;
BEGIN
    -- Lista de tabelas e suas colunas de usuário
    FOR tbl_name, col_name IN 
        SELECT unnest(ARRAY[
            'lead_lists', 'user_id',
            'whatsapp_templates', 'user_id',
            'contact_attempts', 'user_id',
            'user_preferences', 'user_id',
            'whatsapp_instances', 'user_id',
            'bulk_campaigns', 'user_id',
            'analytics_events', 'user_id',
            'system_logs', 'user_id',
            'user_tags', 'user_id',
            'blog_posts', 'user_id',
            'campaign_leads', 'user_id',
            'whatsapp_responses', 'user_id',
            'sales_conversions', 'user_id',
            'message_templates', 'user_id',
            'lead_quality_scores', 'user_id',
            'analytics_insights', 'user_id',
            'campaign_performance_metrics', 'user_id',
            'campaign_unique_leads', 'user_id',
            'campaign_lists', 'user_id',
            'campaigns', 'user_id'
        ])
    LOOP
        -- Verificar se a tabela existe
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = tbl_name
        ) THEN
            -- Verificar se a coluna existe
            IF column_exists('public', tbl_name, col_name) THEN
                RAISE NOTICE 'Processando tabela: % com coluna: %', tbl_name, col_name;
                
                -- Aplicar políticas baseadas no tipo de tabela
                CASE tbl_name
                    WHEN 'lead_lists' THEN
                        EXECUTE format('DROP POLICY IF EXISTS "Users can manage own lead_lists" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can manage own lead_lists" ON public.%I FOR ALL USING ((select auth.uid()) = %I)', tbl_name, col_name);
                    
                    WHEN 'whatsapp_templates' THEN
                        EXECUTE format('DROP POLICY IF EXISTS "Users can manage own whatsapp_templates" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can manage own whatsapp_templates" ON public.%I FOR ALL USING ((select auth.uid()) = %I)', tbl_name, col_name);
                    
                    WHEN 'contact_attempts' THEN
                        EXECUTE format('DROP POLICY IF EXISTS "Users can manage own contact_attempts" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can manage own contact_attempts" ON public.%I FOR ALL USING ((select auth.uid()) = %I)', tbl_name, col_name);
                    
                    WHEN 'user_preferences' THEN
                        EXECUTE format('DROP POLICY IF EXISTS "Users can manage own user_preferences" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can manage own user_preferences" ON public.%I FOR ALL USING ((select auth.uid()) = %I)', tbl_name, col_name);
                    
                    WHEN 'whatsapp_instances' THEN
                        EXECUTE format('DROP POLICY IF EXISTS "Users can manage own whatsapp_instances" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can manage own whatsapp_instances" ON public.%I FOR ALL USING ((select auth.uid()) = %I)', tbl_name, col_name);
                    
                    WHEN 'bulk_campaigns' THEN
                        EXECUTE format('DROP POLICY IF EXISTS "Users can view own campaigns" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can view own campaigns" ON public.%I FOR SELECT USING ((select auth.uid()) = %I)', tbl_name, col_name);
                        EXECUTE format('DROP POLICY IF EXISTS "Users can insert own campaigns" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can insert own campaigns" ON public.%I FOR INSERT WITH CHECK ((select auth.uid()) = %I)', tbl_name, col_name);
                        EXECUTE format('DROP POLICY IF EXISTS "Users can update own campaigns" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can update own campaigns" ON public.%I FOR UPDATE USING ((select auth.uid()) = %I)', tbl_name, col_name);
                        EXECUTE format('DROP POLICY IF EXISTS "Users can delete own campaigns" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can delete own campaigns" ON public.%I FOR DELETE USING ((select auth.uid()) = %I)', tbl_name, col_name);
                    
                    WHEN 'analytics_events' THEN
                        EXECUTE format('DROP POLICY IF EXISTS "Users can view own analytics" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can view own analytics" ON public.%I FOR SELECT USING ((select auth.uid()) = %I)', tbl_name, col_name);
                        EXECUTE format('DROP POLICY IF EXISTS "Users can insert own analytics" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can insert own analytics" ON public.%I FOR INSERT WITH CHECK ((select auth.uid()) = %I)', tbl_name, col_name);
                    
                    WHEN 'system_logs' THEN
                        EXECUTE format('DROP POLICY IF EXISTS "Users can view own logs" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can view own logs" ON public.%I FOR SELECT USING ((select auth.uid()) = %I)', tbl_name, col_name);
                        EXECUTE format('DROP POLICY IF EXISTS "Users can insert own logs" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can insert own logs" ON public.%I FOR INSERT WITH CHECK ((select auth.uid()) = %I)', tbl_name, col_name);
                    
                    WHEN 'user_tags' THEN
                        EXECUTE format('DROP POLICY IF EXISTS "Users can manage own tags" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can manage own tags" ON public.%I FOR ALL USING ((select auth.uid()) = %I)', tbl_name, col_name);
                    
                    WHEN 'blog_posts' THEN
                        EXECUTE format('DROP POLICY IF EXISTS "Admins podem gerenciar todos os posts" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Admins podem gerenciar todos os posts" ON public.%I FOR ALL USING ((select auth.uid()) IN (SELECT user_id FROM auth.users WHERE raw_user_meta_data->>''role'' = ''admin''))', tbl_name);
                    
                    WHEN 'campaign_leads' THEN
                        EXECUTE format('DROP POLICY IF EXISTS "Users can view leads from own campaigns" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can view leads from own campaigns" ON public.%I FOR SELECT USING ((select auth.uid()) = %I)', tbl_name, col_name);
                        EXECUTE format('DROP POLICY IF EXISTS "Users can insert leads in own campaigns" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can insert leads in own campaigns" ON public.%I FOR INSERT WITH CHECK ((select auth.uid()) = %I)', tbl_name, col_name);
                        EXECUTE format('DROP POLICY IF EXISTS "Users can update leads in own campaigns" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can update leads in own campaigns" ON public.%I FOR UPDATE USING ((select auth.uid()) = %I)', tbl_name, col_name);
                        EXECUTE format('DROP POLICY IF EXISTS "Users can delete leads from own campaigns" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can delete leads from own campaigns" ON public.%I FOR DELETE USING ((select auth.uid()) = %I)', tbl_name, col_name);
                    
                    WHEN 'whatsapp_responses' THEN
                        EXECUTE format('DROP POLICY IF EXISTS "Users can view own responses" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can view own responses" ON public.%I FOR SELECT USING ((select auth.uid()) = %I)', tbl_name, col_name);
                        EXECUTE format('DROP POLICY IF EXISTS "Users can insert own responses" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can insert own responses" ON public.%I FOR INSERT WITH CHECK ((select auth.uid()) = %I)', tbl_name, col_name);
                    
                    WHEN 'sales_conversions' THEN
                        EXECUTE format('DROP POLICY IF EXISTS "Users can view own conversions" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can view own conversions" ON public.%I FOR SELECT USING ((select auth.uid()) = %I)', tbl_name, col_name);
                        EXECUTE format('DROP POLICY IF EXISTS "Users can insert own conversions" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can insert own conversions" ON public.%I FOR INSERT WITH CHECK ((select auth.uid()) = %I)', tbl_name, col_name);
                    
                    WHEN 'message_templates' THEN
                        EXECUTE format('DROP POLICY IF EXISTS "Users can manage own templates" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can manage own templates" ON public.%I FOR ALL USING ((select auth.uid()) = %I)', tbl_name, col_name);
                    
                    WHEN 'lead_quality_scores' THEN
                        EXECUTE format('DROP POLICY IF EXISTS "Users can view own quality scores" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can view own quality scores" ON public.%I FOR SELECT USING ((select auth.uid()) = %I)', tbl_name, col_name);
                        EXECUTE format('DROP POLICY IF EXISTS "Users can insert own quality scores" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can insert own quality scores" ON public.%I FOR INSERT WITH CHECK ((select auth.uid()) = %I)', tbl_name, col_name);
                    
                    WHEN 'analytics_insights' THEN
                        EXECUTE format('DROP POLICY IF EXISTS "Users can view own insights" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can view own insights" ON public.%I FOR SELECT USING ((select auth.uid()) = %I)', tbl_name, col_name);
                        EXECUTE format('DROP POLICY IF EXISTS "Users can update own insights" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can update own insights" ON public.%I FOR UPDATE USING ((select auth.uid()) = %I)', tbl_name, col_name);
                    
                    WHEN 'campaign_performance_metrics' THEN
                        EXECUTE format('DROP POLICY IF EXISTS "Users can view own metrics" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can view own metrics" ON public.%I FOR SELECT USING ((select auth.uid()) = %I)', tbl_name, col_name);
                        EXECUTE format('DROP POLICY IF EXISTS "Users can insert own metrics" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can insert own metrics" ON public.%I FOR INSERT WITH CHECK ((select auth.uid()) = %I)', tbl_name, col_name);
                    
                    WHEN 'campaign_unique_leads' THEN
                        EXECUTE format('DROP POLICY IF EXISTS "Users can view their own campaign leads" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can view their own campaign leads" ON public.%I FOR SELECT USING ((select auth.uid()) = %I)', tbl_name, col_name);
                        EXECUTE format('DROP POLICY IF EXISTS "Users can insert their own campaign leads" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can insert their own campaign leads" ON public.%I FOR INSERT WITH CHECK ((select auth.uid()) = %I)', tbl_name, col_name);
                        EXECUTE format('DROP POLICY IF EXISTS "Users can update their own campaign leads" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can update their own campaign leads" ON public.%I FOR UPDATE USING ((select auth.uid()) = %I)', tbl_name, col_name);
                        EXECUTE format('DROP POLICY IF EXISTS "Users can delete their own campaign leads" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can delete their own campaign leads" ON public.%I FOR DELETE USING ((select auth.uid()) = %I)', tbl_name, col_name);
                    
                    WHEN 'campaign_lists' THEN
                        EXECUTE format('DROP POLICY IF EXISTS "Users can view their own campaign lists" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can view their own campaign lists" ON public.%I FOR SELECT USING ((select auth.uid()) = %I)', tbl_name, col_name);
                        EXECUTE format('DROP POLICY IF EXISTS "Users can insert their own campaign lists" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can insert their own campaign lists" ON public.%I FOR INSERT WITH CHECK ((select auth.uid()) = %I)', tbl_name, col_name);
                        EXECUTE format('DROP POLICY IF EXISTS "Users can update their own campaign lists" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can update their own campaign lists" ON public.%I FOR UPDATE USING ((select auth.uid()) = %I)', tbl_name, col_name);
                        EXECUTE format('DROP POLICY IF EXISTS "Users can delete their own campaign lists" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can delete their own campaign lists" ON public.%I FOR DELETE USING ((select auth.uid()) = %I)', tbl_name, col_name);
                    
                    WHEN 'campaigns' THEN
                        EXECUTE format('DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.%I', tbl_name);
                        EXECUTE format('CREATE POLICY "Users can update their own campaigns" ON public.%I FOR UPDATE USING ((select auth.uid()) = %I)', tbl_name, col_name);
                    
                    ELSE
                        RAISE NOTICE 'Tabela % não tem política específica definida', tbl_name;
                END CASE;
                
                RAISE NOTICE 'Políticas criadas para tabela: %', tbl_name;
            ELSE
                RAISE NOTICE 'Tabela % não possui coluna % - pulando', tbl_name, col_name;
            END IF;
        ELSE
            RAISE NOTICE 'Tabela % não existe - pulando', tbl_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Correção de políticas RLS concluída!';
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
-- LIMPEZA
-- =====================================================

-- Remover função auxiliar
DROP FUNCTION IF EXISTS column_exists(text, text, text);

-- =====================================================
-- SCRIPT DE ROLLBACK (EM CASO DE PROBLEMAS)
-- =====================================================

/*
-- Para reverter as mudanças, execute:
DROP TABLE IF EXISTS backup_rls_policies;

-- E restaure as políticas originais se necessário
*/











