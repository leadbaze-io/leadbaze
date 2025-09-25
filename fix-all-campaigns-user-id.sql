-- Script para corrigir user_id de TODAS as campanhas
-- Execute este SQL no Supabase

-- 1. Verificar campanhas atuais (sem user_id)
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

-- 2. Atualizar TODAS as campanhas para o usuário mais recente
UPDATE campaigns 
SET user_id = 'ce480f61-74a5-4ce7-bbab-3ee386f8f776'  -- dvemarketingadm@gmail.com
WHERE user_id IS NULL;

-- 3. Verificar se a atualização funcionou
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

-- 4. Verificar contadores
SELECT 
  COUNT(*) as total_campaigns,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as campaigns_with_user_id,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as campaigns_without_user_id
FROM campaigns;

-- 5. Verificar campanhas do usuário específico
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



















