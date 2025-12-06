-- =====================================================
-- CORREÇÃO SIMPLES MISMATCH FRONTEND/BACKEND
-- =====================================================
-- Este script resolve o problema do frontend tentando
-- acessar 'campaigns' quando a tabela se chama 'bulk_campaigns'
-- =====================================================

-- =====================================================
-- VERIFICAÇÃO 1: Estrutura da tabela bulk_campaigns
-- =====================================================
SELECT 
    'ESTRUTURA BULK_CAMPAIGNS' as categoria,
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'bulk_campaigns'
ORDER BY ordinal_position;

-- =====================================================
-- VERIFICAÇÃO 2: Verificar se tabela campaigns existe
-- =====================================================
SELECT 
    'VERIFICAÇÃO TABELAS' as categoria,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaigns') THEN 'TABELA campaigns EXISTE'
        ELSE 'TABELA campaigns NÃO EXISTE'
    END as status_campaigns;

-- =====================================================
-- CORREÇÃO 1: Criar tabela campaigns simples
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaigns') THEN
        -- Criar tabela campaigns com estrutura básica
        CREATE TABLE public.campaigns (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            name VARCHAR(255) NOT NULL,
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'paused', 'completed', 'cancelled')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
        );
        
        RAISE NOTICE 'Tabela campaigns criada com estrutura básica';
    ELSE
        RAISE NOTICE 'Tabela campaigns já existe';
    END IF;
END $$;

-- =====================================================
-- CORREÇÃO 2: Habilitar RLS e criar políticas
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
-- CORREÇÃO 3: Criar índices básicos
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON public.campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);

-- =====================================================
-- CORREÇÃO 4: Copiar dados básicos
-- =====================================================
DO $$
DECLARE
    record_count integer;
BEGIN
    -- Contar registros em bulk_campaigns
    SELECT COUNT(*) INTO record_count FROM bulk_campaigns;
    RAISE NOTICE 'Registros em bulk_campaigns: %', record_count;
    
    -- Copiar dados básicos se houver registros
    IF record_count > 0 THEN
        INSERT INTO campaigns (id, user_id, name, status, created_at, updated_at)
        SELECT id, user_id, name, COALESCE(status, 'active'), created_at, updated_at
        FROM bulk_campaigns
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Dados básicos copiados de bulk_campaigns para campaigns';
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
    'CORREÇÃO SIMPLES CONCLUÍDA' as status,
    'Tabela campaigns criada com estrutura básica' as mensagem,
    'Teste a criação de campanhas na aplicação' as proximo_passo;






















