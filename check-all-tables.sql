-- Script para verificar TODAS as tabelas e estruturas
-- Execute este script no SQL Editor do Supabase

-- 1. Listar TODAS as tabelas do banco
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Verificar estrutura da tabela contact_attempts
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'contact_attempts'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da tabela lead_lists
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'lead_lists'
ORDER BY ordinal_position;

-- 4. Verificar estrutura da tabela bulk_campaigns
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'bulk_campaigns'
ORDER BY ordinal_position;

-- 5. Verificar estrutura da tabela campaign_leads
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'campaign_leads'
ORDER BY ordinal_position;

-- 6. Verificar se há dados na tabela contact_attempts
SELECT COUNT(*) as total_contacts FROM contact_attempts;

-- 7. Verificar se há dados na tabela lead_lists
SELECT COUNT(*) as total_lists FROM lead_lists;

-- 8. Verificar se há dados na tabela campaign_leads
SELECT COUNT(*) as total_campaign_leads FROM campaign_leads;



















