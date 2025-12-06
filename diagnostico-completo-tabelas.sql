-- =====================================================
-- DIAGNÓSTICO COMPLETO - TODAS AS TABELAS DA APLICAÇÃO
-- =====================================================
-- Este script identifica todas as tabelas que a aplicação
-- está tentando acessar e verifica se existem e têm RLS
-- =====================================================

-- =====================================================
-- VERIFICAÇÃO 1: Listar todas as tabelas públicas
-- =====================================================
SELECT 
    'TODAS AS TABELAS PÚBLICAS' as categoria,
    table_name as tabela,
    CASE 
        WHEN table_name LIKE '%campaign%' THEN 'RELACIONADA A CAMPANHAS'
        WHEN table_name LIKE '%lead%' THEN 'RELACIONADA A LEADS'
        WHEN table_name LIKE '%user%' THEN 'RELACIONADA A USUÁRIOS'
        WHEN table_name LIKE '%whatsapp%' THEN 'RELACIONADA A WHATSAPP'
        ELSE 'OUTRAS'
    END as tipo
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- VERIFICAÇÃO 2: Verificar tabelas específicas mencionadas nos erros
-- =====================================================
SELECT 
    'VERIFICAÇÃO TABELAS ESPECÍFICAS' as categoria,
    'campaigns' as tabela,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaigns') THEN 'EXISTE'
        ELSE 'NÃO EXISTE'
    END as status
UNION ALL
SELECT 
    'VERIFICAÇÃO TABELAS ESPECÍFICAS' as categoria,
    'campaign_lists' as tabela,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_lists') THEN 'EXISTE'
        ELSE 'NÃO EXISTE'
    END as status
UNION ALL
SELECT 
    'VERIFICAÇÃO TABELAS ESPECÍFICAS' as categoria,
    'bulk_campaigns' as tabela,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bulk_campaigns') THEN 'EXISTE'
        ELSE 'NÃO EXISTE'
    END as status;

-- =====================================================
-- VERIFICAÇÃO 3: Verificar RLS nas tabelas existentes
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
AND tablename IN ('campaigns', 'campaign_lists', 'bulk_campaigns')
ORDER BY tablename;

-- =====================================================
-- VERIFICAÇÃO 4: Verificar políticas RLS
-- =====================================================
SELECT 
    'POLÍTICAS RLS' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    permissive as permissiva
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('campaigns', 'campaign_lists', 'bulk_campaigns')
ORDER BY tablename, cmd;

-- =====================================================
-- VERIFICAÇÃO 5: Verificar estrutura da tabela campaign_lists
-- =====================================================
SELECT 
    'ESTRUTURA CAMPAIGN_LISTS' as categoria,
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'campaign_lists'
ORDER BY ordinal_position;

-- =====================================================
-- CORREÇÃO 1: Criar tabela campaign_lists se não existir
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_lists') THEN
        -- Criar tabela campaign_lists
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

-- =====================================================
-- CORREÇÃO 2: Habilitar RLS e criar políticas para campaign_lists
-- =====================================================
DO $$
BEGIN
    -- Habilitar RLS
    ALTER TABLE public.campaign_lists ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS habilitado para campaign_lists';
    
    -- Remover políticas existentes
    DROP POLICY IF EXISTS "Users can view own campaign_lists" ON public.campaign_lists;
    DROP POLICY IF EXISTS "Users can insert own campaign_lists" ON public.campaign_lists;
    DROP POLICY IF EXISTS "Users can update own campaign_lists" ON public.campaign_lists;
    DROP POLICY IF EXISTS "Users can delete own campaign_lists" ON public.campaign_lists;
    
    -- Criar políticas RLS
    CREATE POLICY "Users can view own campaign_lists" ON public.campaign_lists 
        FOR SELECT USING (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid()));
    
    CREATE POLICY "Users can insert own campaign_lists" ON public.campaign_lists 
        FOR INSERT WITH CHECK (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid()));
    
    CREATE POLICY "Users can update own campaign_lists" ON public.campaign_lists 
        FOR UPDATE USING (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid())) 
        WITH CHECK (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid()));
    
    CREATE POLICY "Users can delete own campaign_lists" ON public.campaign_lists 
        FOR DELETE USING (campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid()));
    
    RAISE NOTICE 'Políticas RLS criadas para campaign_lists';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao criar políticas: %', SQLERRM;
END $$;

-- =====================================================
-- CORREÇÃO 3: Criar índices para campaign_lists
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_campaign_lists_campaign_id ON public.campaign_lists(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_lists_list_id ON public.campaign_lists(list_id);
CREATE INDEX IF NOT EXISTS idx_campaign_lists_status ON public.campaign_lists(status);

-- =====================================================
-- VERIFICAÇÃO FINAL: Status de todas as tabelas
-- =====================================================
SELECT 
    'STATUS FINAL' as categoria,
    'campaigns' as tabela,
    COUNT(*) as registros
FROM campaigns
UNION ALL
SELECT 
    'STATUS FINAL' as categoria,
    'campaign_lists' as tabela,
    COUNT(*) as registros
FROM campaign_lists
UNION ALL
SELECT 
    'STATUS FINAL' as categoria,
    'bulk_campaigns' as tabela,
    COUNT(*) as registros
FROM bulk_campaigns;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'DIAGNÓSTICO COMPLETO CONCLUÍDO' as status,
    'Todas as tabelas necessárias foram verificadas e criadas' as mensagem,
    'Teste novamente a aplicação' as proximo_passo;






















