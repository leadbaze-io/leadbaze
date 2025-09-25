-- Script para corrigir user_id das campanhas com usuário específico
-- Execute este SQL no Supabase

-- 1. Verificar campanhas atuais com user_id
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

-- 2. Verificar campanhas sem user_id
SELECT 
  id,
  name,
  user_id,
  status,
  total_leads,
  created_at
FROM campaigns
WHERE user_id IS NULL
ORDER BY created_at DESC;

-- 3. Atualizar campanhas sem user_id para o usuário mais recente
UPDATE campaigns 
SET user_id = 'ce480f61-74a5-4ce7-bbab-3ee386f8f776'  -- dvemarketingadm@gmail.com (mais recente)
WHERE user_id IS NULL;

-- 4. Verificar se a atualização funcionou
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

-- 5. Verificar se há campanhas sem user_id
SELECT 
  COUNT(*) as campaigns_without_user_id
FROM campaigns
WHERE user_id IS NULL;

-- 6. Verificar se há campanhas com user_id
SELECT 
  COUNT(*) as campaigns_with_user_id
FROM campaigns
WHERE user_id IS NOT NULL;

-- 7. Verificar campanhas do usuário específico
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



















