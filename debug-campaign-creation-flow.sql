-- Script para debugar o fluxo de criação de campanhas
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

-- 2. Verificar se há listas disponíveis
SELECT 
  id,
  name,
  total_leads,
  created_at
FROM lead_lists
ORDER BY created_at DESC
LIMIT 5;

-- 3. Verificar se há dados nas tabelas relacionadas
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

-- 4. Verificar dados específicos de cada campanha
SELECT 
  c.id,
  c.name,
  c.total_leads,
  c.unique_leads,
  c.selected_lists_count,
  COUNT(cul.id) as leads_reais,
  COUNT(cl.id) as lists_reais
FROM campaigns c
LEFT JOIN campaign_unique_leads cul ON c.id = cul.campaign_id
LEFT JOIN campaign_lists cl ON c.id = cl.campaign_id
GROUP BY c.id, c.name, c.total_leads, c.unique_leads, c.selected_lists_count
ORDER BY c.created_at DESC;

-- 5. Testar associação manual de uma lista a uma campanha
-- (Execute apenas se quiser testar)
-- INSERT INTO campaign_lists (campaign_id, list_id, status)
-- VALUES (
--   (SELECT id FROM campaigns ORDER BY created_at DESC LIMIT 1),
--   (SELECT id FROM lead_lists ORDER BY created_at DESC LIMIT 1),
--   'selected'
-- );

-- 6. Verificar se o contador foi atualizado automaticamente
-- SELECT 
--   id,
--   name,
--   selected_lists_count,
--   updated_at
-- FROM campaigns
-- WHERE id = (SELECT id FROM campaigns ORDER BY created_at DESC LIMIT 1);

-- 7. Testar associação de leads a uma campanha
-- (Execute apenas se quiser testar)
-- INSERT INTO campaign_unique_leads (campaign_id, list_id, lead_name, lead_phone, phone_hash)
-- VALUES (
--   (SELECT id FROM campaigns ORDER BY created_at DESC LIMIT 1),
--   (SELECT id FROM lead_lists ORDER BY created_at DESC LIMIT 1),
--   'Teste Lead',
--   '11999999999',
--   'test-hash-' || extract(epoch from now())
-- );

-- 8. Verificar se os contadores foram atualizados
-- SELECT 
--   id,
--   name,
--   total_leads,
--   unique_leads,
--   selected_lists_count,
--   updated_at
-- FROM campaigns
-- WHERE id = (SELECT id FROM campaigns ORDER BY created_at DESC LIMIT 1);

-- 9. Verificar se há problema na função update_campaign_counters
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

-- 10. Verificar se os contadores foram atualizados
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



















