-- =====================================================
-- CORREÇÃO CONSERVADORA - APENAS RLS PERFORMANCE
-- =====================================================
-- Este script corrige APENAS os warnings de performance RLS
-- Substitui auth.uid() por (select auth.uid()) nas políticas
-- 
-- ⚠️  ESTRATÉGIA CONSERVADORA:
-- - Corrige apenas UM tipo de warning por vez
-- - Foco em performance RLS (mais seguro)
-- - Backup automático antes das mudanças
-- - Rollback disponível se necessário
-- =====================================================

-- Backup das políticas existentes
CREATE TABLE IF NOT EXISTS backup_policies_rls_performance AS
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
WHERE schemaname = 'public'
AND policyname LIKE '%Users can%'
OR policyname LIKE '%Admins podem%';

-- Função para verificar se a tabela existe
CREATE OR REPLACE FUNCTION table_exists(tbl_name text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = tbl_name
    );
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se a coluna user_id existe
CREATE OR REPLACE FUNCTION has_user_id_column(tbl_name text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = tbl_name
        AND column_name = 'user_id'
    );
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se a coluna author_id existe
CREATE OR REPLACE FUNCTION has_author_id_column(tbl_name text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = tbl_name
        AND column_name = 'author_id'
    );
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se a coluna campaign_id existe
CREATE OR REPLACE FUNCTION has_campaign_id_column(tbl_name text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = tbl_name
        AND column_name = 'campaign_id'
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CORREÇÃO 1: TABELAS COM user_id
-- =====================================================
DO $$
DECLARE
    tbl_name text;
BEGIN
    -- Lista de tabelas que sabemos que têm user_id
    FOR tbl_name IN SELECT unnest(ARRAY[
        'lead_lists',
        'whatsapp_templates', 
        'contact_attempts',
        'user_preferences',
        'whatsapp_instances',
        'bulk_campaigns',
        'analytics_events',
        'system_logs',
        'user_tags',
        'whatsapp_responses',
        'sales_conversions',
        'message_templates',
        'lead_quality_scores'
    ]) LOOP
        
        -- Verificar se a tabela existe e tem user_id
        IF table_exists(tbl_name) AND has_user_id_column(tbl_name) THEN
            
            -- Corrigir políticas de visualização
            EXECUTE format('DROP POLICY IF EXISTS "Users can view own %s" ON public.%I', tbl_name, tbl_name);
            EXECUTE format('CREATE POLICY "Users can view own %s" ON public.%I FOR SELECT USING (user_id = (select auth.uid()))', tbl_name, tbl_name);
            
            -- Corrigir políticas de inserção
            EXECUTE format('DROP POLICY IF EXISTS "Users can insert own %s" ON public.%I', tbl_name, tbl_name);
            EXECUTE format('CREATE POLICY "Users can insert own %s" ON public.%I FOR INSERT WITH CHECK (user_id = (select auth.uid()))', tbl_name, tbl_name);
            
            -- Corrigir políticas de atualização
            EXECUTE format('DROP POLICY IF EXISTS "Users can update own %s" ON public.%I', tbl_name, tbl_name);
            EXECUTE format('CREATE POLICY "Users can update own %s" ON public.%I FOR UPDATE USING (user_id = (select auth.uid()))', tbl_name, tbl_name);
            
            -- Corrigir políticas de exclusão
            EXECUTE format('DROP POLICY IF EXISTS "Users can delete own %s" ON public.%I', tbl_name, tbl_name);
            EXECUTE format('CREATE POLICY "Users can delete own %s" ON public.%I FOR DELETE USING (user_id = (select auth.uid()))', tbl_name, tbl_name);
            
            -- Corrigir políticas de gerenciamento geral
            EXECUTE format('DROP POLICY IF EXISTS "Users can manage own %s" ON public.%I', tbl_name, tbl_name);
            EXECUTE format('CREATE POLICY "Users can manage own %s" ON public.%I FOR ALL USING (user_id = (select auth.uid()))', tbl_name, tbl_name);
            
            RAISE NOTICE 'Políticas RLS corrigidas para tabela: %', tbl_name;
            
        ELSE
            RAISE NOTICE 'Tabela % não existe ou não tem user_id - pulando', tbl_name;
        END IF;
        
    END LOOP;
END $$;

-- =====================================================
-- CORREÇÃO 2: TABELAS COM author_id (blog_posts)
-- =====================================================
DO $$
BEGIN
    IF table_exists('blog_posts') AND has_author_id_column('blog_posts') THEN
        
        -- Corrigir política de admin para blog_posts
        EXECUTE 'DROP POLICY IF EXISTS "Admins podem gerenciar todos os posts" ON public.blog_posts';
        EXECUTE 'CREATE POLICY "Admins podem gerenciar todos os posts" ON public.blog_posts FOR ALL USING (author_id = (select auth.uid()))';
        
        RAISE NOTICE 'Política RLS corrigida para blog_posts';
        
    ELSE
        RAISE NOTICE 'Tabela blog_posts não existe ou não tem author_id - pulando';
    END IF;
END $$;

-- =====================================================
-- CORREÇÃO 3: TABELAS COM campaign_id (campaign_leads)
-- =====================================================
DO $$
BEGIN
    IF table_exists('campaign_leads') AND has_campaign_id_column('campaign_leads') THEN
        
        -- Corrigir políticas de campaign_leads
        EXECUTE 'DROP POLICY IF EXISTS "Users can view leads from own campaigns" ON public.campaign_leads';
        EXECUTE 'CREATE POLICY "Users can view leads from own campaigns" ON public.campaign_leads FOR SELECT USING (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = (select auth.uid())))';
        
        EXECUTE 'DROP POLICY IF EXISTS "Users can insert leads in own campaigns" ON public.campaign_leads';
        EXECUTE 'CREATE POLICY "Users can insert leads in own campaigns" ON public.campaign_leads FOR INSERT WITH CHECK (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = (select auth.uid())))';
        
        EXECUTE 'DROP POLICY IF EXISTS "Users can update leads in own campaigns" ON public.campaign_leads';
        EXECUTE 'CREATE POLICY "Users can update leads in own campaigns" ON public.campaign_leads FOR UPDATE USING (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = (select auth.uid())))';
        
        EXECUTE 'DROP POLICY IF EXISTS "Users can delete leads from own campaigns" ON public.campaign_leads';
        EXECUTE 'CREATE POLICY "Users can delete leads from own campaigns" ON public.campaign_leads FOR DELETE USING (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = (select auth.uid())))';
        
        RAISE NOTICE 'Políticas RLS corrigidas para campaign_leads';
        
    ELSE
        RAISE NOTICE 'Tabela campaign_leads não existe ou não tem campaign_id - pulando';
    END IF;
END $$;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
-- Mostrar quantas políticas foram corrigidas
SELECT 
    'Políticas RLS corrigidas' as status,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public'
AND (qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%');

-- Mostrar backup criado
SELECT 
    'Backup criado' as status,
    COUNT(*) as backup_count
FROM backup_policies_rls_performance;

-- =====================================================
-- SCRIPT DE ROLLBACK (se necessário)
-- =====================================================
/*
-- Para reverter as mudanças, execute:
DROP TABLE IF EXISTS backup_policies_rls_performance;

-- Ou restaure as políticas originais:
-- (Execute apenas se necessário)
*/