-- =====================================================
-- CORREÇÃO RÁPIDA - CAMPAIGN_LISTS
-- =====================================================
-- Este script resolve rapidamente o problema da tabela
-- campaign_lists que está causando erro 403
-- =====================================================

-- =====================================================
-- CORREÇÃO 1: Criar tabela campaign_lists
-- =====================================================
CREATE TABLE IF NOT EXISTS public.campaign_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL,
    list_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- CORREÇÃO 2: Habilitar RLS
-- =====================================================
ALTER TABLE public.campaign_lists ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CORREÇÃO 3: Remover políticas existentes
-- =====================================================
DROP POLICY IF EXISTS "Users can view own campaign_lists" ON public.campaign_lists;
DROP POLICY IF EXISTS "Users can insert own campaign_lists" ON public.campaign_lists;
DROP POLICY IF EXISTS "Users can update own campaign_lists" ON public.campaign_lists;
DROP POLICY IF EXISTS "Users can delete own campaign_lists" ON public.campaign_lists;

-- =====================================================
-- CORREÇÃO 4: Criar políticas RLS
-- =====================================================
CREATE POLICY "Users can view own campaign_lists" ON public.campaign_lists 
    FOR SELECT USING (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own campaign_lists" ON public.campaign_lists 
    FOR INSERT WITH CHECK (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own campaign_lists" ON public.campaign_lists 
    FOR UPDATE USING (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid())) 
    WITH CHECK (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own campaign_lists" ON public.campaign_lists 
    FOR DELETE USING (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid()));

-- =====================================================
-- CORREÇÃO 5: Criar índices
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_campaign_lists_campaign_id ON public.campaign_lists(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_lists_list_id ON public.campaign_lists(list_id);
CREATE INDEX IF NOT EXISTS idx_campaign_lists_status ON public.campaign_lists(status);

-- =====================================================
-- VERIFICAÇÃO: Status final
-- =====================================================
SELECT 
    'TABELA CRIADA' as status,
    'campaign_lists' as tabela,
    'RLS habilitado e políticas criadas' as mensagem;


















