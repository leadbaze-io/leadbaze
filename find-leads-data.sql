-- Script para encontrar onde estão os dados dos leads
-- Execute este script no SQL Editor do Supabase

-- 1. Listar TODAS as tabelas do banco
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Verificar se há dados em outras tabelas que podem conter leads
-- Vamos verificar algumas tabelas comuns
SELECT 'lead_lists' as table_name, COUNT(*) as total_records FROM lead_lists
UNION ALL
SELECT 'bulk_campaigns' as table_name, COUNT(*) as total_records FROM bulk_campaigns
UNION ALL
SELECT 'campaign_leads' as table_name, COUNT(*) as total_records FROM campaign_leads
UNION ALL
SELECT 'contact_attempts' as table_name, COUNT(*) as total_records FROM contact_attempts;

-- 3. Verificar se há dados na tabela lead_lists
SELECT 
  id,
  name,
  user_id,
  created_at
FROM lead_lists
LIMIT 5;

-- 4. Verificar se há alguma tabela que relaciona leads com listas
-- Vamos procurar por tabelas que podem conter essa relação
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND (table_name LIKE '%lead%' OR table_name LIKE '%contact%' OR table_name LIKE '%person%' OR table_name LIKE '%client%' OR table_name LIKE '%business%')
ORDER BY table_name;

-- 5. Verificar se há dados na tabela campaign_leads para outras campanhas
SELECT 
  campaign_id,
  COUNT(*) as total_leads,
  COUNT(DISTINCT list_id) as unique_lists
FROM campaign_leads
GROUP BY campaign_id
ORDER BY total_leads DESC
LIMIT 5;



















