-- =====================================================
-- CRIAÇÃO DA TABELA DE PACOTES DE LEADS
-- =====================================================

-- Criar tabela para armazenar pacotes de leads
CREATE TABLE IF NOT EXISTS lead_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id VARCHAR(50) UNIQUE NOT NULL, -- Ex: 'leads_500', 'leads_1000'
  name VARCHAR(100) NOT NULL, -- Ex: 'Pacote 500 Leads'
  leads INTEGER NOT NULL, -- Quantidade de leads
  price_cents INTEGER NOT NULL, -- Preço em centavos
  description TEXT,
  popular BOOLEAN DEFAULT FALSE,
  icon VARCHAR(10) DEFAULT '📊',
  perfect_pay_code VARCHAR(50), -- Código do Perfect Pay
  checkout_url TEXT, -- URL do checkout
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_lead_packages_package_id ON lead_packages(package_id);
CREATE INDEX IF NOT EXISTS idx_lead_packages_active ON lead_packages(active);
CREATE INDEX IF NOT EXISTS idx_lead_packages_leads ON lead_packages(leads);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_lead_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lead_packages_updated_at
  BEFORE UPDATE ON lead_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_packages_updated_at();

-- Inserir pacotes com preços reais
INSERT INTO lead_packages (
  package_id, name, leads, price_cents, description, popular, icon, 
  perfect_pay_code, checkout_url
) VALUES 
  (
    'leads_500',
    'Pacote 500 Leads',
    500,
    9000, -- R$ 90,00
    'Ideal para campanhas pequenas',
    false,
    '📊',
    'PPLQQNHAD',
    'https://go.perfectpay.com.br/PPU38CQ1CQU'
  ),
  (
    'leads_1000',
    'Pacote 1.000 Leads',
    1000,
    16000, -- R$ 160,00
    'Perfeito para testes e validações',
    true,
    '🚀',
    'PPLQQNHAE',
    'https://go.perfectpay.com.br/PPU38CQ1CR0'
  ),
  (
    'leads_2000',
    'Pacote 2.000 Leads',
    2000,
    26000, -- R$ 260,00
    'Excelente para campanhas médias',
    false,
    '⚡',
    'PPLQQNHAF',
    'https://go.perfectpay.com.br/PPU38CQ1CR1'
  ),
  (
    'leads_5000',
    'Pacote 5.000 Leads',
    5000,
    55000, -- R$ 550,00
    'Ideal para campanhas grandes',
    false,
    '🎯',
    'PPLQQNHAG',
    'https://go.perfectpay.com.br/PPU38CQ1CR2'
  ),
  (
    'leads_10000',
    'Pacote 10.000 Leads',
    10000,
    90000, -- R$ 900,00
    'Para campanhas enterprise',
    false,
    '💎',
    'PPLQQNHAH',
    'https://go.perfectpay.com.br/PPU38CQ1CR3'
  ),
  (
    'leads_20000',
    'Pacote 20.000 Leads',
    20000,
    140000, -- R$ 1.400,00
    'Para campanhas mega enterprise',
    false,
    '👑',
    'PPLQQNHAI',
    'https://go.perfectpay.com.br/PPU38CQ1CR4'
  )
ON CONFLICT (package_id) DO UPDATE SET
  name = EXCLUDED.name,
  leads = EXCLUDED.leads,
  price_cents = EXCLUDED.price_cents,
  description = EXCLUDED.description,
  popular = EXCLUDED.popular,
  icon = EXCLUDED.icon,
  perfect_pay_code = EXCLUDED.perfect_pay_code,
  checkout_url = EXCLUDED.checkout_url,
  updated_at = NOW();

-- Comentários na tabela
COMMENT ON TABLE lead_packages IS 'Tabela para armazenar pacotes de leads extras disponíveis para compra';
COMMENT ON COLUMN lead_packages.package_id IS 'Identificador único do pacote (ex: leads_500)';
COMMENT ON COLUMN lead_packages.leads IS 'Quantidade de leads incluídos no pacote';
COMMENT ON COLUMN lead_packages.price_cents IS 'Preço do pacote em centavos (ex: 9000 = R$ 90,00)';
COMMENT ON COLUMN lead_packages.perfect_pay_code IS 'Código do produto no Perfect Pay';
COMMENT ON COLUMN lead_packages.checkout_url IS 'URL direta do checkout no Perfect Pay';



