-- Teste para verificar se os leads estão sendo calculados corretamente
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se existem leads nas listas selecionadas
SELECT 
  ll.id as list_id,
  ll.name as list_name,
  COUNT(l.id) as total_leads_in_list
FROM lead_lists ll
LEFT JOIN lead l ON l.list_id = ll.id
WHERE ll.id IN (
  SELECT unnest(selected_lists) 
  FROM bulk_campaigns 
  WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080'
)
GROUP BY ll.id, ll.name
ORDER BY ll.name;

-- 2. Verificar leads únicos (sem duplicatas por telefone)
WITH normalized_leads AS (
  SELECT 
    l.id,
    l.list_id,
    l.name,
    l.phone,
    l.email,
    l.company,
    l.position,
    -- Normalizar telefone (remover caracteres especiais)
    REGEXP_REPLACE(l.phone, '[^0-9]', '', 'g') as normalized_phone
  FROM lead l
  WHERE l.list_id IN (
    SELECT unnest(selected_lists) 
    FROM bulk_campaigns 
    WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080'
  )
),
unique_leads AS (
  SELECT DISTINCT ON (normalized_phone)
    id,
    list_id,
    name,
    phone,
    email,
    company,
    position,
    normalized_phone
  FROM normalized_leads
  WHERE normalized_phone IS NOT NULL 
    AND normalized_phone != ''
  ORDER BY normalized_phone, id
)
SELECT 
  COUNT(*) as unique_leads_count,
  COUNT(DISTINCT list_id) as unique_lists_count
FROM unique_leads;

-- 3. Verificar se há leads na tabela campaign_leads
SELECT 
  COUNT(*) as total_campaign_leads,
  COUNT(DISTINCT lead_hash) as unique_campaign_leads,
  COUNT(DISTINCT list_id) as unique_lists_in_campaign
FROM campaign_leads 
WHERE campaign_id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';

-- 4. Inserir leads manualmente para testar
-- Primeiro, vamos limpar leads existentes
DELETE FROM campaign_leads 
WHERE campaign_id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';

-- Inserir leads únicos manualmente
INSERT INTO campaign_leads (campaign_id, list_id, lead_data, lead_hash)
SELECT 
  '7c0c9e83-accd-4cb2-a2e0-edf6397ef080' as campaign_id,
  l.list_id,
  jsonb_build_object(
    'id', l.id,
    'name', l.name,
    'phone', l.phone,
    'email', l.email,
    'company', l.company,
    'position', l.position
  ) as lead_data,
  -- Criar hash único baseado no telefone normalizado
  md5(REGEXP_REPLACE(l.phone, '[^0-9]', '', 'g')) as lead_hash
FROM (
  SELECT DISTINCT ON (REGEXP_REPLACE(phone, '[^0-9]', '', 'g'))
    id,
    list_id,
    name,
    phone,
    email,
    company,
    position
  FROM lead
  WHERE list_id IN (
    SELECT unnest(selected_lists) 
    FROM bulk_campaigns 
    WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080'
  )
    AND phone IS NOT NULL 
    AND phone != ''
  ORDER BY REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), id
) l;

-- 5. Verificar se os leads foram inseridos
SELECT 
  COUNT(*) as total_campaign_leads,
  COUNT(DISTINCT lead_hash) as unique_campaign_leads
FROM campaign_leads 
WHERE campaign_id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';

-- 6. Testar a função SQL novamente
SELECT update_campaign_unique_leads_count('7c0c9e83-accd-4cb2-a2e0-edf6397ef080');

-- 7. Verificar se a campanha foi atualizada
SELECT 
  id,
  name,
  unique_leads_count,
  total_leads,
  updated_at
FROM bulk_campaigns 
WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';
