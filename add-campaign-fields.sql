-- Adicionar campos para armazenar dados das campanhas
-- Execute este script no SQL Editor do Supabase

-- Adicionar campos para contadores de listas
ALTER TABLE bulk_campaigns 
ADD COLUMN IF NOT EXISTS selected_lists_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ignored_lists_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unique_leads_count INTEGER DEFAULT 0;

-- Atualizar campos existentes com valores padrão
UPDATE bulk_campaigns 
SET 
  selected_lists_count = COALESCE(array_length(selected_lists, 1), 0),
  ignored_lists_count = COALESCE(array_length(ignored_lists, 1), 0),
  unique_leads_count = COALESCE(total_leads, 0)
WHERE selected_lists_count IS NULL OR ignored_lists_count IS NULL OR unique_leads_count IS NULL;

-- Criar função para atualizar contadores automaticamente
CREATE OR REPLACE FUNCTION update_campaign_counters()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar contadores baseado nos arrays
  NEW.selected_lists_count = COALESCE(array_length(NEW.selected_lists, 1), 0);
  NEW.ignored_lists_count = COALESCE(array_length(NEW.ignored_lists, 1), 0);
  
  -- Atualizar updated_at
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar contadores automaticamente
DROP TRIGGER IF EXISTS trigger_update_campaign_counters ON bulk_campaigns;
CREATE TRIGGER trigger_update_campaign_counters
  BEFORE UPDATE ON bulk_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_counters();

-- Função para atualizar contador de leads únicos
CREATE OR REPLACE FUNCTION update_campaign_unique_leads_count(campaign_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  leads_count INTEGER;
BEGIN
  -- Contar leads únicos na tabela campaign_leads
  SELECT COUNT(*) INTO leads_count
  FROM campaign_leads
  WHERE campaign_id = campaign_uuid;
  
  -- Atualizar o campo na tabela bulk_campaigns
  UPDATE bulk_campaigns
  SET unique_leads_count = leads_count
  WHERE id = campaign_uuid;
  
  RETURN leads_count;
END;
$$ LANGUAGE plpgsql;



















