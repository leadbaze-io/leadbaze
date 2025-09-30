-- Script para debugar as novas campanhas criadas
-- Execute este SQL no Supabase

-- 1. Verificar todas as campanhas atuais
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

-- 3. Verificar dados específicos das campanhas
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

-- 4. Verificar se os triggers estão funcionando
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('campaign_unique_leads', 'campaign_lists')
  AND trigger_name LIKE '%counter%';

-- 5. Testar se a função update_campaign_counters está funcionando
SELECT 
  id,
  name,
  total_leads,
  unique_leads,
  selected_lists_count
FROM campaigns
ORDER BY created_at DESC
LIMIT 2;

-- 6. Forçar atualização manual dos contadores
DO $$
DECLARE
  campaign_record RECORD;
BEGIN
  FOR campaign_record IN 
    SELECT id FROM campaigns
  LOOP
    PERFORM update_campaign_counters(campaign_record.id);
    RAISE NOTICE 'Atualizado contadores para campanha: %', campaign_record.id;
  END LOOP;
END;
$$;

-- 7. Verificar se os contadores foram atualizados
SELECT 
  id,
  name,
  total_leads,
  unique_leads,
  selected_lists_count,
  updated_at
FROM campaigns
ORDER BY updated_at DESC;

-- 8. Verificar se há problema na função update_campaign_counters
SELECT 
  p.proname as function_name,
  pg_get_function_result(p.oid) as return_type,
  pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'update_campaign_counters';



















