-- Script para testar se o sistema funciona quando associamos dados manualmente
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
  created_at,
  updated_at
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

-- 3. TESTE 1: Associar uma lista a uma campanha
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

-- 5. TESTE 2: Associar leads a uma campanha
-- (Execute apenas se quiser testar)
-- INSERT INTO campaign_unique_leads (campaign_id, list_id, lead_name, lead_phone, phone_hash)
-- VALUES (
--   (SELECT id FROM campaigns ORDER BY created_at DESC LIMIT 1),
--   (SELECT id FROM lead_lists ORDER BY created_at DESC LIMIT 1),
--   'Teste Lead 1',
--   '11999999999',
--   'test-hash-1'
-- ),
-- (
--   (SELECT id FROM campaigns ORDER BY created_at DESC LIMIT 1),
--   (SELECT id FROM lead_lists ORDER BY created_at DESC LIMIT 1),
--   'Teste Lead 2',
--   '11888888888',
--   'test-hash-2'
-- );

-- 6. Verificar se os contadores foram atualizados automaticamente
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
-- SELECT 
--   'campaign_unique_leads' as table_name,
--   COUNT(*) as total_records,
--   COUNT(DISTINCT campaign_id) as unique_campaigns
-- FROM campaign_unique_leads
-- UNION ALL
-- SELECT 
--   'campaign_lists' as table_name,
--   COUNT(*) as total_records,
--   COUNT(DISTINCT campaign_id) as unique_campaigns
-- FROM campaign_lists;

-- 8. Verificar dados específicos de cada campanha
-- SELECT 
--   c.id,
--   c.name,
--   c.total_leads,
--   c.unique_leads,
--   c.selected_lists_count,
--   COUNT(cul.id) as leads_reais,
--   COUNT(cl.id) as lists_reais
-- FROM campaigns c
-- LEFT JOIN campaign_unique_leads cul ON c.id = cul.campaign_id
-- LEFT JOIN campaign_lists cl ON c.id = cl.campaign_id
-- GROUP BY c.id, c.name, c.total_leads, c.unique_leads, c.selected_lists_count
-- ORDER BY c.created_at DESC;

-- 9. Limpar dados de teste (Execute apenas se quiser limpar)
-- DELETE FROM campaign_unique_leads WHERE lead_name LIKE 'Teste Lead%';
-- DELETE FROM campaign_lists WHERE campaign_id IN (SELECT id FROM campaigns WHERE name = 'aas1111');

-- 10. Verificar estado final
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



















