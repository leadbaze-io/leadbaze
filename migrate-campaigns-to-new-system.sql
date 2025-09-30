-- Script para migrar campanhas da tabela bulk_campaigns (antiga) para campaigns (nova)
-- Execute este SQL no Supabase

-- 1. Verificar se a tabela bulk_campaigns existe e tem dados
SELECT 
  'bulk_campaigns' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN user_id = 'ce480f61-74a5-4ce7-bbab-3ee386f8f776' THEN 1 END) as user_records
FROM bulk_campaigns;

-- 2. Verificar dados na tabela bulk_campaigns
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

-- 3. Migrar campanhas da tabela antiga para a nova
INSERT INTO campaigns (id, user_id, name, message, status, total_leads, unique_leads, selected_lists_count, ignored_lists_count, created_at, updated_at)
SELECT 
  id,
  user_id,
  name,
  COALESCE(message, '') as message,
  COALESCE(status, 'draft') as status,
  COALESCE(total_leads, 0) as total_leads,
  COALESCE(total_leads, 0) as unique_leads, -- Assumindo que total_leads = unique_leads
  COALESCE(array_length(selected_lists, 1), 0) as selected_lists_count,
  COALESCE(array_length(ignored_lists, 1), 0) as ignored_lists_count,
  created_at,
  updated_at
FROM bulk_campaigns
WHERE user_id = 'ce480f61-74a5-4ce7-bbab-3ee386f8f776'
ON CONFLICT (id) DO NOTHING;

-- 4. Verificar se a migração funcionou
SELECT 
  'campaigns' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN user_id = 'ce480f61-74a5-4ce7-bbab-3ee386f8f776' THEN 1 END) as user_records
FROM campaigns;

-- 5. Verificar campanhas migradas
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



















