-- Script final para limpar campanhas problemáticas
-- Execute este SQL no Supabase

-- 1. Verificar estado atual das campanhas
SELECT 
  id,
  name,
  status,
  total_leads,
  unique_leads,
  selected_lists_count,
  ignored_lists_count,
  created_at
FROM campaigns
ORDER BY created_at DESC;

-- 2. Identificar campanhas problemáticas
SELECT 
  id,
  name,
  status,
  total_leads,
  unique_leads,
  selected_lists_count,
  created_at,
  CASE 
    WHEN name LIKE '%asdasd%' THEN 'Nome suspeito'
    WHEN name LIKE '%test%' OR name LIKE '%teste%' THEN 'Dados de teste'
    WHEN (total_leads = 0 OR total_leads IS NULL) AND (unique_leads = 0 OR unique_leads IS NULL) THEN 'Sem dados'
    ELSE 'OK'
  END as problema
FROM campaigns
ORDER BY created_at DESC;

-- 3. Verificar se há dados relacionados para campanhas problemáticas
SELECT 
  c.id,
  c.name,
  c.total_leads,
  c.unique_leads,
  COUNT(cul.id) as leads_reais,
  COUNT(cl.id) as lists_reais
FROM campaigns c
LEFT JOIN campaign_unique_leads cul ON c.id = cul.campaign_id
LEFT JOIN campaign_lists cl ON c.id = cl.campaign_id
WHERE c.name LIKE '%asdasd%' 
   OR c.name LIKE '%test%'
   OR c.name LIKE '%teste%'
   OR (c.total_leads = 0 OR c.total_leads IS NULL)
GROUP BY c.id, c.name, c.total_leads, c.unique_leads
ORDER BY c.created_at DESC;

-- 4. LIMPAR CAMPANHAS COM NOMES SUSPEITOS (Execute se confirmar que são dados de teste)
DELETE FROM campaigns 
WHERE name LIKE '%asdasd%' 
   OR name LIKE '%test%'
   OR name LIKE '%teste%'
   OR name = 'Teste Disparo LeadBaze V2'
   OR name = 'Teste Ignored Lists';

-- 5. LIMPAR CAMPANHAS VAZIAS ANTIGAS (Execute se confirmar que são dados inválidos)
DELETE FROM campaigns
WHERE (total_leads = 0 OR total_leads IS NULL)
  AND (unique_leads = 0 OR unique_leads IS NULL)
  AND (selected_lists_count = 0 OR selected_lists_count IS NULL)
  AND created_at < NOW() - INTERVAL '1 hour';

-- 6. Forçar atualização de contadores das campanhas restantes
DO $$
DECLARE
  campaign_record RECORD;
BEGIN
  FOR campaign_record IN 
    SELECT id FROM campaigns
  LOOP
    PERFORM update_campaign_counters(campaign_record.id);
  END LOOP;
  
  RAISE NOTICE 'Contadores atualizados para % campanhas', (SELECT COUNT(*) FROM campaigns);
END;
$$;

-- 7. Verificar resultado final
SELECT 
  COUNT(*) as total_campaigns,
  COUNT(CASE WHEN total_leads > 0 THEN 1 END) as campaigns_with_leads,
  COUNT(CASE WHEN total_leads = 0 OR total_leads IS NULL THEN 1 END) as empty_campaigns,
  COUNT(CASE WHEN name LIKE '%asdasd%' OR name LIKE '%test%' THEN 1 END) as test_campaigns
FROM campaigns;

-- 8. Mostrar campanhas restantes
SELECT 
  id,
  name,
  status,
  total_leads,
  unique_leads,
  selected_lists_count,
  ignored_lists_count,
  created_at
FROM campaigns
ORDER BY created_at DESC;

-- 9. Verificar se os triggers estão funcionando (teste)
-- Inserir um lead de teste para verificar se o contador é atualizado
-- INSERT INTO campaign_unique_leads (campaign_id, list_id, lead_name, lead_phone, phone_hash)
-- VALUES (
--   (SELECT id FROM campaigns LIMIT 1),
--   'test-list-id',
--   'Teste Lead',
--   '11999999999',
--   'test-hash'
-- );

-- 10. Verificar se o contador foi atualizado automaticamente
-- SELECT 
--   id,
--   name,
--   total_leads,
--   unique_leads,
--   updated_at
-- FROM campaigns
-- WHERE id = (SELECT id FROM campaigns LIMIT 1);



















