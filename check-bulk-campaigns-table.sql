-- Script para verificar se existe a tabela bulk_campaigns (sistema antigo)
-- Execute este SQL no Supabase

-- 1. Verificar se a tabela bulk_campaigns existe
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name = 'bulk_campaigns' 
  AND table_schema = 'public';

-- 2. Se existir, verificar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'bulk_campaigns' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Se existir, verificar dados na tabela
SELECT 
  id,
  name,
  user_id,
  total_leads,
  selected_lists,
  ignored_lists,
  created_at
FROM bulk_campaigns
ORDER BY created_at DESC
LIMIT 10;

-- 4. Verificar se há campanhas do usuário atual
SELECT 
  COUNT(*) as total_campaigns,
  COUNT(CASE WHEN user_id = 'ce480f61-74a5-4ce7-bbab-3ee386f8f776' THEN 1 END) as user_campaigns
FROM bulk_campaigns;

-- 5. Verificar campanhas do usuário específico
SELECT 
  id,
  name,
  user_id,
  total_leads,
  selected_lists,
  ignored_lists,
  created_at
FROM bulk_campaigns
WHERE user_id = 'ce480f61-74a5-4ce7-bbab-3ee386f8f776'
ORDER BY created_at DESC;



















