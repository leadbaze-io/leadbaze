-- =====================================================
-- REVERSÃO CUIDADOSA - APENAS CAMPANHAS
-- =====================================================
-- Este script reverte apenas as políticas das campanhas
-- para o estado original, mantendo os perfis funcionando
-- =====================================================

-- =====================================================
-- REVERSÃO 1: Remover políticas de teste das campanhas
-- =====================================================
DROP POLICY IF EXISTS "Allow all campaigns" ON public.bulk_campaigns;
DROP POLICY IF EXISTS "Allow all leads" ON public.campaign_leads;
DROP POLICY IF EXISTS "Simple campaign access" ON public.bulk_campaigns;
DROP POLICY IF EXISTS "Simple leads access" ON public.campaign_leads;
DROP POLICY IF EXISTS "Test policy for campaigns" ON public.bulk_campaigns;

-- =====================================================
-- REVERSÃO 2: Restaurar políticas originais das campanhas
-- =====================================================
-- Políticas originais para bulk_campaigns
CREATE POLICY "Users can view own campaigns" ON public.bulk_campaigns FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own campaigns" ON public.bulk_campaigns FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own campaigns" ON public.bulk_campaigns FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own campaigns" ON public.bulk_campaigns FOR DELETE USING (user_id = auth.uid());

-- Políticas originais para campaign_leads
CREATE POLICY "Users can view leads from own campaigns" ON public.campaign_leads FOR SELECT USING (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert leads in own campaigns" ON public.campaign_leads FOR INSERT WITH CHECK (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = auth.uid()));
CREATE POLICY "Users can update leads in own campaigns" ON public.campaign_leads FOR UPDATE USING (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete leads from own campaigns" ON public.campaign_leads FOR DELETE USING (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = auth.uid()));

-- =====================================================
-- REVERSÃO 3: Restaurar views originais das campanhas
-- =====================================================
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

-- =====================================================
-- REVERSÃO 4: Garantir que RLS está habilitado nas campanhas
-- =====================================================
ALTER TABLE public.bulk_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_unique_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_lists ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICAÇÃO: Mostrar políticas ativas das campanhas
-- =====================================================
SELECT 
    'POLÍTICAS CAMPANHAS RESTAURADAS' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('bulk_campaigns', 'campaign_leads')
ORDER BY tablename, policyname;

-- =====================================================
-- VERIFICAÇÃO: Mostrar que perfis ainda funcionam
-- =====================================================
SELECT 
    'PERFIS AINDA FUNCIONAM' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'user_profiles'
ORDER BY policyname;

-- =====================================================
-- VERIFICAÇÃO: Status RLS das tabelas principais
-- =====================================================
SELECT 
    'STATUS RLS' as categoria,
    tablename as tabela,
    CASE 
        WHEN rowsecurity THEN 'RLS HABILITADO'
        ELSE 'RLS DESABILITADO'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('bulk_campaigns', 'campaign_leads', 'user_profiles', 'user_preferences')
ORDER BY tablename;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'REVERSÃO CUIDADOSA CONCLUÍDA' as status,
    'Políticas originais das campanhas restauradas' as mensagem,
    'Perfis mantidos funcionando' as observacao,
    'Teste as campanhas agora' as proximo_passo;






















