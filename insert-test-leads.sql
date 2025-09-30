-- Script para inserir leads de teste na campanha "Teste 2"
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, vamos ver as listas selecionadas da campanha "Teste 2"
SELECT 
  id,
  name,
  selected_lists,
  ignored_lists
FROM bulk_campaigns 
WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';

-- 2. Limpar leads existentes da campanha "Teste 2"
DELETE FROM campaign_leads 
WHERE campaign_id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';

-- 3. Inserir leads de teste baseados nos dados existentes de outras campanhas
-- Vamos usar dados similares aos que já existem
INSERT INTO campaign_leads (campaign_id, list_id, lead_data, lead_hash)
VALUES 
  ('7c0c9e83-accd-4cb2-a2e0-edf6397ef080', '4950fbf5-7f2d-433e-8f18-26ca05e76010', 
   '{"id": "test1", "name": "Teste Lead 1", "phone": "553133566788", "email": "teste1@email.com", "company": "Empresa Teste 1", "position": "Gerente"}', 
   'test1-553133566788'),
  ('7c0c9e83-accd-4cb2-a2e0-edf6397ef080', '4950fbf5-7f2d-433e-8f18-26ca05e76010', 
   '{"id": "test2", "name": "Teste Lead 2", "phone": "553133983106", "email": "teste2@email.com", "company": "Empresa Teste 2", "position": "Diretor"}', 
   'test2-553133983106'),
  ('7c0c9e83-accd-4cb2-a2e0-edf6397ef080', '7651ff90-4c0b-46bb-8c2e-a7f53f697b8d', 
   '{"id": "test3", "name": "Teste Lead 3", "phone": "553133245369", "email": "teste3@email.com", "company": "Empresa Teste 3", "position": "Analista"}', 
   'test3-553133245369'),
  ('7c0c9e83-accd-4cb2-a2e0-edf6397ef080', '7651ff90-4c0b-46bb-8c2e-a7f53f697b8d', 
   '{"id": "test4", "name": "Teste Lead 4", "phone": "5531993866785", "email": "teste4@email.com", "company": "Empresa Teste 4", "position": "Coordenador"}', 
   'test4-5531993866785'),
  ('7c0c9e83-accd-4cb2-a2e0-edf6397ef080', '7651ff90-4c0b-46bb-8c2e-a7f53f697b8d', 
   '{"id": "test5", "name": "Teste Lead 5", "phone": "5531996413716", "email": "teste5@email.com", "company": "Empresa Teste 5", "position": "Supervisor"}', 
   'test5-5531996413716');

-- 4. Verificar se os leads foram inseridos
SELECT 
  COUNT(*) as total_campaign_leads,
  COUNT(DISTINCT lead_hash) as unique_campaign_leads,
  COUNT(DISTINCT list_id) as unique_lists
FROM campaign_leads 
WHERE campaign_id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';

-- 5. Testar a função SQL
SELECT update_campaign_unique_leads_count('7c0c9e83-accd-4cb2-a2e0-edf6397ef080');

-- 6. Verificar se a campanha foi atualizada
SELECT 
  id,
  name,
  unique_leads_count,
  total_leads,
  updated_at
FROM bulk_campaigns 
WHERE id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080';

-- 7. Verificar os leads inseridos
SELECT 
  campaign_id,
  list_id,
  lead_hash,
  lead_data->>'name' as name,
  lead_data->>'phone' as phone
FROM campaign_leads 
WHERE campaign_id = '7c0c9e83-accd-4cb2-a2e0-edf6397ef080'
ORDER BY lead_hash;