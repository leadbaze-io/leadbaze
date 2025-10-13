-- =====================================================
-- CORREÇÃO COMPLETA - TODAS AS TABELAS DE CAMPANHAS
-- =====================================================
-- Este script cria todas as tabelas relacionadas a campanhas
-- que a aplicação está tentando acessar
-- =====================================================

-- =====================================================
-- CORREÇÃO 1: Criar tabela campaign_unique_leads
-- =====================================================
CREATE TABLE IF NOT EXISTS public.campaign_unique_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL,
    lead_email VARCHAR(255),
    lead_company VARCHAR(255),
    lead_position VARCHAR(255),
    phone_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- CORREÇÃO 2: Habilitar RLS para campaign_unique_leads
-- =====================================================
ALTER TABLE public.campaign_unique_leads ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CORREÇÃO 3: Remover políticas existentes
-- =====================================================
DROP POLICY IF EXISTS "Users can view own campaign_unique_leads" ON public.campaign_unique_leads;
DROP POLICY IF EXISTS "Users can insert own campaign_unique_leads" ON public.campaign_unique_leads;
DROP POLICY IF EXISTS "Users can update own campaign_unique_leads" ON public.campaign_unique_leads;
DROP POLICY IF EXISTS "Users can delete own campaign_unique_leads" ON public.campaign_unique_leads;

-- =====================================================
-- CORREÇÃO 4: Criar políticas RLS para campaign_unique_leads
-- =====================================================
CREATE POLICY "Users can view own campaign_unique_leads" ON public.campaign_unique_leads 
    FOR SELECT USING (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own campaign_unique_leads" ON public.campaign_unique_leads 
    FOR INSERT WITH CHECK (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own campaign_unique_leads" ON public.campaign_unique_leads 
    FOR UPDATE USING (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid())) 
    WITH CHECK (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own campaign_unique_leads" ON public.campaign_unique_leads 
    FOR DELETE USING (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid()));

-- =====================================================
-- CORREÇÃO 5: Criar índices para campaign_unique_leads
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_campaign_unique_leads_campaign_id ON public.campaign_unique_leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_unique_leads_lead_email ON public.campaign_unique_leads(lead_email);
CREATE INDEX IF NOT EXISTS idx_campaign_unique_leads_phone_hash ON public.campaign_unique_leads(phone_hash);

-- =====================================================
-- VERIFICAÇÃO: Status de todas as tabelas de campanhas
-- =====================================================
SELECT 
    'TABELAS CRIADAS' as status,
    'campaigns' as tabela,
    COUNT(*) as registros
FROM campaigns
UNION ALL
SELECT 
    'TABELAS CRIADAS' as status,
    'campaign_lists' as tabela,
    COUNT(*) as registros
FROM campaign_lists
UNION ALL
SELECT 
    'TABELAS CRIADAS' as status,
    'campaign_unique_leads' as tabela,
    COUNT(*) as registros
FROM campaign_unique_leads;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'CORREÇÃO COMPLETA CONCLUÍDA' as status,
    'Todas as tabelas de campanhas foram criadas' as mensagem,
    'Teste novamente a adição de listas nas campanhas' as proximo_passo;
