-- Debug da função SQL update_campaign_unique_leads_count
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a função existe
SELECT 
  routine_name, 
  routine_type, 
  data_type
FROM information_schema.routines 
WHERE routine_name = 'update_campaign_unique_leads_count';

-- 2. Verificar se há leads na tabela campaign_leads para a campanha
SELECT 
  campaign_id,
  COUNT(*) as total_leads,
  COUNT(DISTINCT lead_hash) as unique_leads,
  COUNT(DISTINCT list_id) as unique_lists
FROM campaign_leads 
WHERE campaign_id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080'
GROUP BY campaign_id;

-- 3. Verificar a estrutura da tabela campaign_leads
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'campaign_leads'
ORDER BY ordinal_position;

-- 4. Testar a função SQL diretamente
SELECT update_campaign_unique_leads_count('7c0c9e83-accd-4cb2-a2e0-edf6397ef080');

-- 5. Verificar se a função atualizou a campanha
SELECT 
  id,
  name,
  unique_leads_count,
  total_leads,
  updated_at
FROM bulk_campaigns 
WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';

-- 6. Recriar a função com debug
CREATE OR REPLACE FUNCTION update_campaign_unique_leads_count(campaign_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    v_unique_leads_count INTEGER;
    v_total_leads INTEGER;
BEGIN
    -- Contar leads únicos
    SELECT COUNT(DISTINCT lead_hash)
    INTO v_unique_leads_count
    FROM campaign_leads
    WHERE campaign_id = campaign_uuid;

    -- Contar total de leads
    SELECT COUNT(*)
    INTO v_total_leads
    FROM campaign_leads
    WHERE campaign_id = campaign_uuid;

    -- Debug: mostrar valores
    RAISE NOTICE 'Campaign ID: %, Unique leads: %, Total leads: %', campaign_uuid, v_unique_leads_count, v_total_leads;

    -- Atualizar a campanha
    UPDATE bulk_campaigns
    SET 
        unique_leads_count = v_unique_leads_count,
        total_leads = v_total_leads,
        updated_at = NOW()
    WHERE id = campaign_uuid;

    -- Retornar o número de leads únicos
    RETURN v_unique_leads_count;
END;
$$ LANGUAGE plpgsql;

-- 7. Testar a função recriada
SELECT update_campaign_unique_leads_count('7c0c9e83-accd-4cb2-a2e0-edf6397ef080');

-- 8. Verificar se funcionou
SELECT 
  id,
  name,
  unique_leads_count,
  total_leads,
  updated_at
FROM bulk_campaigns 
WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';



















