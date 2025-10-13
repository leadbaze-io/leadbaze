-- =====================================================
-- CORREÇÃO SIMPLES - PÁGINA DISPARADOR
-- =====================================================
-- Este script corrige problemas específicos que podem estar
-- impedindo as campanhas de aparecer na página de disparador
-- Versão simplificada sem funções auxiliares
-- =====================================================

-- =====================================================
-- CORREÇÃO 1: Políticas simples e diretas para bulk_campaigns
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bulk_campaigns') THEN
        
        -- Remover todas as políticas existentes
        DROP POLICY IF EXISTS "Users can view own campaigns" ON public.bulk_campaigns;
        DROP POLICY IF EXISTS "Users can insert own campaigns" ON public.bulk_campaigns;
        DROP POLICY IF EXISTS "Users can update own campaigns" ON public.bulk_campaigns;
        DROP POLICY IF EXISTS "Users can delete own campaigns" ON public.bulk_campaigns;
        DROP POLICY IF EXISTS "Test policy for campaigns" ON public.bulk_campaigns;
        DROP POLICY IF EXISTS "Users can access own campaigns via function" ON public.bulk_campaigns;
        
        -- Criar políticas simples usando auth.uid() diretamente
        CREATE POLICY "Users can view own campaigns" ON public.bulk_campaigns FOR SELECT USING (user_id = auth.uid());
        CREATE POLICY "Users can insert own campaigns" ON public.bulk_campaigns FOR INSERT WITH CHECK (user_id = auth.uid());
        CREATE POLICY "Users can update own campaigns" ON public.bulk_campaigns FOR UPDATE USING (user_id = auth.uid());
        CREATE POLICY "Users can delete own campaigns" ON public.bulk_campaigns FOR DELETE USING (user_id = auth.uid());
        
        RAISE NOTICE 'Políticas simples criadas para bulk_campaigns';
        
    END IF;
END $$;

-- =====================================================
-- CORREÇÃO 2: Políticas simples para campaign_leads
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_leads') THEN
        
        -- Remover todas as políticas existentes
        DROP POLICY IF EXISTS "Users can view leads from own campaigns" ON public.campaign_leads;
        DROP POLICY IF EXISTS "Users can insert leads in own campaigns" ON public.campaign_leads;
        DROP POLICY IF EXISTS "Users can update leads in own campaigns" ON public.campaign_leads;
        DROP POLICY IF EXISTS "Users can delete leads from own campaigns" ON public.campaign_leads;
        
        -- Criar políticas simples
        CREATE POLICY "Users can view leads from own campaigns" ON public.campaign_leads FOR SELECT USING (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = auth.uid()));
        CREATE POLICY "Users can insert leads in own campaigns" ON public.campaign_leads FOR INSERT WITH CHECK (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = auth.uid()));
        CREATE POLICY "Users can update leads in own campaigns" ON public.campaign_leads FOR UPDATE USING (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = auth.uid()));
        CREATE POLICY "Users can delete leads from own campaigns" ON public.campaign_leads FOR DELETE USING (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = auth.uid()));
        
        RAISE NOTICE 'Políticas simples criadas para campaign_leads';
        
    END IF;
END $$;

-- =====================================================
-- CORREÇÃO 3: Garantir que RLS está habilitado
-- =====================================================
DO $$
DECLARE
    tbl_name text;
BEGIN
    FOR tbl_name IN SELECT unnest(ARRAY['bulk_campaigns', 'campaign_leads', 'campaign_unique_leads', 'campaign_lists']) LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl_name) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl_name);
            RAISE NOTICE 'RLS habilitado para %', tbl_name;
        END IF;
    END LOOP;
END $$;

-- =====================================================
-- CORREÇÃO 4: Criar índices para melhor performance
-- =====================================================
DO $$
BEGIN
    -- Índices para bulk_campaigns
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bulk_campaigns') THEN
        CREATE INDEX IF NOT EXISTS idx_bulk_campaigns_user_id ON public.bulk_campaigns(user_id);
        CREATE INDEX IF NOT EXISTS idx_bulk_campaigns_status ON public.bulk_campaigns(status);
        CREATE INDEX IF NOT EXISTS idx_bulk_campaigns_created_at ON public.bulk_campaigns(created_at DESC);
        RAISE NOTICE 'Índices criados para bulk_campaigns';
    END IF;
    
    -- Índices para campaign_leads
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_leads') THEN
        CREATE INDEX IF NOT EXISTS idx_campaign_leads_campaign_id ON public.campaign_leads(campaign_id);
        CREATE INDEX IF NOT EXISTS idx_campaign_leads_added_at ON public.campaign_leads(added_at DESC);
        RAISE NOTICE 'Índices criados para campaign_leads';
    END IF;
END $$;

-- =====================================================
-- CORREÇÃO 5: Recriar views simples
-- =====================================================
DO $$
BEGIN
    -- Recriar campaign_leads_view
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
    
    -- Recriar campaign_metrics_summary
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
-- TESTE SIMPLES
-- =====================================================
DO $$
DECLARE
    record_count integer;
BEGIN
    -- Testar se conseguimos acessar as campanhas
    BEGIN
        SELECT COUNT(*) INTO record_count FROM bulk_campaigns;
        RAISE NOTICE 'Total de campanhas no sistema: %', record_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'ERRO ao acessar bulk_campaigns: %', SQLERRM;
    END;
    
    -- Testar se conseguimos acessar campaign_leads
    BEGIN
        SELECT COUNT(*) INTO record_count FROM campaign_leads;
        RAISE NOTICE 'Total de leads no sistema: %', record_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'ERRO ao acessar campaign_leads: %', SQLERRM;
    END;
END $$;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
-- Mostrar políticas ativas
SELECT 
    'POLÍTICAS ATIVAS' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('bulk_campaigns', 'campaign_leads')
ORDER BY tablename, policyname;

-- Mostrar status RLS
SELECT 
    'STATUS RLS' as categoria,
    tablename as tabela,
    CASE 
        WHEN rowsecurity THEN 'HABILITADO'
        ELSE 'DESABILITADO'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('bulk_campaigns', 'campaign_leads', 'campaign_unique_leads', 'campaign_lists')
ORDER BY tablename;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'CORREÇÃO SIMPLES CONCLUÍDA' as status,
    'Políticas simples e RLS habilitado' as mensagem,
    'Teste o acesso às campanhas na página de disparador' as proximo_passo;









