-- =====================================================
-- CORREÇÃO MISMATCH FRONTEND/BACKEND - CAMPANHAS
-- =====================================================
-- Este script resolve o problema do frontend tentando
-- acessar 'campaigns' quando a tabela se chama 'bulk_campaigns'
-- =====================================================

-- =====================================================
-- VERIFICAÇÃO 1: Verificar se tabela campaigns existe
-- =====================================================
SELECT 
    'VERIFICAÇÃO TABELAS' as categoria,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaigns') THEN 'TABELA campaigns EXISTE'
        ELSE 'TABELA campaigns NÃO EXISTE'
    END as status_campaigns,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bulk_campaigns') THEN 'TABELA bulk_campaigns EXISTE'
        ELSE 'TABELA bulk_campaigns NÃO EXISTE'
    END as status_bulk_campaigns;

-- =====================================================
-- CORREÇÃO 1: Criar tabela campaigns se não existir
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaigns') THEN
        -- Criar tabela campaigns baseada em bulk_campaigns
        CREATE TABLE public.campaigns (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            leads JSONB NOT NULL DEFAULT '[]'::jsonb,
            total_leads INTEGER NOT NULL DEFAULT 0,
            tags TEXT[] DEFAULT '{}',
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'paused', 'completed', 'cancelled')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
        );
        
        RAISE NOTICE 'Tabela campaigns criada';
    ELSE
        RAISE NOTICE 'Tabela campaigns já existe';
    END IF;
END $$;

-- =====================================================
-- CORREÇÃO 2: Habilitar RLS e criar políticas para campaigns
-- =====================================================
DO $$
BEGIN
    -- Habilitar RLS
    ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS habilitado para campaigns';
    
    -- Remover políticas existentes
    DROP POLICY IF EXISTS "Users can view own campaigns" ON public.campaigns;
    DROP POLICY IF EXISTS "Users can insert own campaigns" ON public.campaigns;
    DROP POLICY IF EXISTS "Users can update own campaigns" ON public.campaigns;
    DROP POLICY IF EXISTS "Users can delete own campaigns" ON public.campaigns;
    
    -- Criar políticas RLS
    CREATE POLICY "Users can view own campaigns" ON public.campaigns 
        FOR SELECT USING (user_id = auth.uid());
    
    CREATE POLICY "Users can insert own campaigns" ON public.campaigns 
        FOR INSERT WITH CHECK (user_id = auth.uid());
    
    CREATE POLICY "Users can update own campaigns" ON public.campaigns 
        FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
    
    CREATE POLICY "Users can delete own campaigns" ON public.campaigns 
        FOR DELETE USING (user_id = auth.uid());
    
    RAISE NOTICE 'Políticas RLS criadas para campaigns';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao criar políticas: %', SQLERRM;
END $$;

-- =====================================================
-- CORREÇÃO 3: Criar índices para campaigns
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON public.campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_name ON public.campaigns(name);

-- =====================================================
-- CORREÇÃO 4: Verificar estrutura e copiar dados
-- =====================================================
DO $$
DECLARE
    record_count integer;
    has_description boolean;
    has_leads boolean;
    has_tags boolean;
BEGIN
    -- Verificar se colunas existem
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'bulk_campaigns' AND column_name = 'description'
    ) INTO has_description;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'bulk_campaigns' AND column_name = 'leads'
    ) INTO has_leads;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'bulk_campaigns' AND column_name = 'tags'
    ) INTO has_tags;
    
    RAISE NOTICE 'Estrutura bulk_campaigns - description: %, leads: %, tags: %', has_description, has_leads, has_tags;
    
    -- Contar registros em bulk_campaigns
    SELECT COUNT(*) INTO record_count FROM bulk_campaigns;
    RAISE NOTICE 'Registros em bulk_campaigns: %', record_count;
    
    -- Copiar dados se houver registros
    IF record_count > 0 THEN
        -- Copiar apenas colunas que existem
        IF has_description AND has_leads AND has_tags THEN
            INSERT INTO campaigns (id, user_id, name, description, leads, total_leads, tags, status, created_at, updated_at)
            SELECT id, user_id, name, description, leads, total_leads, tags, status, created_at, updated_at
            FROM bulk_campaigns
            ON CONFLICT (id) DO NOTHING;
        ELSIF has_leads AND has_tags THEN
            INSERT INTO campaigns (id, user_id, name, leads, total_leads, tags, status, created_at, updated_at)
            SELECT id, user_id, name, leads, total_leads, tags, status, created_at, updated_at
            FROM bulk_campaigns
            ON CONFLICT (id) DO NOTHING;
        ELSIF has_leads THEN
            INSERT INTO campaigns (id, user_id, name, leads, total_leads, status, created_at, updated_at)
            SELECT id, user_id, name, leads, total_leads, status, created_at, updated_at
            FROM bulk_campaigns
            ON CONFLICT (id) DO NOTHING;
        ELSE
            INSERT INTO campaigns (id, user_id, name, status, created_at, updated_at)
            SELECT id, user_id, name, status, created_at, updated_at
            FROM bulk_campaigns
            ON CONFLICT (id) DO NOTHING;
        END IF;
        
        RAISE NOTICE 'Dados copiados de bulk_campaigns para campaigns';
    ELSE
        RAISE NOTICE 'Nenhum dado para copiar';
    END IF;
END $$;

-- =====================================================
-- VERIFICAÇÃO FINAL: Status das tabelas
-- =====================================================
SELECT 
    'STATUS FINAL' as categoria,
    'campaigns' as tabela,
    COUNT(*) as registros
FROM campaigns
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
    'CORREÇÃO MISMATCH CONCLUÍDA' as status,
    'Tabela campaigns criada e configurada' as mensagem,
    'Teste a criação de campanhas na aplicação' as proximo_passo;
