-- Script para verificar onde estão os dados dos leads
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar todas as tabelas que podem conter dados de leads
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Verificar estrutura da tabela lead_lists
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'lead_lists'
ORDER BY ordinal_position;

-- 3. Verificar dados na tabela lead_lists
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
  AND (table_name LIKE '%lead%' OR table_name LIKE '%contact%' OR table_name LIKE '%person%' OR table_name LIKE '%client%')
ORDER BY table_name;

-- 5. Verificar se há dados na tabela contact_attempts
SELECT 
  COUNT(*) as total_contacts,
  COUNT(DISTINCT list_id) as unique_lists
FROM contact_attempts;

-- 6. Verificar alguns exemplos de dados na tabela contact_attempts
SELECT *
FROM contact_attempts
LIMIT 3;

-- 7. Verificar se há dados na tabela campaign_leads
SELECT 
  COUNT(*) as total_campaign_leads,
  COUNT(DISTINCT campaign_id) as unique_campaigns,
  COUNT(DISTINCT list_id) as unique_lists
FROM campaign_leads;

-- 8. Verificar alguns exemplos de dados na tabela campaign_leads
SELECT 
  campaign_id,
  list_id,
  lead_hash,
  lead_data->>'name' as name,
  lead_data->>'phone' as phone
FROM campaign_leads
LIMIT 5;



















