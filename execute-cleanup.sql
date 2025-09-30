-- Script simples para executar a limpeza das campanhas problemáticas
-- Execute este SQL no Supabase

-- 1. Ver campanhas atuais
SELECT 
  id,
  name,
  total_leads,
  unique_leads,
  selected_lists_count,
  created_at
FROM campaigns
ORDER BY created_at DESC;

-- 2. Limpar campanhas com nomes suspeitos
DELETE FROM campaigns 
WHERE name LIKE '%asdasd%' 
   OR name LIKE '%test%'
   OR name LIKE '%teste%'
   OR name = 'Teste Disparo LeadBaze V2'
   OR name = 'Teste Ignored Lists';

-- 3. Limpar campanhas vazias antigas
DELETE FROM campaigns
WHERE (total_leads = 0 OR total_leads IS NULL)
  AND (unique_leads = 0 OR unique_leads IS NULL)
  AND (selected_lists_count = 0 OR selected_lists_count IS NULL)
  AND created_at < NOW() - INTERVAL '1 hour';

-- 4. Atualizar contadores das campanhas restantes
DO $$
DECLARE
  campaign_record RECORD;
BEGIN
  FOR campaign_record IN 
    SELECT id FROM campaigns
  LOOP
    PERFORM update_campaign_counters(campaign_record.id);
  END LOOP;
END;
$$;

-- 5. Ver resultado final
SELECT 
  COUNT(*) as total_campaigns,
  COUNT(CASE WHEN total_leads > 0 THEN 1 END) as campaigns_with_leads,
  COUNT(CASE WHEN total_leads = 0 OR total_leads IS NULL THEN 1 END) as empty_campaigns
FROM campaigns;

-- 6. Mostrar campanhas restantes
SELECT 
  id,
  name,
  status,
  total_leads,
  unique_leads,
  selected_lists_count,
  created_at
FROM campaigns
ORDER BY created_at DESC;



















