-- Script para corrigir os contadores de leads únicos
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, vamos verificar se existem leads na tabela campaign_leads
SELECT 
  campaign_id,
  COUNT(*) as total_leads,
  COUNT(DISTINCT lead_hash) as unique_leads
FROM campaign_leads 
GROUP BY campaign_id
ORDER BY campaign_id;

-- 2. Atualizar manualmente o contador de leads únicos para cada campanha
UPDATE bulk_campaigns 
SET 
  unique_leads_count = (
    SELECT COUNT(DISTINCT lead_hash)
    FROM campaign_leads 
    WHERE campaign_id = bulk_campaigns.id
  ),
  updated_at = NOW()
WHERE id IN (
  SELECT DISTINCT campaign_id 
  FROM campaign_leads
);

-- 3. Verificar se a atualização funcionou
SELECT 
  id,
  name,
  selected_lists_count,
  ignored_lists_count,
  unique_leads_count,
  total_leads
FROM bulk_campaigns 
ORDER BY created_at DESC
LIMIT 5;

-- 4. Testar a função SQL diretamente
SELECT update_campaign_unique_leads_count('7c0c9e83-accd-4cb2-a2e0-edf6397ef080');

-- 5. Verificar se a função funcionou
SELECT 
  id,
  name,
  unique_leads_count
FROM bulk_campaigns 
WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';

-- 6. Se ainda estiver 0, vamos verificar se há leads na tabela campaign_leads
SELECT 
  COUNT(*) as total_leads,
  COUNT(DISTINCT lead_hash) as unique_leads
FROM campaign_leads 
WHERE campaign_id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';

-- 7. Verificar a estrutura da tabela campaign_leads
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'campaign_leads'
ORDER BY ordinal_position;



















