-- ==============================================
-- SCHEMA APRIMORADO PARA PERFIS DE USUÁRIO
-- Sistema de cadastro otimizado para gateway de pagamento
-- ==============================================

-- ==============================================
-- TABELA: user_profiles (Perfil completo do usuário)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- ==============================================
  -- DADOS FISCAIS (OBRIGATÓRIOS)
  -- ==============================================
  tax_type VARCHAR(20) NOT NULL CHECK (tax_type IN ('pessoa_fisica', 'pessoa_juridica')),
  
  -- Pessoa Física
  cpf VARCHAR(14) UNIQUE,
  full_name VARCHAR(200) NOT NULL,
  birth_date DATE,
  rg VARCHAR(20),
  
  -- Pessoa Jurídica
  cnpj VARCHAR(18) UNIQUE,
  company_name VARCHAR(255),
  trade_name VARCHAR(255),
  state_registration VARCHAR(20),
  municipal_registration VARCHAR(20),
  
  -- ==============================================
  -- CONTATO (OBRIGATÓRIOS)
  -- ==============================================
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  alternative_phone VARCHAR(20),
  preferred_contact VARCHAR(20) DEFAULT 'email' CHECK (preferred_contact IN ('email', 'phone', 'whatsapp')),
  
  -- ==============================================
  -- ENDEREÇO DE COBRANÇA (OBRIGATÓRIOS)
  -- ==============================================
  billing_street VARCHAR(255) NOT NULL,
  billing_number VARCHAR(20) NOT NULL,
  billing_complement VARCHAR(100),
  billing_neighborhood VARCHAR(100) NOT NULL,
  billing_city VARCHAR(100) NOT NULL,
  billing_state VARCHAR(2) NOT NULL,
  billing_zip_code VARCHAR(10) NOT NULL,
  billing_country VARCHAR(2) DEFAULT 'BR',
  
  -- ==============================================
  -- DADOS DE PAGAMENTO
  -- ==============================================
  accepted_payment_methods TEXT[] DEFAULT '{"credit_card", "pix"}',
  billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  auto_renewal BOOLEAN DEFAULT true,
  
  -- Dados do cartão (tokenizados)
  card_last4 VARCHAR(4),
  card_brand VARCHAR(20),
  card_expiry_month INTEGER,
  card_expiry_year INTEGER,
  card_holder_name VARCHAR(200),
  
  -- ==============================================
  -- STATUS E VERIFICAÇÕES
  -- ==============================================
  profile_completion_percentage INTEGER DEFAULT 0 CHECK (profile_completion_percentage >= 0 AND profile_completion_percentage <= 100),
  is_verified BOOLEAN DEFAULT false,
  verification_status JSONB DEFAULT '{}',
  
  -- Compliance
  lgpd_consent BOOLEAN DEFAULT false,
  lgpd_consent_date TIMESTAMP WITH TIME ZONE,
  lgpd_consent_ip VARCHAR(45),
  lgpd_consent_user_agent TEXT,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- TABELA: user_verifications (Verificações de dados)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.user_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  verification_type VARCHAR(50) NOT NULL CHECK (verification_type IN ('cpf', 'cnpj', 'phone', 'email', 'address', 'document')),
  verification_method VARCHAR(50) NOT NULL CHECK (verification_method IN ('api', 'sms', 'email', 'upload', 'manual')),
  
  -- Dados da verificação
  verification_code VARCHAR(10),
  verification_token VARCHAR(255),
  external_id VARCHAR(255), -- ID do serviço externo
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed', 'expired')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  
  -- Resultados
  verification_result JSONB,
  error_message TEXT,
  
  -- Timestamps
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- TABELA: user_documents (Documentos do usuário)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.user_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('cpf', 'cnpj', 'rg', 'cnh', 'passport', 'address_proof', 'income_proof')),
  document_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  
  -- Status do documento
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  rejection_reason TEXT,
  
  -- Metadados
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- ==============================================
-- TABELA: user_payment_methods (Métodos de pagamento)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.user_payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Dados do método de pagamento
  payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('credit_card', 'debit_card', 'pix', 'boleto', 'bank_transfer')),
  is_default BOOLEAN DEFAULT false,
  
  -- Dados do cartão (tokenizados)
  card_token VARCHAR(255), -- Token do gateway de pagamento
  card_last4 VARCHAR(4),
  card_brand VARCHAR(20),
  card_expiry_month INTEGER,
  card_expiry_year INTEGER,
  card_holder_name VARCHAR(200),
  
  -- Dados PIX
  pix_key VARCHAR(255),
  pix_type VARCHAR(20) CHECK (pix_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================

-- Habilitar RLS para todas as tabelas
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_payment_methods ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para user_verifications
CREATE POLICY "Users can manage own verifications" ON public.user_verifications
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para user_documents
CREATE POLICY "Users can manage own documents" ON public.user_documents
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para user_payment_methods
CREATE POLICY "Users can manage own payment methods" ON public.user_payment_methods
    FOR ALL USING (auth.uid() = user_id);

-- ==============================================
-- ÍNDICES PARA PERFORMANCE
-- ==============================================

-- Índices para user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_cpf ON public.user_profiles(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_cnpj ON public.user_profiles(cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON public.user_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON public.user_profiles(created_at DESC);

-- Índices para user_verifications
CREATE INDEX IF NOT EXISTS idx_user_verifications_user_id ON public.user_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_verifications_type ON public.user_verifications(verification_type);
CREATE INDEX IF NOT EXISTS idx_user_verifications_status ON public.user_verifications(status);
CREATE INDEX IF NOT EXISTS idx_user_verifications_created_at ON public.user_verifications(created_at DESC);

-- Índices para user_documents
CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON public.user_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_type ON public.user_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_user_documents_status ON public.user_documents(status);

-- Índices para user_payment_methods
CREATE INDEX IF NOT EXISTS idx_user_payment_methods_user_id ON public.user_payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_user_payment_methods_type ON public.user_payment_methods(payment_type);
CREATE INDEX IF NOT EXISTS idx_user_payment_methods_default ON public.user_payment_methods(user_id, is_default) WHERE is_default = true;

-- ==============================================
-- FUNÇÕES E TRIGGERS
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
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_payment_methods_updated_at BEFORE UPDATE ON public.user_payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular porcentagem de completude do perfil
CREATE OR REPLACE FUNCTION calculate_profile_completion()
RETURNS TRIGGER AS $$
DECLARE
    completion_percentage INTEGER := 0;
BEGIN
    -- Dados básicos (40%)
    IF NEW.full_name IS NOT NULL AND NEW.full_name != '' THEN
        completion_percentage := completion_percentage + 10;
    END IF;
    
    IF NEW.email IS NOT NULL AND NEW.email != '' THEN
        completion_percentage := completion_percentage + 10;
    END IF;
    
    IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN
        completion_percentage := completion_percentage + 10;
    END IF;
    
    IF (NEW.cpf IS NOT NULL AND NEW.cpf != '') OR (NEW.cnpj IS NOT NULL AND NEW.cnpj != '') THEN
        completion_percentage := completion_percentage + 10;
    END IF;
    
    -- Endereço (30%)
    IF NEW.billing_street IS NOT NULL AND NEW.billing_street != '' THEN
        completion_percentage := completion_percentage + 5;
    END IF;
    
    IF NEW.billing_number IS NOT NULL AND NEW.billing_number != '' THEN
        completion_percentage := completion_percentage + 5;
    END IF;
    
    IF NEW.billing_neighborhood IS NOT NULL AND NEW.billing_neighborhood != '' THEN
        completion_percentage := completion_percentage + 5;
    END IF;
    
    IF NEW.billing_city IS NOT NULL AND NEW.billing_city != '' THEN
        completion_percentage := completion_percentage + 5;
    END IF;
    
    IF NEW.billing_state IS NOT NULL AND NEW.billing_state != '' THEN
        completion_percentage := completion_percentage + 5;
    END IF;
    
    IF NEW.billing_zip_code IS NOT NULL AND NEW.billing_zip_code != '' THEN
        completion_percentage := completion_percentage + 5;
    END IF;
    
    -- Dados de pagamento (20%)
    IF NEW.accepted_payment_methods IS NOT NULL AND array_length(NEW.accepted_payment_methods, 1) > 0 THEN
        completion_percentage := completion_percentage + 10;
    END IF;
    
    IF NEW.billing_cycle IS NOT NULL THEN
        completion_percentage := completion_percentage + 5;
    END IF;
    
    -- Compliance (10%)
    IF NEW.lgpd_consent = true THEN
        completion_percentage := completion_percentage + 10;
    END IF;
    
    NEW.profile_completion_percentage := completion_percentage;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para calcular completude do perfil
CREATE TRIGGER calculate_user_profile_completion BEFORE INSERT OR UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION calculate_profile_completion();

-- ==============================================
-- VIEWS ÚTEIS
-- ==============================================

-- View para perfis completos com verificações
CREATE OR REPLACE VIEW public.user_profiles_complete AS
SELECT 
    up.*,
    uv_cpf.status as cpf_verification_status,
    uv_cnpj.status as cnpj_verification_status,
    uv_phone.status as phone_verification_status,
    uv_email.status as email_verification_status,
    COUNT(ud.id) as documents_count,
    COUNT(upm.id) as payment_methods_count
FROM public.user_profiles up
LEFT JOIN public.user_verifications uv_cpf ON up.user_id = uv_cpf.user_id AND uv_cpf.verification_type = 'cpf'
LEFT JOIN public.user_verifications uv_cnpj ON up.user_id = uv_cnpj.user_id AND uv_cnpj.verification_type = 'cnpj'
LEFT JOIN public.user_verifications uv_phone ON up.user_id = uv_phone.user_id AND uv_phone.verification_type = 'phone'
LEFT JOIN public.user_verifications uv_email ON up.user_id = uv_email.user_id AND uv_email.verification_type = 'email'
LEFT JOIN public.user_documents ud ON up.user_id = ud.user_id
LEFT JOIN public.user_payment_methods upm ON up.user_id = upm.user_id AND upm.is_active = true
GROUP BY up.id, uv_cpf.status, uv_cnpj.status, uv_phone.status, uv_email.status;

-- ==============================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- ==============================================

-- Inserir dados de exemplo para teste (descomente se necessário)
/*
INSERT INTO public.user_profiles (
    user_id, tax_type, cpf, full_name, email, phone,
    billing_street, billing_number, billing_neighborhood, 
    billing_city, billing_state, billing_zip_code,
    lgpd_consent, lgpd_consent_date
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- Substitua por um user_id real
    'pessoa_fisica',
    '12345678901',
    'João da Silva',
    'joao@exemplo.com',
    '11999999999',
    'Rua das Flores',
    '123',
    'Centro',
    'São Paulo',
    'SP',
    '01234567',
    true,
    NOW()
);
*/

-- ==============================================
-- COMENTÁRIOS FINAIS
-- ==============================================

-- Este schema foi projetado para:
-- 1. Suportar tanto pessoa física quanto jurídica
-- 2. Facilitar integração com gateways de pagamento
-- 3. Cumprir compliance LGPD
-- 4. Permitir verificação de dados
-- 5. Manter histórico de documentos
-- 6. Calcular automaticamente completude do perfil
-- 7. Garantir segurança com RLS
-- 8. Otimizar performance com índices

-- Para usar este schema:
-- 1. Execute no SQL Editor do Supabase
-- 2. Verifique se as políticas RLS estão ativas
-- 3. Teste as validações e triggers
-- 4. Configure as integrações de verificação
-- 5. Implemente o frontend correspondente
