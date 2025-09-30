-- Script para debugar autenticação do usuário
-- Execute este SQL no Supabase

-- 1. Verificar usuários disponíveis
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Verificar campanhas com user_id específico
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

-- 3. Verificar todas as campanhas
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

-- 4. Verificar se há campanhas sem user_id
SELECT 
  COUNT(*) as campaigns_without_user_id
FROM campaigns
WHERE user_id IS NULL;

-- 5. Verificar se há campanhas com user_id
SELECT 
  COUNT(*) as campaigns_with_user_id
FROM campaigns
WHERE user_id IS NOT NULL;



















