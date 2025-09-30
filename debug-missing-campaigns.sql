-- Script para debugar campanhas desaparecidas
-- Execute este SQL no Supabase

-- 1. Verificar se a tabela campaigns existe e está vazia
SELECT 
  COUNT(*) as total_campaigns,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as campaigns_with_user_id,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as campaigns_without_user_id
FROM campaigns;

-- 2. Verificar todas as campanhas (se existirem)
SELECT 
  id,
  name,
  user_id,
  status,
  total_leads,
  unique_leads,
  selected_lists_count,
  ignored_lists_count,
  created_at
FROM campaigns
ORDER BY created_at DESC;

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

-- 4. Verificar se há campanhas órfãs (campaign_id que não existem na tabela campaigns)
SELECT 
  'campaign_unique_leads' as table_name,
  cul.campaign_id,
  COUNT(*) as records_count
FROM campaign_unique_leads cul
LEFT JOIN campaigns c ON cul.campaign_id = c.id
WHERE c.id IS NULL
GROUP BY cul.campaign_id
UNION ALL
SELECT 
  'campaign_lists' as table_name,
  cl.campaign_id,
  COUNT(*) as records_count
FROM campaign_lists cl
LEFT JOIN campaigns c ON cl.campaign_id = c.id
WHERE c.id IS NULL
GROUP BY cl.campaign_id;

-- 5. Verificar se há listas disponíveis
SELECT 
  id,
  name,
  total_leads,
  created_at
FROM lead_lists
ORDER BY created_at DESC
LIMIT 5;

-- 6. Verificar usuários
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;



















