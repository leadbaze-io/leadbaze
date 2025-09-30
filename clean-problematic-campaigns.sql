-- Script para limpar campanhas problemáticas
-- Execute este SQL no Supabase

-- 1. Primeiro, vamos ver exatamente o que temos
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
ORDER BY created_at DESC
LIMIT 10;

-- 2. Verificar campanhas com nomes suspeitos
SELECT 
  id,
  name,
  status,
  total_leads,
  unique_leads,
  created_at
FROM campaigns
WHERE name LIKE '%asdasd%' 
   OR name LIKE '%test%'
   OR name LIKE '%teste%'
   OR name = 'Teste Disparo LeadBaze V2'
   OR name = 'Teste Ignored Lists'
ORDER BY created_at DESC;

-- 3. Verificar campanhas vazias (sem leads)
SELECT 
  id,
  name,
  status,
  total_leads,
  unique_leads,
  selected_lists_count,
  created_at
FROM campaigns
WHERE (total_leads = 0 OR total_leads IS NULL)
  AND (unique_leads = 0 OR unique_leads IS NULL)
  AND (selected_lists_count = 0 OR selected_lists_count IS NULL)
ORDER BY created_at DESC;

-- 4. Verificar se há dados relacionados para essas campanhas
SELECT 
  c.id,
  c.name,
  COUNT(cul.id) as leads_count,
  COUNT(cl.id) as lists_count
FROM campaigns c
LEFT JOIN campaign_unique_leads cul ON c.id = cul.campaign_id
LEFT JOIN campaign_lists cl ON c.id = cl.campaign_id
WHERE c.name LIKE '%asdasd%' 
   OR c.name LIKE '%test%'
   OR c.name LIKE '%teste%'
   OR (c.total_leads = 0 OR c.total_leads IS NULL)
GROUP BY c.id, c.name
ORDER BY c.created_at DESC;

-- 5. LIMPAR CAMPANHAS PROBLEMÁTICAS (Execute apenas se confirmar que são dados de teste)
-- DELETE FROM campaigns 
-- WHERE name LIKE '%asdasd%' 
--    OR name LIKE '%test%'
--    OR name LIKE '%teste%'
--    OR name = 'Teste Disparo LeadBaze V2'
--    OR name = 'Teste Ignored Lists';

-- 6. LIMPAR CAMPANHAS VAZIAS (Execute apenas se confirmar que são dados inválidos)
-- DELETE FROM campaigns
-- WHERE (total_leads = 0 OR total_leads IS NULL)
--   AND (unique_leads = 0 OR unique_leads IS NULL)
--   AND (selected_lists_count = 0 OR selected_lists_count IS NULL)
--   AND created_at < NOW() - INTERVAL '1 hour'; -- Apenas campanhas antigas

-- 7. Verificar se a limpeza foi bem-sucedida
SELECT 
  COUNT(*) as total_campaigns,
  COUNT(CASE WHEN total_leads > 0 THEN 1 END) as campaigns_with_leads,
  COUNT(CASE WHEN total_leads = 0 OR total_leads IS NULL THEN 1 END) as empty_campaigns
FROM campaigns;

-- 8. Verificar campanhas restantes
SELECT 
  id,
  name,
  status,
  total_leads,
  unique_leads,
  selected_lists_count,
  created_at
FROM campaigns
ORDER BY created_at DESC;



















