-- =====================================================
-- VERIFICAÇÃO E CRIAÇÃO COMPLETA - TODAS AS TABELAS
-- =====================================================
-- Este script verifica TODAS as tabelas que a aplicação
-- pode estar tentando acessar e cria as que estão faltando
-- =====================================================

-- =====================================================
-- VERIFICAÇÃO 1: Listar TODAS as tabelas públicas existentes
-- =====================================================
SELECT 
    'TABELAS EXISTENTES' as categoria,
    table_name as tabela,
    CASE 
        WHEN table_name LIKE '%campaign%' THEN 'CAMPANHAS'
        WHEN table_name LIKE '%lead%' THEN 'LEADS'
        WHEN table_name LIKE '%user%' THEN 'USUÁRIOS'
        WHEN table_name LIKE '%whatsapp%' THEN 'WHATSAPP'
        WHEN table_name LIKE '%contact%' THEN 'CONTATOS'
        WHEN table_name LIKE '%message%' THEN 'MENSAGENS'
        WHEN table_name LIKE '%template%' THEN 'TEMPLATES'
        WHEN table_name LIKE '%analytics%' THEN 'ANALYTICS'
        WHEN table_name LIKE '%system%' THEN 'SISTEMA'
        WHEN table_name LIKE '%blog%' THEN 'BLOG'
        WHEN table_name LIKE '%subscription%' THEN 'ASSINATURAS'
        WHEN table_name LIKE '%webhook%' THEN 'WEBHOOKS'
        WHEN table_name LIKE '%support%' THEN 'SUPORTE'
        ELSE 'OUTRAS'
    END as tipo
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- VERIFICAÇÃO 2: Identificar tabelas que podem estar faltando
-- =====================================================
-- Baseado nos erros que vimos, estas são as tabelas que a aplicação está tentando acessar:
-- campaigns, campaign_lists, campaign_unique_leads, campaign_leads

-- =====================================================
-- CORREÇÃO 1: Criar todas as tabelas de campanhas necessárias
-- =====================================================

-- 1.1: campaigns (já existe, mas vamos verificar)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_schema = 'public' AND t.table_name = 'campaigns') THEN
        CREATE TABLE public.campaigns (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            name VARCHAR(255) NOT NULL,
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'paused', 'completed', 'cancelled')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );
        RAISE NOTICE 'Tabela campaigns criada';
    ELSE
        RAISE NOTICE 'Tabela campaigns já existe';
    END IF;
END $$;

-- 1.2: campaign_lists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_schema = 'public' AND t.table_name = 'campaign_lists') THEN
        CREATE TABLE public.campaign_lists (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            campaign_id UUID NOT NULL,
            list_id UUID NOT NULL,
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed', 'cancelled')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );
        RAISE NOTICE 'Tabela campaign_lists criada';
    ELSE
        RAISE NOTICE 'Tabela campaign_lists já existe';
    END IF;
END $$;

-- 1.3: campaign_unique_leads
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_schema = 'public' AND t.table_name = 'campaign_unique_leads') THEN
        CREATE TABLE public.campaign_unique_leads (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            campaign_id UUID NOT NULL,
            lead_email VARCHAR(255),
            lead_company VARCHAR(255),
            lead_position VARCHAR(255),
            phone_hash VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );
        RAISE NOTICE 'Tabela campaign_unique_leads criada';
    ELSE
        RAISE NOTICE 'Tabela campaign_unique_leads já existe';
    END IF;
END $$;

-- 1.4: campaign_leads (pode ser necessária)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_schema = 'public' AND t.table_name = 'campaign_leads') THEN
        CREATE TABLE public.campaign_leads (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            campaign_id UUID NOT NULL,
            lead_id UUID NOT NULL,
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed', 'cancelled')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );
        RAISE NOTICE 'Tabela campaign_leads criada';
    ELSE
        RAISE NOTICE 'Tabela campaign_leads já existe';
    END IF;
END $$;

-- =====================================================
-- CORREÇÃO 2: Habilitar RLS em todas as tabelas de campanhas
-- =====================================================
DO $$
DECLARE
    tbl_name text;
BEGIN
    FOR tbl_name IN SELECT unnest(ARRAY['campaigns', 'campaign_lists', 'campaign_unique_leads', 'campaign_leads']) LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_schema = 'public' AND t.table_name = tbl_name) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl_name);
            RAISE NOTICE 'RLS habilitado para %', tbl_name;
        END IF;
    END LOOP;
END $$;

-- =====================================================
-- CORREÇÃO 3: Criar políticas RLS para todas as tabelas
-- =====================================================

-- 3.1: Políticas para campaigns
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_schema = 'public' AND t.table_name = 'campaigns') THEN
        DROP POLICY IF EXISTS "Users can view own campaigns" ON public.campaigns;
        DROP POLICY IF EXISTS "Users can insert own campaigns" ON public.campaigns;
        DROP POLICY IF EXISTS "Users can update own campaigns" ON public.campaigns;
        DROP POLICY IF EXISTS "Users can delete own campaigns" ON public.campaigns;
        
        CREATE POLICY "Users can view own campaigns" ON public.campaigns FOR SELECT USING (user_id = auth.uid());
        CREATE POLICY "Users can insert own campaigns" ON public.campaigns FOR INSERT WITH CHECK (user_id = auth.uid());
        CREATE POLICY "Users can update own campaigns" ON public.campaigns FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
        CREATE POLICY "Users can delete own campaigns" ON public.campaigns FOR DELETE USING (user_id = auth.uid());
        
        RAISE NOTICE 'Políticas RLS criadas para campaigns';
    END IF;
END $$;

-- 3.2: Políticas para campaign_lists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_schema = 'public' AND t.table_name = 'campaign_lists') THEN
        DROP POLICY IF EXISTS "Users can view own campaign_lists" ON public.campaign_lists;
        DROP POLICY IF EXISTS "Users can insert own campaign_lists" ON public.campaign_lists;
        DROP POLICY IF EXISTS "Users can update own campaign_lists" ON public.campaign_lists;
        DROP POLICY IF EXISTS "Users can delete own campaign_lists" ON public.campaign_lists;
        
        CREATE POLICY "Users can view own campaign_lists" ON public.campaign_lists FOR SELECT USING (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid()));
        CREATE POLICY "Users can insert own campaign_lists" ON public.campaign_lists FOR INSERT WITH CHECK (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid()));
        CREATE POLICY "Users can update own campaign_lists" ON public.campaign_lists FOR UPDATE USING (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid())) WITH CHECK (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid()));
        CREATE POLICY "Users can delete own campaign_lists" ON public.campaign_lists FOR DELETE USING (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid()));
        
        RAISE NOTICE 'Políticas RLS criadas para campaign_lists';
    END IF;
END $$;

-- 3.3: Políticas para campaign_unique_leads
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_schema = 'public' AND t.table_name = 'campaign_unique_leads') THEN
        DROP POLICY IF EXISTS "Users can view own campaign_unique_leads" ON public.campaign_unique_leads;
        DROP POLICY IF EXISTS "Users can insert own campaign_unique_leads" ON public.campaign_unique_leads;
        DROP POLICY IF EXISTS "Users can update own campaign_unique_leads" ON public.campaign_unique_leads;
        DROP POLICY IF EXISTS "Users can delete own campaign_unique_leads" ON public.campaign_unique_leads;
        
        CREATE POLICY "Users can view own campaign_unique_leads" ON public.campaign_unique_leads FOR SELECT USING (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid()));
        CREATE POLICY "Users can insert own campaign_unique_leads" ON public.campaign_unique_leads FOR INSERT WITH CHECK (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid()));
        CREATE POLICY "Users can update own campaign_unique_leads" ON public.campaign_unique_leads FOR UPDATE USING (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid())) WITH CHECK (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid()));
        CREATE POLICY "Users can delete own campaign_unique_leads" ON public.campaign_unique_leads FOR DELETE USING (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid()));
        
        RAISE NOTICE 'Políticas RLS criadas para campaign_unique_leads';
    END IF;
END $$;

-- 3.4: Políticas para campaign_leads
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_schema = 'public' AND t.table_name = 'campaign_leads') THEN
        DROP POLICY IF EXISTS "Users can view own campaign_leads" ON public.campaign_leads;
        DROP POLICY IF EXISTS "Users can insert own campaign_leads" ON public.campaign_leads;
        DROP POLICY IF EXISTS "Users can update own campaign_leads" ON public.campaign_leads;
        DROP POLICY IF EXISTS "Users can delete own campaign_leads" ON public.campaign_leads;
        
        CREATE POLICY "Users can view own campaign_leads" ON public.campaign_leads FOR SELECT USING (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid()));
        CREATE POLICY "Users can insert own campaign_leads" ON public.campaign_leads FOR INSERT WITH CHECK (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid()));
        CREATE POLICY "Users can update own campaign_leads" ON public.campaign_leads FOR UPDATE USING (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid())) WITH CHECK (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid()));
        CREATE POLICY "Users can delete own campaign_leads" ON public.campaign_leads FOR DELETE USING (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid()));
        
        RAISE NOTICE 'Políticas RLS criadas para campaign_leads';
    END IF;
END $$;

-- =====================================================
-- CORREÇÃO 4: Criar índices para todas as tabelas
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_lists_campaign_id ON public.campaign_lists(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_lists_list_id ON public.campaign_lists(list_id);
CREATE INDEX IF NOT EXISTS idx_campaign_unique_leads_campaign_id ON public.campaign_unique_leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_unique_leads_lead_email ON public.campaign_unique_leads(lead_email);
CREATE INDEX IF NOT EXISTS idx_campaign_leads_campaign_id ON public.campaign_leads(campaign_id);

-- =====================================================
-- VERIFICAÇÃO FINAL: Status de todas as tabelas
-- =====================================================
SELECT 
    'STATUS FINAL' as categoria,
    t.table_name as tabela,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables pt WHERE pt.schemaname = 'public' AND pt.tablename = t.table_name AND pt.rowsecurity) THEN 'RLS ATIVO'
        ELSE 'RLS INATIVO'
    END as rls_status,
    (SELECT COUNT(*) FROM information_schema.table_privileges tp WHERE tp.table_schema = 'public' AND tp.table_name = t.table_name) as privilegios
FROM information_schema.tables t
WHERE t.table_schema = 'public'
AND t.table_name LIKE '%campaign%'
ORDER BY t.table_name;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'VERIFICAÇÃO COMPLETA CONCLUÍDA' as status,
    'Todas as tabelas de campanhas foram verificadas e criadas' as mensagem,
    'Teste novamente todas as funcionalidades da aplicação' as proximo_passo;
