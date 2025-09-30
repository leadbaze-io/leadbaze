-- Script para criar a tabela de rastreamento de leads nas campanhas
-- Execute este script no SQL Editor do Supabase para implementar a solução robusta

-- ==============================================
-- TABELA: campaign_leads (RASTREAMENTO ROBUSTO)
-- ==============================================
CREATE TABLE IF NOT EXISTS campaign_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES bulk_campaigns(id) ON DELETE CASCADE NOT NULL,
  list_id UUID REFERENCES lead_lists(id) ON DELETE CASCADE NOT NULL,
  lead_data JSONB NOT NULL, -- Dados completos do lead
  lead_hash VARCHAR(64) NOT NULL, -- Hash único do lead para evitar duplicatas
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints para garantir integridade
  UNIQUE(campaign_id, lead_hash)
);

-- ==============================================
-- ÍNDICES PARA PERFORMANCE
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_campaign_leads_campaign_id ON campaign_leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_leads_list_id ON campaign_leads(list_id);
CREATE INDEX IF NOT EXISTS idx_campaign_leads_lead_hash ON campaign_leads(lead_hash);
CREATE INDEX IF NOT EXISTS idx_campaign_leads_added_at ON campaign_leads(added_at DESC);

-- ==============================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================
ALTER TABLE campaign_leads ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas leads de suas próprias campanhas
CREATE POLICY "Users can view leads from own campaigns" ON campaign_leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bulk_campaigns 
      WHERE bulk_campaigns.id = campaign_leads.campaign_id 
      AND bulk_campaigns.user_id = auth.uid()
    )
  );

-- Política: Usuários podem inserir leads em suas próprias campanhas
CREATE POLICY "Users can insert leads in own campaigns" ON campaign_leads
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM bulk_campaigns 
      WHERE bulk_campaigns.id = campaign_leads.campaign_id 
      AND bulk_campaigns.user_id = auth.uid()
    )
  );

-- Política: Usuários podem atualizar leads de suas próprias campanhas
CREATE POLICY "Users can update leads in own campaigns" ON campaign_leads
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM bulk_campaigns 
      WHERE bulk_campaigns.id = campaign_leads.campaign_id 
      AND bulk_campaigns.user_id = auth.uid()
    )
  );

-- Política: Usuários podem deletar leads de suas próprias campanhas
CREATE POLICY "Users can delete leads from own campaigns" ON campaign_leads
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM bulk_campaigns 
      WHERE bulk_campaigns.id = campaign_leads.campaign_id 
      AND bulk_campaigns.user_id = auth.uid()
    )
  );

-- ==============================================
-- FUNÇÕES AUXILIARES
-- ==============================================

-- Função para gerar hash único do lead
CREATE OR REPLACE FUNCTION generate_lead_hash(lead_data JSONB)
RETURNS VARCHAR(64) AS $$
BEGIN
  -- Criar hash baseado em dados únicos do lead (nome + telefone + endereço)
  RETURN encode(
    digest(
      COALESCE(lead_data->>'name', '') || 
      COALESCE(lead_data->>'phone', '') || 
      COALESCE(lead_data->>'address', ''),
      'sha256'
    ),
    'hex'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para contar leads em uma campanha
CREATE OR REPLACE FUNCTION count_campaign_leads(campaign_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM campaign_leads 
    WHERE campaign_id = campaign_uuid
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ==============================================
-- TRIGGERS PARA SINCRONIZAÇÃO AUTOMÁTICA
-- ==============================================

-- Função para atualizar total_leads na tabela bulk_campaigns
CREATE OR REPLACE FUNCTION update_campaign_total_leads()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar total_leads na tabela bulk_campaigns
  UPDATE bulk_campaigns 
  SET total_leads = count_campaign_leads(NEW.campaign_id)
  WHERE id = NEW.campaign_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para manter total_leads sincronizado
CREATE TRIGGER trigger_update_campaign_total_on_insert
  AFTER INSERT ON campaign_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_total_leads();

CREATE TRIGGER trigger_update_campaign_total_on_update
  AFTER UPDATE ON campaign_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_total_leads();

CREATE TRIGGER trigger_update_campaign_total_on_delete
  AFTER DELETE ON campaign_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_total_leads();

-- ==============================================
-- VIEWS ÚTEIS
-- ==============================================

-- View para visualizar leads de uma campanha com informações da lista
CREATE OR REPLACE VIEW campaign_leads_view AS
SELECT 
  cl.id,
  cl.campaign_id,
  cl.list_id,
  cl.lead_data,
  cl.lead_hash,
  cl.added_at,
  ll.name as list_name,
  ll.total_leads as list_total_leads,
  bc.name as campaign_name,
  bc.status as campaign_status
FROM campaign_leads cl
JOIN lead_lists ll ON cl.list_id = ll.id
JOIN bulk_campaigns bc ON cl.campaign_id = bc.id;

-- ==============================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ==============================================
COMMENT ON TABLE campaign_leads IS 'Tabela para rastrear exatamente quais leads estão em quais campanhas e de qual lista vieram';
COMMENT ON COLUMN campaign_leads.id IS 'ID único do registro de lead na campanha';
COMMENT ON COLUMN campaign_leads.campaign_id IS 'ID da campanha onde o lead está';
COMMENT ON COLUMN campaign_leads.list_id IS 'ID da lista de onde o lead veio';
COMMENT ON COLUMN campaign_leads.lead_data IS 'Dados completos do lead em formato JSONB';
COMMENT ON COLUMN campaign_leads.lead_hash IS 'Hash único do lead para evitar duplicatas';
COMMENT ON COLUMN campaign_leads.added_at IS 'Data/hora em que o lead foi adicionado à campanha';

-- ==============================================
-- VERIFICAÇÃO FINAL
-- ==============================================
-- Verificar se a tabela foi criada corretamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'campaign_leads'
ORDER BY ordinal_position;
