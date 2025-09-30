-- =====================================================
-- NOVO SISTEMA DE CAMPANHAS - ESTRUTURA SIMPLIFICADA
-- =====================================================

-- 1. Tabela para campanhas (simplificada)
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  message TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'paused')),
  
  -- Contadores (calculados automaticamente)
  total_leads INTEGER DEFAULT 0,
  unique_leads INTEGER DEFAULT 0,
  selected_lists_count INTEGER DEFAULT 0,
  ignored_lists_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela para leads únicos das campanhas (nova estrutura)
CREATE TABLE IF NOT EXISTS campaign_unique_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  list_id UUID NOT NULL,
  
  -- Dados do lead
  lead_name VARCHAR(255),
  lead_phone VARCHAR(50),
  lead_email VARCHAR(255),
  lead_company VARCHAR(255),
  lead_position VARCHAR(255),
  
  -- Hash normalizado para deduplicação
  phone_hash VARCHAR(64) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices únicos
  UNIQUE(campaign_id, phone_hash)
);

-- 3. Tabela para listas selecionadas/ignoradas (simplificada)
CREATE TABLE IF NOT EXISTS campaign_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  list_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('selected', 'ignored')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(campaign_id, list_id)
);

-- 4. Índices para performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_unique_leads_campaign_id ON campaign_unique_leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_unique_leads_phone_hash ON campaign_unique_leads(phone_hash);
CREATE INDEX IF NOT EXISTS idx_campaign_lists_campaign_id ON campaign_lists(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_lists_status ON campaign_lists(status);

-- 5. Função para normalizar telefone
CREATE OR REPLACE FUNCTION normalize_phone(phone_input TEXT)
RETURNS TEXT AS $$
BEGIN
  IF phone_input IS NULL OR phone_input = '' THEN
    RETURN NULL;
  END IF;
  
  -- Remove todos os caracteres não numéricos
  phone_input := REGEXP_REPLACE(phone_input, '[^0-9]', '', 'g');
  
  -- Se estiver vazio após limpeza, retorna NULL
  IF phone_input = '' THEN
    RETURN NULL;
  END IF;
  
  -- Se começar com 55 (Brasil) e tiver 12+ dígitos, remove o 55
  IF phone_input LIKE '55%' AND LENGTH(phone_input) >= 12 THEN
    phone_input := SUBSTRING(phone_input FROM 3);
  END IF;
  
  -- Se começar com 0 e tiver 11+ dígitos, remove o 0
  IF phone_input LIKE '0%' AND LENGTH(phone_input) >= 11 THEN
    phone_input := SUBSTRING(phone_input FROM 2);
  END IF;
  
  RETURN phone_input;
END;
$$ LANGUAGE plpgsql;

-- 6. Função para atualizar contadores da campanha
CREATE OR REPLACE FUNCTION update_campaign_counters(campaign_uuid UUID)
RETURNS VOID AS $$
DECLARE
  v_total_leads INTEGER;
  v_unique_leads INTEGER;
  v_selected_count INTEGER;
  v_ignored_count INTEGER;
BEGIN
  -- Contar leads únicos
  SELECT COUNT(*) INTO v_unique_leads
  FROM campaign_unique_leads
  WHERE campaign_id = campaign_uuid;
  
  -- Contar total de leads (mesmo que únicos por enquanto)
  v_total_leads := v_unique_leads;
  
  -- Contar listas selecionadas
  SELECT COUNT(*) INTO v_selected_count
  FROM campaign_lists
  WHERE campaign_id = campaign_uuid AND status = 'selected';
  
  -- Contar listas ignoradas
  SELECT COUNT(*) INTO v_ignored_count
  FROM campaign_lists
  WHERE campaign_id = campaign_uuid AND status = 'ignored';
  
  -- Atualizar campanha
  UPDATE campaigns
  SET 
    total_leads = v_total_leads,
    unique_leads = v_unique_leads,
    selected_lists_count = v_selected_count,
    ignored_lists_count = v_ignored_count,
    updated_at = NOW()
  WHERE id = campaign_uuid;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger para atualizar contadores automaticamente
CREATE OR REPLACE FUNCTION trigger_update_campaign_counters()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar contadores da campanha
  PERFORM update_campaign_counters(COALESCE(NEW.campaign_id, OLD.campaign_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS trigger_campaign_unique_leads_counters ON campaign_unique_leads;
CREATE TRIGGER trigger_campaign_unique_leads_counters
  AFTER INSERT OR UPDATE OR DELETE ON campaign_unique_leads
  FOR EACH ROW EXECUTE FUNCTION trigger_update_campaign_counters();

DROP TRIGGER IF EXISTS trigger_campaign_lists_counters ON campaign_lists;
CREATE TRIGGER trigger_campaign_lists_counters
  AFTER INSERT OR UPDATE OR DELETE ON campaign_lists
  FOR EACH ROW EXECUTE FUNCTION trigger_update_campaign_counters();

-- 8. RLS (Row Level Security)
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_unique_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_lists ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own campaigns" ON campaigns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaigns" ON campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" ON campaigns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" ON campaigns
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own campaign leads" ON campaign_unique_leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE id = campaign_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own campaign leads" ON campaign_unique_leads
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE id = campaign_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own campaign leads" ON campaign_unique_leads
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE id = campaign_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own campaign leads" ON campaign_unique_leads
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE id = campaign_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own campaign lists" ON campaign_lists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE id = campaign_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own campaign lists" ON campaign_lists
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE id = campaign_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own campaign lists" ON campaign_lists
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE id = campaign_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own campaign lists" ON campaign_lists
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE id = campaign_id AND user_id = auth.uid()
    )
  );



















