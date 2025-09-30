-- Script simples para testar criação de campanhas
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

-- 2. Verificar se há dados nas tabelas relacionadas
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

-- 3. Verificar dados específicos de cada campanha
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

-- 4. Forçar atualização manual dos contadores
DO $$
DECLARE
  campaign_record RECORD;
BEGIN
  FOR campaign_record IN 
    SELECT id, name FROM campaigns
  LOOP
    RAISE NOTICE 'Atualizando contadores para campanha: % (%)', campaign_record.name, campaign_record.id;
    PERFORM update_campaign_counters(campaign_record.id);
  END LOOP;
END;
$$;

-- 5. Verificar se os contadores foram atualizados
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

-- 6. Verificar se há problema na estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'campaigns' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Verificar se há triggers funcionando
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('campaign_unique_leads', 'campaign_lists')
  AND trigger_name LIKE '%counter%';

-- 8. Testar inserção de dados relacionados para ver se os contadores são atualizados automaticamente
-- (Execute apenas se quiser testar)
-- INSERT INTO campaign_lists (campaign_id, list_id, status)
-- VALUES (
--   (SELECT id FROM campaigns ORDER BY created_at DESC LIMIT 1),
--   'test-list-id-' || extract(epoch from now()),
--   'selected'
-- );

-- 9. Verificar se o contador foi atualizado automaticamente
-- SELECT 
--   id,
--   name,
--   selected_lists_count,
--   updated_at
-- FROM campaigns
-- WHERE id = (SELECT id FROM campaigns ORDER BY created_at DESC LIMIT 1);



















