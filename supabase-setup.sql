-- Script SQL para configurar a estrutura do banco de dados no Supabase
-- Execute este script no SQL Editor do Supabase para criar as tabelas necessárias

-- ==============================================
-- TABELA: lead_lists (principal)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.lead_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    leads JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_leads INTEGER NOT NULL DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'processing')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================
-- TABELA: whatsapp_templates (para futura integração)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================
-- TABELA: contact_attempts (para tracking de contatos)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.contact_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id VARCHAR(255) NOT NULL, -- ID do lead dentro do JSON
    list_id UUID REFERENCES public.lead_lists(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    method VARCHAR(20) NOT NULL CHECK (method IN ('whatsapp', 'phone', 'email')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'replied', 'failed')),
    message TEXT,
    template_id UUID REFERENCES public.whatsapp_templates(id) ON DELETE SET NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    replied_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================
-- TABELA: user_preferences (configurações do usuário)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    whatsapp_number VARCHAR(20),
    default_message_template TEXT,
    auto_follow_up BOOLEAN DEFAULT false,
    follow_up_delay_hours INTEGER DEFAULT 24,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

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

-- Habilitar RLS para todas as tabelas
ALTER TABLE public.lead_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;

-- Políticas para lead_lists
CREATE POLICY "Users can manage own lead_lists" ON public.lead_lists
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para whatsapp_templates
CREATE POLICY "Users can manage own whatsapp_templates" ON public.whatsapp_templates
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para contact_attempts
CREATE POLICY "Users can manage own contact_attempts" ON public.contact_attempts
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para user_preferences
CREATE POLICY "Users can manage own user_preferences" ON public.user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para whatsapp_instances
CREATE POLICY "Users can manage own whatsapp_instances" ON public.whatsapp_instances
    FOR ALL USING (auth.uid() = user_id);

-- ==============================================
-- ÍNDICES PARA PERFORMANCE
-- ==============================================

-- Índices para lead_lists
CREATE INDEX IF NOT EXISTS idx_lead_lists_user_id ON public.lead_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_lists_created_at ON public.lead_lists(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_lists_status ON public.lead_lists(status);
CREATE INDEX IF NOT EXISTS idx_lead_lists_name ON public.lead_lists(name);

-- Índices para whatsapp_templates
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_user_id ON public.whatsapp_templates(user_id);

-- Índices para contact_attempts
CREATE INDEX IF NOT EXISTS idx_contact_attempts_user_id ON public.contact_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_attempts_list_id ON public.contact_attempts(list_id);
CREATE INDEX IF NOT EXISTS idx_contact_attempts_status ON public.contact_attempts(status);
CREATE INDEX IF NOT EXISTS idx_contact_attempts_created_at ON public.contact_attempts(created_at DESC);

-- Índices para user_preferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Índices para whatsapp_instances
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_user_id ON public.whatsapp_instances(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_instance_name ON public.whatsapp_instances(instance_name);
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_status ON public.whatsapp_instances(status);

-- ==============================================
-- FUNÇÕES TRIGGER PARA UPDATED_AT AUTOMÁTICO
-- ==============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_lead_lists_updated_at BEFORE UPDATE ON public.lead_lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_instances_updated_at BEFORE UPDATE ON public.whatsapp_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- ESTRUTURAS DE EXEMPLO
-- ==============================================

-- Estrutura do JSON para os leads em lead_lists.leads:
-- [
--   {
--     "id": "optional_string",
--     "name": "Nome do Estabelecimento",
--     "address": "Endereço completo",
--     "phone": "Telefone (opcional)",
--     "rating": 4.5,
--     "website": "https://website.com (opcional)",
--     "business_type": "Tipo de negócio (opcional)",
--     "google_maps_url": "URL do Google Maps (opcional)",
--     "place_id": "ID do lugar no Google (opcional)",
--     "reviews_count": 150,
--     "price_level": 2,
--     "opening_hours": ["Mon: 9:00 AM – 6:00 PM", "Tue: 9:00 AM – 6:00 PM"],
--     "photos": ["url1", "url2"]
--   }
-- ]

-- Exemplo de inserção de dados:
-- INSERT INTO public.lead_lists (user_id, name, description, leads, total_leads, tags)
-- VALUES (
--     auth.uid(),
--     'Restaurantes São Paulo Centro',
--     'Lista de restaurantes na região central de São Paulo',
--     '[{"name": "Restaurante Exemplo", "address": "Rua Exemplo, 123", "phone": "(11) 99999-9999", "rating": 4.5}]'::jsonb,
--     1,
--     ARRAY['restaurantes', 'sao-paulo', 'centro']
-- );