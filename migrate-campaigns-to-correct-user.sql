-- Script para migrar campanhas para o usuário correto
-- Execute este SQL no Supabase

-- 1. Verificar usuários disponíveis
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Verificar campanhas atuais
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

-- 3. Atualizar campanhas para o usuário correto (creaty12345@gmail.com)
UPDATE campaigns 
SET user_id = '7f90037e-5cff-4086-b6d7-4b48a796104b'  -- creaty12345@gmail.com
WHERE user_id = 'ce480f61-74a5-4ce7-bbab-3ee386f8f776';  -- dvemarketingadm@gmail.com

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
WHERE user_id = '7f90037e-5cff-4086-b6d7-4b48a796104b'
ORDER BY created_at DESC;

-- 5. Verificar contadores
SELECT 
  COUNT(*) as total_campaigns,
  COUNT(CASE WHEN user_id = '7f90037e-5cff-4086-b6d7-4b48a796104b' THEN 1 END) as user_campaigns
FROM campaigns;



















