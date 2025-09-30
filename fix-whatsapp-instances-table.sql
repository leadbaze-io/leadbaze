-- Script para verificar e corrigir a tabela whatsapp_instances
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'whatsapp_instances'
) as table_exists;

-- 2. Se a tabela não existir, criar ela
CREATE TABLE IF NOT EXISTS public.whatsapp_instances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    instance_name VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'disconnected' CHECK (status IN ('disconnected', 'connecting', 'connected', 'qrcode')),
    whatsapp_number VARCHAR(20),
    last_connection_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Habilitar RLS se não estiver habilitado
ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;

-- 4. Criar política RLS se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'whatsapp_instances' 
        AND policyname = 'Users can manage own whatsapp_instances'
    ) THEN
        CREATE POLICY "Users can manage own whatsapp_instances" ON public.whatsapp_instances
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- 5. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_user_id ON public.whatsapp_instances(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_instance_name ON public.whatsapp_instances(instance_name);
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_status ON public.whatsapp_instances(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_created_at ON public.whatsapp_instances(created_at DESC);

-- 6. Verificar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'whatsapp_instances' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Verificar se existem registros
SELECT COUNT(*) as total_instances FROM public.whatsapp_instances;

-- 8. Verificar instâncias por status
SELECT 
    status,
    COUNT(*) as count
FROM public.whatsapp_instances 
GROUP BY status;


















