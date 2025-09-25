-- Teste dos novos campos da campanha
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se os novos campos existem na tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'bulk_campaigns' 
  AND column_name IN ('unique_leads_count', 'selected_lists_count', 'ignored_lists_count')
ORDER BY column_name;

-- 2. Verificar dados de uma campanha específica
SELECT 
  id,
  name,
  selected_lists,
  ignored_lists,
  total_leads,
  selected_lists_count,
  ignored_lists_count,
  unique_leads_count,
  created_at,
  updated_at
FROM bulk_campaigns 
WHERE name = 'Teste 2'
LIMIT 1;

-- 3. Testar a função SQL para atualizar contadores
SELECT update_campaign_unique_leads_count('7c0c9e83-accd-4cb2-a2e0-edf6397ef080');

-- 4. Verificar se a função atualizou os contadores
SELECT 
  id,
  name,
  unique_leads_count,
  selected_lists_count,
  ignored_lists_count,
  total_leads
FROM bulk_campaigns 
WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';

-- 5. Contar leads reais na tabela campaign_leads para comparar
SELECT 
  COUNT(*) as leads_reais,
  COUNT(DISTINCT lead_hash) as leads_unicos
FROM campaign_leads 
WHERE campaign_id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';

-- 6. Verificar todas as campanhas e seus contadores
SELECT 
  id,
  name,
  selected_lists_count,
  ignored_lists_count,
  unique_leads_count,
  total_leads,
  array_length(selected_lists, 1) as selected_lists_array_length,
  array_length(ignored_lists, 1) as ignored_lists_array_length
FROM bulk_campaigns 
ORDER BY created_at DESC
LIMIT 5;

-- 7. Atualizar contadores de todas as campanhas
UPDATE bulk_campaigns 
SET 
  selected_lists_count = COALESCE(array_length(selected_lists, 1), 0),
  ignored_lists_count = COALESCE(array_length(ignored_lists, 1), 0),
  updated_at = NOW();

-- 8. Verificar se os contadores foram atualizados
SELECT 
  id,
  name,
  selected_lists_count,
  ignored_lists_count,
  unique_leads_count
FROM bulk_campaigns 
ORDER BY created_at DESC
LIMIT 5;



















