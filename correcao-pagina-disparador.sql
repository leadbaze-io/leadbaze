-- =====================================================
-- CORREÇÃO ESPECÍFICA - PÁGINA DISPARADOR
-- =====================================================
-- Este script corrige problemas específicos que podem estar
-- impedindo as campanhas de aparecer na página de disparador
-- =====================================================

-- =====================================================
-- CORREÇÃO 1: Remover política de teste e criar políticas corretas
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bulk_campaigns') THEN
        
        -- Remover política de teste
        DROP POLICY IF EXISTS "Test policy for campaigns" ON public.bulk_campaigns;
        
        -- Remover todas as políticas existentes
        DROP POLICY IF EXISTS "Users can view own campaigns" ON public.bulk_campaigns;
        DROP POLICY IF EXISTS "Users can insert own campaigns" ON public.bulk_campaigns;
        DROP POLICY IF EXISTS "Users can update own campaigns" ON public.bulk_campaigns;
        DROP POLICY IF EXISTS "Users can delete own campaigns" ON public.bulk_campaigns;
        
        -- Criar políticas usando (select auth.uid()) para melhor performance
        CREATE POLICY "Users can view own campaigns" ON public.bulk_campaigns FOR SELECT USING (user_id = (select auth.uid()));
        CREATE POLICY "Users can insert own campaigns" ON public.bulk_campaigns FOR INSERT WITH CHECK (user_id = (select auth.uid()));
        CREATE POLICY "Users can update own campaigns" ON public.bulk_campaigns FOR UPDATE USING (user_id = (select auth.uid()));
        CREATE POLICY "Users can delete own campaigns" ON public.bulk_campaigns FOR DELETE USING (user_id = (select auth.uid()));
        
        RAISE NOTICE 'Políticas otimizadas criadas para bulk_campaigns';
        
    END IF;
END $$;

-- =====================================================
-- CORREÇÃO 2: Corrigir políticas de campaign_leads
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_leads') THEN
        
        -- Remover todas as políticas existentes
        DROP POLICY IF EXISTS "Users can view leads from own campaigns" ON public.campaign_leads;
        DROP POLICY IF EXISTS "Users can insert leads in own campaigns" ON public.campaign_leads;
        DROP POLICY IF EXISTS "Users can update leads in own campaigns" ON public.campaign_leads;
        DROP POLICY IF EXISTS "Users can delete leads from own campaigns" ON public.campaign_leads;
        
        -- Criar políticas otimizadas
        CREATE POLICY "Users can view leads from own campaigns" ON public.campaign_leads FOR SELECT USING (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = (select auth.uid())));
        CREATE POLICY "Users can insert leads in own campaigns" ON public.campaign_leads FOR INSERT WITH CHECK (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = (select auth.uid())));
        CREATE POLICY "Users can update leads in own campaigns" ON public.campaign_leads FOR UPDATE USING (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = (select auth.uid())));
        CREATE POLICY "Users can delete leads from own campaigns" ON public.campaign_leads FOR DELETE USING (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = (select auth.uid())));
        
        RAISE NOTICE 'Políticas otimizadas criadas para campaign_leads';
        
    END IF;
END $$;

-- =====================================================
-- CORREÇÃO 3: Recriar views com políticas otimizadas
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
        AND bc.user_id = (select auth.uid())
    );
    RAISE NOTICE 'View campaign_leads_view recriada com políticas otimizadas';
    
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
    WHERE bc.user_id = (select auth.uid())
    GROUP BY bc.id, bc.name, bc.user_id, bc.status;
    RAISE NOTICE 'View campaign_metrics_summary recriada com políticas otimizadas';
END $$;

-- =====================================================
-- CORREÇÃO 4: Criar função auxiliar para verificar acesso
-- =====================================================
CREATE OR REPLACE FUNCTION can_access_campaign(campaign_id_param uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM bulk_campaigns 
        WHERE id = campaign_id_param 
        AND user_id = (select auth.uid())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CORREÇÃO 5: Criar política alternativa usando a função
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bulk_campaigns') THEN
        
        -- Criar política alternativa usando a função
        DROP POLICY IF EXISTS "Users can access own campaigns via function" ON public.bulk_campaigns;
        CREATE POLICY "Users can access own campaigns via function" ON public.bulk_campaigns FOR ALL USING (can_access_campaign(id));
        
        RAISE NOTICE 'Política alternativa criada usando função';
        
    END IF;
END $$;

-- =====================================================
-- CORREÇÃO 6: Garantir que RLS está habilitado
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
-- CORREÇÃO 7: Criar índices para melhor performance
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
-- TESTE FINAL
-- =====================================================
DO $$
DECLARE
    record_count integer;
    user_id_test uuid;
BEGIN
    -- Obter um user_id de teste
    SELECT id INTO user_id_test FROM auth.users LIMIT 1;
    
    IF user_id_test IS NOT NULL THEN
        RAISE NOTICE 'Testando acesso com user_id: %', user_id_test;
        
        -- Simular auth.uid()
        PERFORM set_config('request.jwt.claims', '{"sub":"' || user_id_test || '"}', true);
        
        -- Testar acesso às campanhas
        BEGIN
            SELECT COUNT(*) INTO record_count FROM bulk_campaigns WHERE user_id = (select auth.uid());
            RAISE NOTICE 'Campanhas acessíveis: %', record_count;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'ERRO ao acessar campanhas: %', SQLERRM;
        END;
        
        -- Testar função auxiliar
        BEGIN
            SELECT COUNT(*) INTO record_count FROM bulk_campaigns WHERE can_access_campaign(id);
            RAISE NOTICE 'Campanhas acessíveis via função: %', record_count;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'ERRO ao testar função: %', SQLERRM;
        END;
    END IF;
END $$;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
-- Mostrar todas as políticas ativas
SELECT 
    'POLÍTICAS ATIVAS' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    qual as condicao
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('bulk_campaigns', 'campaign_leads')
ORDER BY tablename, policyname;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'CORREÇÃO DISPARADOR CONCLUÍDA' as status,
    'Políticas otimizadas e função auxiliar criadas' as mensagem,
    'Teste o acesso às campanhas na página de disparador' as proximo_passo;
