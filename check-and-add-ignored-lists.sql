-- Script para verificar a estrutura da tabela bulk_campaigns e adicionar o campo ignored_lists
-- Execute este script no SQL Editor do Supabase

-- ==============================================
-- 1. VERIFICAR ESTRUTURA ATUAL DA TABELA
-- ==============================================
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'bulk_campaigns'
ORDER BY ordinal_position;

-- ==============================================
-- 2. VERIFICAR DADOS EXISTENTES
-- ==============================================
SELECT 
  id,
  name,
  selected_lists,
  total_leads,
  status,
  created_at
FROM bulk_campaigns
ORDER BY created_at DESC
LIMIT 5;

-- ==============================================
-- 3. ADICIONAR CAMPO ignored_lists
-- ==============================================
ALTER TABLE bulk_campaigns 
ADD COLUMN IF NOT EXISTS ignored_lists TEXT[] DEFAULT '{}';

-- ==============================================
-- 4. VERIFICAR SE O CAMPO FOI ADICIONADO
-- ==============================================
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'bulk_campaigns' 
  AND column_name = 'ignored_lists';

-- ==============================================
-- 5. ATUALIZAR COMENTÁRIO DO CAMPO
-- ==============================================
COMMENT ON COLUMN bulk_campaigns.ignored_lists IS 'Array com IDs das listas ignoradas (duplicadas)';

-- ==============================================
-- 6. VERIFICAR ESTRUTURA FINAL
-- ==============================================
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'bulk_campaigns'
ORDER BY ordinal_position;




















