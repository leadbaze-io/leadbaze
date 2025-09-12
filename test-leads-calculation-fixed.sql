-- Script para testar o cálculo de leads (versão corrigida)
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se existem leads nas listas selecionadas da campanha "Teste 2"
-- Primeiro, vamos ver quais listas estão selecionadas
SELECT 
  id,
  name,
  selected_lists,
  ignored_lists
FROM bulk_campaigns 
WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';

-- 2. Verificar se existem dados nas listas selecionadas
-- Vamos assumir que os dados estão em uma tabela chamada "contacts" ou similar
-- Primeiro, vamos ver todas as tabelas que podem conter dados de contato
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND (table_name LIKE '%contact%' OR table_name LIKE '%lead%' OR table_name LIKE '%person%' OR table_name LIKE '%client%')
ORDER BY table_name;

-- 3. Verificar estrutura da tabela contact_attempts
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'contact_attempts'
ORDER BY ordinal_position;

-- 4. Verificar se há dados na tabela contact_attempts
SELECT 
  COUNT(*) as total_contacts,
  COUNT(DISTINCT phone) as unique_phones,
  COUNT(DISTINCT list_id) as unique_lists
FROM contact_attempts;

-- 5. Verificar alguns exemplos de dados
SELECT 
  id,
  list_id,
  phone,
  name,
  email
FROM contact_attempts
LIMIT 5;

-- 6. Verificar se há dados para as listas selecionadas da campanha "Teste 2"
-- Vamos usar um exemplo de list_id para testar
SELECT 
  list_id,
  COUNT(*) as total_contacts,
  COUNT(DISTINCT phone) as unique_phones
FROM contact_attempts
WHERE list_id IN (
  SELECT unnest(selected_lists) 
  FROM bulk_campaigns 
  WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080'
)
GROUP BY list_id;

-- 7. Inserir leads manualmente na tabela campaign_leads para testar
-- Primeiro, vamos limpar leads existentes da campanha
DELETE FROM campaign_leads 
WHERE campaign_id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';

-- Inserir leads da tabela contact_attempts
INSERT INTO campaign_leads (campaign_id, list_id, lead_data, lead_hash)
SELECT 
  '7c0c9e83-accd-4cb2-a2e0-edf6397ef080' as campaign_id,
  ca.list_id,
  jsonb_build_object(
    'id', ca.id,
    'name', ca.name,
    'phone', ca.phone,
    'email', ca.email,
    'company', ca.company,
    'position', ca.position
  ) as lead_data,
  -- Criar hash único baseado no telefone normalizado
  md5(REGEXP_REPLACE(ca.phone, '[^0-9]', '', 'g')) as lead_hash
FROM contact_attempts ca
WHERE ca.list_id IN (
  SELECT unnest(selected_lists) 
  FROM bulk_campaigns 
  WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080'
)
  AND ca.phone IS NOT NULL 
  AND ca.phone != '';

-- 8. Verificar se os leads foram inseridos
SELECT 
  COUNT(*) as total_campaign_leads,
  COUNT(DISTINCT lead_hash) as unique_campaign_leads
FROM campaign_leads 
WHERE campaign_id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';

-- 9. Testar a função SQL
SELECT update_campaign_unique_leads_count('7c0c9e83-accd-4cb2-a2e0-edf6397ef080');

-- 10. Verificar se a campanha foi atualizada
SELECT 
  id,
  name,
  unique_leads_count,
  total_leads,
  updated_at
FROM bulk_campaigns 
WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';
