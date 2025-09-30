-- Script para verificar se o problema das campanhas foi resolvido
-- Execute este SQL no Supabase

-- 1. Verificar todas as campanhas
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

-- 2. Verificar campanhas do usuário atual
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
WHERE user_id = 'ce480f61-74a5-4ce7-bbab-3ee386f8f776'
ORDER BY created_at DESC;

-- 3. Verificar dados nas tabelas relacionadas
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
WHERE c.user_id = 'ce480f61-74a5-4ce7-bbab-3ee386f8f776'
GROUP BY c.id, c.name, c.total_leads, c.unique_leads, c.selected_lists_count
ORDER BY c.created_at DESC;

-- 5. Verificar se há listas disponíveis
SELECT 
  id,
  name,
  total_leads,
  created_at
FROM lead_lists
ORDER BY created_at DESC
LIMIT 5;

-- 6. Verificar se há dados nas tabelas relacionadas para as campanhas
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



















