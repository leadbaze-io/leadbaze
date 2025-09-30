-- Script para corrigir o problema na criação das campanhas
-- Execute este SQL no Supabase

-- 1. Verificar estrutura atual da tabela campaigns
\d campaigns;

-- 2. Verificar se há valores padrão problemáticos
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'campaigns' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar se há problema nos valores padrão dos contadores
-- Se os contadores estão sendo criados com valores NULL ou 0, vamos corrigir
ALTER TABLE campaigns 
ALTER COLUMN total_leads SET DEFAULT 0,
ALTER COLUMN unique_leads SET DEFAULT 0,
ALTER COLUMN selected_lists_count SET DEFAULT 0,
ALTER COLUMN ignored_lists_count SET DEFAULT 0;

-- 4. Atualizar campanhas existentes com valores padrão corretos
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

-- 5. Verificar se a atualização funcionou
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

-- 6. Verificar se há problema na função update_campaign_counters
-- Vamos recriar a função para garantir que está funcionando
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

-- 7. Testar a função com as campanhas existentes
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

-- 8. Verificar se os contadores foram atualizados
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

-- 9. Verificar se os triggers estão funcionando
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('campaign_unique_leads', 'campaign_lists')
  AND trigger_name LIKE '%counter%';

-- 10. Testar inserção de dados relacionados para ver se os contadores são atualizados automaticamente
-- (Execute apenas se quiser testar)
-- INSERT INTO campaign_lists (campaign_id, list_id, status)
-- VALUES (
--   (SELECT id FROM campaigns ORDER BY created_at DESC LIMIT 1),
--   'test-list-id-' || extract(epoch from now()),
--   'selected'
-- );

-- 11. Verificar se o contador foi atualizado automaticamente
-- SELECT 
--   id,
--   name,
--   selected_lists_count,
--   updated_at
-- FROM campaigns
-- WHERE id = (SELECT id FROM campaigns ORDER BY created_at DESC LIMIT 1);



















