-- Script para corrigir o problema dos contadores das campanhas
-- Execute este SQL no Supabase

-- 1. Verificar a estrutura atual da tabela campaigns
\d campaigns;

-- 2. Verificar campanhas com contadores zerados
SELECT 
  id,
  name,
  status,
  total_leads,
  unique_leads,
  selected_lists_count,
  ignored_lists_count,
  created_at
FROM campaigns
WHERE (total_leads = 0 OR total_leads IS NULL)
  OR (unique_leads = 0 OR unique_leads IS NULL)
ORDER BY created_at DESC;

-- 3. Verificar se há função update_campaign_counters
SELECT EXISTS (
  SELECT 1 
  FROM pg_proc 
  WHERE proname = 'update_campaign_counters'
) as function_exists;

-- 4. Criar função para atualizar contadores se não existir
CREATE OR REPLACE FUNCTION update_campaign_counters(campaign_uuid UUID)
RETURNS void AS $$
BEGIN
  -- Atualizar contadores da campanha
  UPDATE campaigns 
  SET 
    total_leads = (
      SELECT COUNT(*) 
      FROM campaign_unique_leads 
      WHERE campaign_id = campaign_uuid
    ),
    unique_leads = (
      SELECT COUNT(*) 
      FROM campaign_unique_leads 
      WHERE campaign_id = campaign_uuid
    ),
    selected_lists_count = (
      SELECT COUNT(*) 
      FROM campaign_lists 
      WHERE campaign_id = campaign_uuid AND status = 'selected'
    ),
    ignored_lists_count = (
      SELECT COUNT(*) 
      FROM campaign_lists 
      WHERE campaign_id = campaign_uuid AND status = 'ignored'
    ),
    updated_at = NOW()
  WHERE id = campaign_uuid;
END;
$$ LANGUAGE plpgsql;

-- 5. Atualizar contadores de todas as campanhas existentes
DO $$
DECLARE
  campaign_record RECORD;
BEGIN
  FOR campaign_record IN 
    SELECT id FROM campaigns
  LOOP
    PERFORM update_campaign_counters(campaign_record.id);
  END LOOP;
END;
$$;

-- 6. Verificar se os contadores foram atualizados
SELECT 
  id,
  name,
  status,
  total_leads,
  unique_leads,
  selected_lists_count,
  ignored_lists_count,
  created_at
FROM campaigns
ORDER BY created_at DESC;

-- 7. Criar trigger para atualizar contadores automaticamente
CREATE OR REPLACE FUNCTION trigger_update_campaign_counters()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar contadores da campanha afetada
  IF TG_OP = 'DELETE' THEN
    PERFORM update_campaign_counters(OLD.campaign_id);
    RETURN OLD;
  ELSE
    PERFORM update_campaign_counters(NEW.campaign_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 8. Aplicar triggers nas tabelas relacionadas
DROP TRIGGER IF EXISTS trigger_campaign_unique_leads_counters ON campaign_unique_leads;
CREATE TRIGGER trigger_campaign_unique_leads_counters
  AFTER INSERT OR UPDATE OR DELETE ON campaign_unique_leads
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_campaign_counters();

DROP TRIGGER IF EXISTS trigger_campaign_lists_counters ON campaign_lists;
CREATE TRIGGER trigger_campaign_lists_counters
  AFTER INSERT OR UPDATE OR DELETE ON campaign_lists
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_campaign_counters();

-- 9. Limpar campanhas órfãs ou com nomes de teste (CUIDADO!)
-- DELETE FROM campaigns 
-- WHERE name LIKE '%test%' 
--    OR name LIKE '%teste%'
--    OR name LIKE '%asdasd%'
--    OR total_leads = 0;

-- 10. Verificar estado final
SELECT 
  COUNT(*) as total_campaigns,
  COUNT(CASE WHEN total_leads > 0 THEN 1 END) as campaigns_with_leads,
  COUNT(CASE WHEN total_leads = 0 OR total_leads IS NULL THEN 1 END) as empty_campaigns
FROM campaigns;



















