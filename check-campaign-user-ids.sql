-- Script para verificar user_id das campanhas
-- Execute este SQL no Supabase

-- 1. Verificar todas as campanhas com user_id
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
LIMIT 5;

-- 3. Verificar campanhas sem user_id
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

-- 4. Verificar campanhas com user_id diferente do atual
SELECT 
  c.id,
  c.name,
  c.user_id,
  c.status,
  c.total_leads,
  c.created_at,
  u.email as user_email
FROM campaigns c
LEFT JOIN auth.users u ON c.user_id = u.id
ORDER BY c.created_at DESC;

-- 5. Atualizar campanhas sem user_id para o usuário atual
-- (Execute apenas se quiser corrigir)
-- UPDATE campaigns 
-- SET user_id = (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1)
-- WHERE user_id IS NULL;

-- 6. Verificar se a atualização funcionou
-- SELECT 
--   id,
--   name,
--   user_id,
--   status,
--   total_leads,
--   created_at
-- FROM campaigns
-- ORDER BY created_at DESC;



















