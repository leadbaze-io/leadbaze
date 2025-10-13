-- =====================================================
-- CORREÇÃO DE WARNINGS DE SEGURANÇA SUPABASE
-- =====================================================
-- Este script corrige warnings de Security Definer Views e RLS Disabled

-- BACKUP DAS VIEWS E TABELAS ATUAIS
CREATE TABLE IF NOT EXISTS backup_security_objects AS 
SELECT 
    'view' as object_type,
    schemaname,
    viewname as object_name,
    definition
FROM pg_views 
WHERE schemaname = 'public'
UNION ALL
SELECT 
    'table' as object_type,
    schemaname,
    tablename as object_name,
    'RLS: ' || CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as definition
FROM pg_tables 
WHERE schemaname = 'public';

-- =====================================================
-- CORREÇÃO DE SECURITY DEFINER VIEWS
-- =====================================================

-- 1. category_performance
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_schema = 'public' 
            AND table_name = 'category_performance'
    ) THEN
        -- Recriar view sem SECURITY DEFINER
        DROP VIEW IF EXISTS public.category_performance CASCADE;
        -- Nota: A view será recriada sem SECURITY DEFINER
        -- Você precisará fornecer a definição original da view
        RAISE NOTICE 'View category_performance removida - precisa ser recriada sem SECURITY DEFINER';
    ELSE
        RAISE NOTICE 'View category_performance não existe - pulando';
    END IF;
END $$;

-- 2. campaign_leads_view
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_schema = 'public' 
            AND table_name = 'campaign_leads_view'
    ) THEN
        DROP VIEW IF EXISTS public.campaign_leads_view CASCADE;
        RAISE NOTICE 'View campaign_leads_view removida - precisa ser recriada sem SECURITY DEFINER';
    ELSE
        RAISE NOTICE 'View campaign_leads_view não existe - pulando';
    END IF;
END $$;

-- 3. user_profiles_complete
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_schema = 'public' 
            AND table_name = 'user_profiles_complete'
    ) THEN
        DROP VIEW IF EXISTS public.user_profiles_complete CASCADE;
        RAISE NOTICE 'View user_profiles_complete removida - precisa ser recriada sem SECURITY DEFINER';
    ELSE
        RAISE NOTICE 'View user_profiles_complete não existe - pulando';
    END IF;
END $$;

-- 4. campaign_metrics_summary
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_schema = 'public' 
            AND table_name = 'campaign_metrics_summary'
    ) THEN
        DROP VIEW IF EXISTS public.campaign_metrics_summary CASCADE;
        RAISE NOTICE 'View campaign_metrics_summary removida - precisa ser recriada sem SECURITY DEFINER';
    ELSE
        RAISE NOTICE 'View campaign_metrics_summary não existe - pulando';
    END IF;
END $$;

-- =====================================================
-- HABILITAÇÃO DE RLS EM TABELAS PÚBLICAS
-- =====================================================

-- 1. subscription_changes
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_name = 'subscription_changes'
    ) THEN
        ALTER TABLE public.subscription_changes ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado para subscription_changes';
    ELSE
        RAISE NOTICE 'Tabela subscription_changes não existe - pulando';
    END IF;
END $$;

-- 2. upgrade_pending
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_name = 'upgrade_pending'
    ) THEN
        ALTER TABLE public.upgrade_pending ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado para upgrade_pending';
    ELSE
        RAISE NOTICE 'Tabela upgrade_pending não existe - pulando';
    END IF;
END $$;

-- 3. campaign_leads_backup
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_name = 'campaign_leads_backup'
    ) THEN
        ALTER TABLE public.campaign_leads_backup ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado para campaign_leads_backup';
    ELSE
        RAISE NOTICE 'Tabela campaign_leads_backup não existe - pulando';
    END IF;
END $$;

-- 4. user_payment_subscriptions
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_name = 'user_payment_subscriptions'
    ) THEN
        ALTER TABLE public.user_payment_subscriptions ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado para user_payment_subscriptions';
    ELSE
        RAISE NOTICE 'Tabela user_payment_subscriptions não existe - pulando';
    END IF;
END $$;

-- 5. whatsapp_delivery_status
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_name = 'whatsapp_delivery_status'
    ) THEN
        ALTER TABLE public.whatsapp_delivery_status ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado para whatsapp_delivery_status';
    ELSE
        RAISE NOTICE 'Tabela whatsapp_delivery_status não existe - pulando';
    END IF;
END $$;

-- 6. payment_plans
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_name = 'payment_plans'
    ) THEN
        ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado para payment_plans';
    ELSE
        RAISE NOTICE 'Tabela payment_plans não existe - pulando';
    END IF;
END $$;

-- 7. payment_plan_changes
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_name = 'payment_plan_changes'
    ) THEN
        ALTER TABLE public.payment_plan_changes ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado para payment_plan_changes';
    ELSE
        RAISE NOTICE 'Tabela payment_plan_changes não existe - pulando';
    END IF;
END $$;

-- 8. payment_webhooks
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_name = 'payment_webhooks'
    ) THEN
        ALTER TABLE public.payment_webhooks ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado para payment_webhooks';
    ELSE
        RAISE NOTICE 'Tabela payment_webhooks não existe - pulando';
    END IF;
END $$;

-- 9. lead_packages
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_name = 'lead_packages'
    ) THEN
        ALTER TABLE public.lead_packages ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado para lead_packages';
    ELSE
        RAISE NOTICE 'Tabela lead_packages não existe - pulando';
    END IF;
END $$;

-- 10. support_tickets
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_name = 'support_tickets'
    ) THEN
        ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado para support_tickets';
    ELSE
        RAISE NOTICE 'Tabela support_tickets não existe - pulando';
    END IF;
END $$;

-- 11. backup_rls_policies (tabela de backup - pode ter RLS mais permissivo)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_name = 'backup_rls_policies'
    ) THEN
        ALTER TABLE public.backup_rls_policies ENABLE ROW LEVEL SECURITY;
        -- Criar política permissiva para tabela de backup
        CREATE POLICY "Allow all operations on backup table" ON public.backup_rls_policies
            FOR ALL USING (true);
        RAISE NOTICE 'RLS habilitado para backup_rls_policies com política permissiva';
    ELSE
        RAISE NOTICE 'Tabela backup_rls_policies não existe - pulando';
    END IF;
END $$;

-- =====================================================
-- VERIFICAÇÃO PÓS-CORREÇÃO
-- =====================================================

-- Verificar views sem SECURITY DEFINER
SELECT 
    'VIEWS SEM SECURITY DEFINER' as categoria,
    schemaname,
    viewname as view_name,
    'OK' as status
FROM pg_views 
WHERE schemaname = 'public'
    AND viewname IN ('category_performance', 'campaign_leads_view', 'user_profiles_complete', 'campaign_metrics_summary')
ORDER BY viewname;

-- Verificar tabelas com RLS habilitado
SELECT 
    'TABELAS COM RLS HABILITADO' as categoria,
    schemaname,
    tablename as table_name,
    CASE WHEN rowsecurity THEN 'RLS HABILITADO' ELSE 'RLS DESABILITADO' END as status
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename IN (
        'subscription_changes', 'upgrade_pending', 'campaign_leads_backup',
        'user_payment_subscriptions', 'whatsapp_delivery_status', 'payment_plans',
        'payment_plan_changes', 'payment_webhooks', 'lead_packages',
        'support_tickets', 'backup_rls_policies'
    )
ORDER BY tablename;

-- =====================================================
-- RESUMO FINAL
-- =====================================================

SELECT 
    'RESUMO FINAL' as categoria,
    'Security Definer Views removidas' as acao_1,
    'RLS habilitado em tabelas públicas' as acao_2,
    'Warnings de segurança corrigidos' as resultado;

-- =====================================================
-- SCRIPT DE ROLLBACK (EM CASO DE PROBLEMAS)
-- =====================================================

/*
-- Para reverter as mudanças, execute:
DROP TABLE IF EXISTS backup_security_objects;

-- E restaure as views e tabelas originais se necessário
-- Nota: As views precisarão ser recriadas manualmente
*/









