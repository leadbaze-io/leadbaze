-- Script para corrigir user_id das campanhas
-- Execute este SQL no Supabase

-- 1. Verificar campanhas atuais
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

-- 2. Verificar usuário atual
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 1;

-- 3. Atualizar campanhas sem user_id para o usuário atual
UPDATE campaigns 
SET user_id = (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1)
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



















