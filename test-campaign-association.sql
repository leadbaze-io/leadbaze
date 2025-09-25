-- Script para testar associação de campanhas com listas e leads
-- Execute este SQL no Supabase

-- 1. Verificar campanhas atuais
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

-- 2. Verificar se há listas disponíveis para associar
SELECT 
  id,
  name,
  total_leads,
  created_at
FROM lead_lists
ORDER BY created_at DESC
LIMIT 5;

-- 3. Testar associação manual de uma lista a uma campanha
-- (Execute apenas se quiser testar)
-- INSERT INTO campaign_lists (campaign_id, list_id, status)
-- VALUES (
--   (SELECT id FROM campaigns ORDER BY created_at DESC LIMIT 1),
--   (SELECT id FROM lead_lists ORDER BY created_at DESC LIMIT 1),
--   'selected'
-- );

-- 4. Verificar se o contador foi atualizado automaticamente
-- SELECT 
--   id,
--   name,
--   selected_lists_count,
--   updated_at
-- FROM campaigns
-- WHERE id = (SELECT id FROM campaigns ORDER BY created_at DESC LIMIT 1);

-- 5. Testar associação de leads a uma campanha
-- (Execute apenas se quiser testar)
-- INSERT INTO campaign_unique_leads (campaign_id, list_id, lead_name, lead_phone, phone_hash)
-- VALUES (
--   (SELECT id FROM campaigns ORDER BY created_at DESC LIMIT 1),
--   (SELECT id FROM lead_lists ORDER BY created_at DESC LIMIT 1),
--   'Teste Lead',
--   '11999999999',
--   'test-hash-' || extract(epoch from now())
-- );

-- 6. Verificar se os contadores foram atualizados
-- SELECT 
--   id,
--   name,
--   total_leads,
--   unique_leads,
--   selected_lists_count,
--   updated_at
-- FROM campaigns
-- WHERE id = (SELECT id FROM campaigns ORDER BY created_at DESC LIMIT 1);

-- 7. Verificar dados nas tabelas relacionadas
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

-- 8. Verificar se há problema na função update_campaign_counters
-- Testar a função manualmente
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



















