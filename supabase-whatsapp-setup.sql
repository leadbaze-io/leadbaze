-- Script SQL para criar a tabela whatsapp_instances no Supabase
-- Execute este script no SQL Editor do Supabase

-- ==============================================
-- TABELA: whatsapp_instances (para persistir conexões)
-- ==============================================
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

-- ==============================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================

-- Habilitar RLS para a tabela
ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;

-- Política para whatsapp_instances
CREATE POLICY "Users can manage own whatsapp_instances" ON public.whatsapp_instances
    FOR ALL USING (auth.uid() = user_id);

-- ==============================================
-- ÍNDICES PARA PERFORMANCE
-- ==============================================

-- Índices para whatsapp_instances
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_user_id ON public.whatsapp_instances(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_instance_name ON public.whatsapp_instances(instance_name);
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_status ON public.whatsapp_instances(status);

-- ==============================================
-- FUNÇÃO TRIGGER PARA UPDATED_AT AUTOMÁTICO
-- ==============================================

-- Função para atualizar updated_at automaticamente (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_whatsapp_instances_updated_at BEFORE UPDATE ON public.whatsapp_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- VERIFICAÇÃO
-- ==============================================

-- Verificar se a tabela foi criada
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'whatsapp_instances' 
AND table_schema = 'public'
ORDER BY ordinal_position; 