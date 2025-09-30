-- Script para recriar campanhas de teste
-- Execute este SQL no Supabase

-- 1. Inserir campanhas de teste com user_id correto
INSERT INTO campaigns (id, user_id, name, message, status, total_leads, unique_leads, selected_lists_count, ignored_lists_count, created_at, updated_at)
VALUES 
  ('d8a6d76e-0c47-403f-8b98-10236c9f53d9', 'ce480f61-74a5-4ce7-bbab-3ee386f8f776', 'aspoasksaopk', 'Mensagem de teste', 'draft', 1, 1, 1, 0, '2025-09-09 22:06:02.559407+00', '2025-09-09 22:06:02.559407+00'),
  ('7360b4d1-e5c2-4209-8da0-b03eb56f4760', 'ce480f61-74a5-4ce7-bbab-3ee386f8f776', 'Go!', 'Mensagem de teste', 'draft', 7, 7, 1, 0, '2025-09-09 15:45:59.664611+00', '2025-09-09 15:45:59.664611+00'),
  ('4bce1d2a-0d70-4104-b34d-23d6a2f1fa2a', 'ce480f61-74a5-4ce7-bbab-3ee386f8f776', 'Go Teste V5', 'Mensagem de teste', 'draft', 20, 20, 1, 0, '2025-09-09 15:24:44.96992+00', '2025-09-09 15:24:44.96992+00'),
  ('f4b5a741-7aa2-4c1d-a881-5936c538601d', 'ce480f61-74a5-4ce7-bbab-3ee386f8f776', 'Go Teste V4', 'Mensagem de teste', 'draft', 3, 3, 1, 0, '2025-09-09 15:21:47.747023+00', '2025-09-09 15:21:47.747023+00'),
  ('e27adf2f-d9e7-4814-8530-c3eaa034857e', 'ce480f61-74a5-4ce7-bbab-3ee386f8f776', 'Estéticas Savassi BH', 'Mensagem de teste', 'draft', 29, 29, 1, 0, '2025-09-09 14:15:20.590799+00', '2025-09-09 14:15:20.590799+00');

-- 2. Verificar se as campanhas foram criadas
SELECT 
  id,
  name,
  user_id,
  status,
  total_leads,
  unique_leads,
  selected_lists_count,
  ignored_lists_count,
  created_at
FROM campaigns
ORDER BY created_at DESC;

-- 3. Verificar contadores
SELECT 
  COUNT(*) as total_campaigns,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as campaigns_with_user_id,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as campaigns_without_user_id
FROM campaigns;



















