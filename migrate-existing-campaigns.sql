-- Script para migrar campanhas existentes da tabela bulk_campaigns para campaigns
-- Execute este SQL no Supabase

-- 1. Migrar as campanhas existentes
INSERT INTO campaigns (id, user_id, name, message, status, total_leads, unique_leads, selected_lists_count, ignored_lists_count, created_at, updated_at)
VALUES 
  ('c7402e33-332b-436e-a747-d5eb4bd4a142', 'ce480f61-74a5-4ce7-bbab-3ee386f8f776', 'iojasoiasj', '', 'draft', 1, 1, 1, 0, '2025-09-09 22:06:12.851+00', '2025-09-09 22:06:12.851+00'),
  ('6728516f-5b22-4c29-8f26-a7389de7ef08', 'ce480f61-74a5-4ce7-bbab-3ee386f8f776', 'Agência de Intercâmbio Sudeste DVE MKT', '', 'draft', 26, 26, 1, 0, '2025-09-09 13:34:53.609+00', '2025-09-09 13:34:53.609+00')
ON CONFLICT (id) DO NOTHING;

-- 2. Verificar se a migração funcionou
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
WHERE user_id = 'ce480f61-74a5-4ce7-bbab-3ee386f8f776'
ORDER BY created_at DESC;

-- 3. Verificar contadores
SELECT 
  COUNT(*) as total_campaigns,
  COUNT(CASE WHEN user_id = 'ce480f61-74a5-4ce7-bbab-3ee386f8f776' THEN 1 END) as user_campaigns
FROM campaigns;



















