-- Script para limpar campanhas de teste e começar do zero
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

-- 2. Limpar campanhas de teste
DELETE FROM campaigns 
WHERE name = 'aas1111' 
   OR name LIKE '%test%'
   OR name LIKE '%teste%';

-- 3. Verificar se foram removidas
SELECT 
  COUNT(*) as total_campaigns,
  COUNT(CASE WHEN total_leads > 0 THEN 1 END) as campaigns_with_leads,
  COUNT(CASE WHEN total_leads = 0 OR total_leads IS NULL THEN 1 END) as empty_campaigns
FROM campaigns;

-- 4. Verificar se há listas disponíveis
SELECT 
  id,
  name,
  total_leads,
  created_at
FROM lead_lists
ORDER BY created_at DESC
LIMIT 5;

-- 5. Verificar dados nas tabelas relacionadas
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

-- 6. Verificar estado final
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



















