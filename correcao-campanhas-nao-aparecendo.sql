-- =====================================================
-- DIAGNÓSTICO E CORREÇÃO - CAMPANHAS NÃO APARECENDO
-- =====================================================
-- Este script diagnostica e corrige o problema das campanhas
-- que não estão aparecendo na aplicação
-- =====================================================

-- =====================================================
-- DIAGNÓSTICO 1: Verificar estado das tabelas de campanhas
-- =====================================================
SELECT 
    'DIAGNÓSTICO CAMPANHAS' as categoria,
    table_name as tabela,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = table_name) THEN 'EXISTE'
        ELSE 'NÃO EXISTE'
    END as existe,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = table_name AND rowsecurity = true) THEN 'RLS HABILITADO'
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = table_name AND rowsecurity = false) THEN 'RLS DESABILITADO'
        ELSE 'N/A'
    END as rls_status
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('bulk_campaigns', 'campaign_leads', 'campaign_unique_leads', 'campaign_lists')
ORDER BY table_name;

-- =====================================================
-- DIAGNÓSTICO 2: Verificar políticas de bulk_campaigns
-- =====================================================
SELECT 
    'POLÍTICAS BULK_CAMPAIGNS' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    qual as condicao,
    with_check as verificacao
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'bulk_campaigns'
ORDER BY policyname;

-- =====================================================
-- DIAGNÓSTICO 3: Verificar políticas de campaign_leads
-- =====================================================
SELECT 
    'POLÍTICAS CAMPAIGN_LEADS' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    qual as condicao,
    with_check as verificacao
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'campaign_leads'
ORDER BY policyname;

-- =====================================================
-- DIAGNÓSTICO 4: Verificar dados nas tabelas de campanhas
-- =====================================================
DO $$
DECLARE
    record_count integer;
BEGIN
    -- Testar bulk_campaigns
    BEGIN
        SELECT COUNT(*) INTO record_count FROM bulk_campaigns;
        RAISE NOTICE 'bulk_campaigns: % registros', record_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'ERRO ao acessar bulk_campaigns: %', SQLERRM;
    END;
    
    -- Testar campaign_leads
    BEGIN
        SELECT COUNT(*) INTO record_count FROM campaign_leads;
        RAISE NOTICE 'campaign_leads: % registros', record_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'ERRO ao acessar campaign_leads: %', SQLERRM;
    END;
    
    -- Testar campaign_unique_leads
    BEGIN
        SELECT COUNT(*) INTO record_count FROM campaign_unique_leads;
        RAISE NOTICE 'campaign_unique_leads: % registros', record_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'ERRO ao acessar campaign_unique_leads: %', SQLERRM;
    END;
    
    -- Testar campaign_lists
    BEGIN
        SELECT COUNT(*) INTO record_count FROM campaign_lists;
        RAISE NOTICE 'campaign_lists: % registros', record_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'ERRO ao acessar campaign_lists: %', SQLERRM;
    END;
END $$;

-- =====================================================
-- DIAGNÓSTICO 5: Verificar colunas de bulk_campaigns
-- =====================================================
SELECT 
    'COLUNAS BULK_CAMPAIGNS' as categoria,
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable,
    column_default as default_value
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'bulk_campaigns'
ORDER BY ordinal_position;

-- =====================================================
-- CORREÇÃO 1: Corrigir políticas de bulk_campaigns
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bulk_campaigns') THEN
        
        -- Habilitar RLS
        ALTER TABLE public.bulk_campaigns ENABLE ROW LEVEL SECURITY;
        
        -- Remover políticas existentes
        DROP POLICY IF EXISTS "Users can view own campaigns" ON public.bulk_campaigns;
        DROP POLICY IF EXISTS "Users can insert own campaigns" ON public.bulk_campaigns;
        DROP POLICY IF EXISTS "Users can update own campaigns" ON public.bulk_campaigns;
        DROP POLICY IF EXISTS "Users can delete own campaigns" ON public.bulk_campaigns;
        DROP POLICY IF EXISTS "Users can manage own campaigns" ON public.bulk_campaigns;
        
        -- Criar políticas corretas
        CREATE POLICY "Users can view own campaigns" ON public.bulk_campaigns FOR SELECT USING (user_id = auth.uid());
        CREATE POLICY "Users can insert own campaigns" ON public.bulk_campaigns FOR INSERT WITH CHECK (user_id = auth.uid());
        CREATE POLICY "Users can update own campaigns" ON public.bulk_campaigns FOR UPDATE USING (user_id = auth.uid());
        CREATE POLICY "Users can delete own campaigns" ON public.bulk_campaigns FOR DELETE USING (user_id = auth.uid());
        
        RAISE NOTICE 'Políticas corrigidas para bulk_campaigns';
        
    ELSE
        RAISE NOTICE 'Tabela bulk_campaigns não existe - pulando';
    END IF;
END $$;

-- =====================================================
-- CORREÇÃO 2: Corrigir políticas de campaign_leads
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_leads') THEN
        
        -- Habilitar RLS
        ALTER TABLE public.campaign_leads ENABLE ROW LEVEL SECURITY;
        
        -- Remover políticas existentes
        DROP POLICY IF EXISTS "Users can view leads from own campaigns" ON public.campaign_leads;
        DROP POLICY IF EXISTS "Users can insert leads in own campaigns" ON public.campaign_leads;
        DROP POLICY IF EXISTS "Users can update leads in own campaigns" ON public.campaign_leads;
        DROP POLICY IF EXISTS "Users can delete leads from own campaigns" ON public.campaign_leads;
        DROP POLICY IF EXISTS "Users can manage own campaign leads" ON public.campaign_leads;
        
        -- Criar políticas corretas
        CREATE POLICY "Users can view leads from own campaigns" ON public.campaign_leads FOR SELECT USING (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = auth.uid()));
        CREATE POLICY "Users can insert leads in own campaigns" ON public.campaign_leads FOR INSERT WITH CHECK (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = auth.uid()));
        CREATE POLICY "Users can update leads in own campaigns" ON public.campaign_leads FOR UPDATE USING (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = auth.uid()));
        CREATE POLICY "Users can delete leads from own campaigns" ON public.campaign_leads FOR DELETE USING (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = auth.uid()));
        
        RAISE NOTICE 'Políticas corrigidas para campaign_leads';
        
    ELSE
        RAISE NOTICE 'Tabela campaign_leads não existe - pulando';
    END IF;
END $$;

-- =====================================================
-- CORREÇÃO 3: Corrigir políticas de campaign_unique_leads
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_unique_leads') THEN
        
        -- Habilitar RLS
        ALTER TABLE public.campaign_unique_leads ENABLE ROW LEVEL SECURITY;
        
        -- Remover políticas existentes
        DROP POLICY IF EXISTS "Users can manage own unique leads" ON public.campaign_unique_leads;
        
        -- Criar política correta
        CREATE POLICY "Users can manage own unique leads" ON public.campaign_unique_leads FOR ALL USING (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = auth.uid()));
        
        RAISE NOTICE 'Política corrigida para campaign_unique_leads';
        
    ELSE
        RAISE NOTICE 'Tabela campaign_unique_leads não existe - pulando';
    END IF;
END $$;

-- =====================================================
-- CORREÇÃO 4: Corrigir políticas de campaign_lists
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_lists') THEN
        
        -- Habilitar RLS
        ALTER TABLE public.campaign_lists ENABLE ROW LEVEL SECURITY;
        
        -- Remover políticas existentes
        DROP POLICY IF EXISTS "Users can manage own campaign lists" ON public.campaign_lists;
        
        -- Criar política correta
        CREATE POLICY "Users can manage own campaign lists" ON public.campaign_lists FOR ALL USING (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = auth.uid()));
        
        RAISE NOTICE 'Política corrigida para campaign_lists';
        
    ELSE
        RAISE NOTICE 'Tabela campaign_lists não existe - pulando';
    END IF;
END $$;

-- =====================================================
-- CORREÇÃO 5: Criar/recriar views de campanhas
-- =====================================================
DO $$
BEGIN
    -- Recriar view campaign_leads_view
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
    RAISE NOTICE 'View campaign_leads_view recriada';
    
    -- Recriar view campaign_metrics_summary
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
    RAISE NOTICE 'View campaign_metrics_summary recriada';
END $$;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
-- Mostrar status das tabelas de campanhas
SELECT 
    'CORREÇÃO CAMPANHAS CONCLUÍDA' as status,
    tablename as tabela,
    CASE 
        WHEN rowsecurity THEN 'RLS OK'
        ELSE 'RLS DESABILITADO'
    END as rls_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) THEN 'POLÍTICAS OK'
        ELSE 'SEM POLÍTICAS'
    END as politicas_status
FROM pg_tables t
WHERE schemaname = 'public'
AND tablename IN ('bulk_campaigns', 'campaign_leads', 'campaign_unique_leads', 'campaign_lists')
ORDER BY tablename;

-- Mostrar views recriadas
SELECT 
    'VIEWS RECRIADAS' as status,
    table_name as view,
    'OK' as status
FROM information_schema.views 
WHERE table_schema = 'public'
AND table_name IN ('campaign_leads_view', 'campaign_metrics_summary')
ORDER BY table_name;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'CAMPANHAS CORRIGIDAS' as status,
    'Políticas e views de campanhas restauradas' as mensagem,
    'Teste o acesso às campanhas agora' as proximo_passo;











