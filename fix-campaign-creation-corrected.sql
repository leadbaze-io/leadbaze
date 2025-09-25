-- Script corrigido para resolver o problema das campanhas
-- Execute este SQL no Supabase

-- 1. Verificar estrutura atual da tabela campaigns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'campaigns' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar campanhas atuais
SELECT 
  id,
  name,
  message,
  status,
  total_leads,
  unique_leads,
  selected_lists_count,
  ignored_lists_count,
  created_at,
  updated_at
FROM campaigns
ORDER BY created_at DESC;

-- 3. Verificar se há valores padrão problemáticos
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'campaigns' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Corrigir valores padrão dos contadores
ALTER TABLE campaigns 
ALTER COLUMN total_leads SET DEFAULT 0,
ALTER COLUMN unique_leads SET DEFAULT 0,
ALTER COLUMN selected_lists_count SET DEFAULT 0,
ALTER COLUMN ignored_lists_count SET DEFAULT 0;

-- 5. Atualizar campanhas existentes com valores padrão corretos
UPDATE campaigns 
SET 
  total_leads = COALESCE(total_leads, 0),
  unique_leads = COALESCE(unique_leads, 0),
  selected_lists_count = COALESCE(selected_lists_count, 0),
  ignored_lists_count = COALESCE(ignored_lists_count, 0)
WHERE total_leads IS NULL 
   OR unique_leads IS NULL 
   OR selected_lists_count IS NULL 
   OR ignored_lists_count IS NULL;

-- 6. Verificar se a atualização funcionou
SELECT 
  id,
  name,
  total_leads,
  unique_leads,
  selected_lists_count,
  ignored_lists_count,
  created_at
FROM campaigns
ORDER BY created_at DESC;

-- 7. Recriar a função update_campaign_counters para garantir que está funcionando
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

-- 8. Testar a função com as campanhas existentes
DO $$
DECLARE
  campaign_record RECORD;
BEGIN
  FOR campaign_record IN 
    SELECT id, name FROM campaigns
  LOOP
    RAISE NOTICE 'Testando função para campanha: % (%)', campaign_record.name, campaign_record.id;
    PERFORM update_campaign_counters(campaign_record.id);
  END LOOP;
END;
$$;

-- 9. Verificar se os contadores foram atualizados
SELECT 
  id,
  name,
  total_leads,
  unique_leads,
  selected_lists_count,
  ignored_lists_count,
  updated_at
FROM campaigns
ORDER BY updated_at DESC;

-- 10. Verificar se os triggers estão funcionando
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('campaign_unique_leads', 'campaign_lists')
  AND trigger_name LIKE '%counter%';

-- 11. Verificar se há dados nas tabelas relacionadas
SELECT 
  'campaign_unique_leads' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT campaign_id) as unique_campaigns
FROM campaign_unique_leads
UNION ALL
SELECT 
  'campaign_lists' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT campaign_id) as unique_campaigns
FROM campaign_lists;

-- 12. Verificar dados específicos de cada campanha
SELECT 
  c.id,
  c.name,
  c.total_leads,
  c.unique_leads,
  c.selected_lists_count,
  COUNT(cul.id) as leads_reais,
  COUNT(cl.id) as lists_reais,
  c.created_at
FROM campaigns c
LEFT JOIN campaign_unique_leads cul ON c.id = cul.campaign_id
LEFT JOIN campaign_lists cl ON c.id = cl.campaign_id
GROUP BY c.id, c.name, c.total_leads, c.unique_leads, c.selected_lists_count, c.created_at
ORDER BY c.created_at DESC;



















