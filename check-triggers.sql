-- Verificar triggers ativos na tabela campaign_leads
-- Execute este SQL no Supabase

-- 1. Verificar triggers
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'campaign_leads';

-- 2. Verificar funções relacionadas
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%campaign%' 
OR routine_name LIKE '%lead%';
