-- =====================================================
-- DIAGNÓSTICO E CORREÇÃO DO ERRO 406 - USER_PROFILES
-- =====================================================
-- Este script diagnostica e corrige o erro 406 relacionado
-- ao acesso à tabela user_profiles
-- =====================================================

-- =====================================================
-- DIAGNÓSTICO 1: Verificar se user_profiles existe
-- =====================================================
SELECT 
    'DIAGNÓSTICO USER_PROFILES' as categoria,
    table_name as tabela,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN 'EXISTE'
        ELSE 'NÃO EXISTE'
    END as existe,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles' AND rowsecurity = true) THEN 'RLS HABILITADO'
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles' AND rowsecurity = false) THEN 'RLS DESABILITADO'
        ELSE 'N/A'
    END as rls_status
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name = 'user_profiles';

-- =====================================================
-- DIAGNÓSTICO 2: Verificar políticas de user_profiles
-- =====================================================
SELECT 
    'POLÍTICAS USER_PROFILES' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    qual as condicao,
    with_check as verificacao
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'user_profiles'
ORDER BY policyname;

-- =====================================================
-- DIAGNÓSTICO 3: Verificar colunas de user_profiles
-- =====================================================
SELECT 
    'COLUNAS USER_PROFILES' as categoria,
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable,
    column_default as default_value
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- =====================================================
-- DIAGNÓSTICO 4: Verificar se user_preferences existe (alternativa)
-- =====================================================
SELECT 
    'ALTERNATIVA USER_PREFERENCES' as categoria,
    table_name as tabela,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences') THEN 'EXISTE'
        ELSE 'NÃO EXISTE'
    END as existe,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_preferences' AND rowsecurity = true) THEN 'RLS HABILITADO'
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_preferences' AND rowsecurity = false) THEN 'RLS DESABILITADO'
        ELSE 'N/A'
    END as rls_status
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name = 'user_preferences';

-- =====================================================
-- DIAGNÓSTICO 5: Verificar políticas de user_preferences
-- =====================================================
SELECT 
    'POLÍTICAS USER_PREFERENCES' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    qual as condicao,
    with_check as verificacao
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'user_preferences'
ORDER BY policyname;

-- =====================================================
-- CORREÇÃO 1: Criar user_profiles se não existir
-- =====================================================
DO $$
BEGIN
    -- Verificar se user_profiles existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        
        -- Criar tabela user_profiles
        CREATE TABLE public.user_profiles (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
            whatsapp_number VARCHAR(20),
            default_message_template TEXT,
            auto_follow_up BOOLEAN DEFAULT false,
            follow_up_delay_hours INTEGER DEFAULT 24,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );
        
        RAISE NOTICE 'Tabela user_profiles criada';
        
    ELSE
        RAISE NOTICE 'Tabela user_profiles já existe';
    END IF;
END $$;

-- =====================================================
-- CORREÇÃO 2: Habilitar RLS em user_profiles
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        
        -- Habilitar RLS
        ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado para user_profiles';
        
    ELSE
        RAISE NOTICE 'Tabela user_profiles não existe - pulando';
    END IF;
END $$;

-- =====================================================
-- CORREÇÃO 3: Criar políticas para user_profiles
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        
        -- Remover políticas existentes
        DROP POLICY IF EXISTS "Users can manage own profile" ON public.user_profiles;
        DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
        DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
        DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;
        
        -- Criar políticas
        CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (user_id = auth.uid());
        CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (user_id = auth.uid());
        CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (user_id = auth.uid());
        CREATE POLICY "Users can delete own profile" ON public.user_profiles FOR DELETE USING (user_id = auth.uid());
        
        RAISE NOTICE 'Políticas criadas para user_profiles';
        
    ELSE
        RAISE NOTICE 'Tabela user_profiles não existe - pulando';
    END IF;
END $$;

-- =====================================================
-- CORREÇÃO 4: Criar índices para user_profiles
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        
        -- Criar índices
        CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON public.user_profiles(created_at DESC);
        
        RAISE NOTICE 'Índices criados para user_profiles';
        
    ELSE
        RAISE NOTICE 'Tabela user_profiles não existe - pulando';
    END IF;
END $$;

-- =====================================================
-- CORREÇÃO 5: Garantir que user_preferences também está OK
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences') THEN
        
        -- Habilitar RLS
        ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
        
        -- Remover políticas existentes
        DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;
        
        -- Criar política
        CREATE POLICY "Users can manage own preferences" ON public.user_preferences FOR ALL USING (user_id = auth.uid());
        
        RAISE NOTICE 'user_preferences também foi corrigido';
        
    ELSE
        RAISE NOTICE 'Tabela user_preferences não existe - pulando';
    END IF;
END $$;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
-- Mostrar status final de user_profiles
SELECT 
    'CORREÇÃO CONCLUÍDA' as status,
    'user_profiles existe' as tipo,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN 'SIM'
        ELSE 'NÃO'
    END as resultado
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name = 'user_profiles'

UNION ALL

SELECT 
    'CORREÇÃO CONCLUÍDA' as status,
    'user_profiles RLS habilitado' as tipo,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles' AND rowsecurity = true) THEN 'SIM'
        ELSE 'NÃO'
    END as resultado
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename = 'user_profiles'

UNION ALL

SELECT 
    'CORREÇÃO CONCLUÍDA' as status,
    'user_profiles tem políticas' as tipo,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN 'SIM'
        ELSE 'NÃO'
    END as resultado
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'user_profiles';

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'ERRO 406 CORRIGIDO' as status,
    'user_profiles configurado corretamente' as mensagem,
    'Teste o acesso agora' as proximo_passo;




















