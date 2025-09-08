-- Script para criar campanha de teste "Teste Disparo LeadBaze V2"
-- Com os leads fornecidos pelo usuário

-- Primeiro, vamos criar uma lista de leads para a campanha
INSERT INTO lead_lists (
  id,
  user_id,
  name,
  description,
  total_leads,
  leads,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'creaty12345@gmail.com' LIMIT 1),
  'Lista Teste V2 - Jean, Mateus, Danilo, Rafael',
  'Lista de teste criada para campanha V2',
  4,
  '[
    {
      "id": "lead-jean-lopes-v2",
      "name": "Jean Lopes",
      "phone": "31983323121",
      "address": "Belo Horizonte, MG",
      "rating": 4.8,
      "reviews_count": 150,
      "website": "https://jeanlopes.com",
      "business_type": "Consultoria"
    },
    {
      "id": "lead-mateus-moura-v2",
      "name": "Mateus Moura",
      "phone": "31999766846",
      "address": "Belo Horizonte, MG",
      "rating": 4.5,
      "reviews_count": 89,
      "website": "https://mateusmoura.com",
      "business_type": "Desenvolvimento"
    },
    {
      "id": "lead-danilo-v2",
      "name": "Danilo",
      "phone": "31983528585",
      "address": "Belo Horizonte, MG",
      "rating": 4.2,
      "reviews_count": 45,
      "website": null,
      "business_type": "Marketing"
    },
    {
      "id": "lead-rafael-v2",
      "name": "Rafael",
      "phone": "31996609993",
      "address": "Belo Horizonte, MG",
      "rating": 4.7,
      "reviews_count": 120,
      "website": "https://rafael.com",
      "business_type": "Design"
    }
  ]'::jsonb,
  now(),
  now()
);

-- Agora vamos criar a campanha
INSERT INTO bulk_campaigns (
  id,
  user_id,
  name,
  message,
  selected_lists,
  total_leads,
  status,
  scheduled_at,
  sent_at,
  completed_at,
  success_count,
  failed_count,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'creaty12345@gmail.com' LIMIT 1),
  'Teste Disparo LeadBaze V2',
  'Olá! Esta é uma mensagem de teste do LeadBaze V2. Como você está?',
  ARRAY[(SELECT id FROM lead_lists WHERE name = 'Lista Teste V2 - Jean, Mateus, Danilo, Rafael' ORDER BY created_at DESC LIMIT 1)],
  4,
  'completed',
  now(),
  now() - interval '2 minutes',
  now(),
  4,
  0,
  now(),
  now()
);

-- Inserir os leads na tabela campaign_leads
INSERT INTO campaign_leads (
  id,
  campaign_id,
  list_id,
  lead_data,
  lead_hash,
  added_at
) VALUES 
  (
    gen_random_uuid(),
    (SELECT id FROM bulk_campaigns WHERE name = 'Teste Disparo LeadBaze V2' ORDER BY created_at DESC LIMIT 1),
    (SELECT id FROM lead_lists WHERE name = 'Lista Teste V2 - Jean, Mateus, Danilo, Rafael' ORDER BY created_at DESC LIMIT 1),
    '{
      "id": "lead-jean-lopes-v2",
      "name": "Jean Lopes",
      "phone": "31983323121",
      "address": "Belo Horizonte, MG",
      "rating": 4.8,
      "reviews_count": 150,
      "website": "https://jeanlopes.com",
      "business_type": "Consultoria"
    }'::jsonb,
    md5('Jean Lopes31983323121'),
    now()
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM bulk_campaigns WHERE name = 'Teste Disparo LeadBaze V2' ORDER BY created_at DESC LIMIT 1),
    (SELECT id FROM lead_lists WHERE name = 'Lista Teste V2 - Jean, Mateus, Danilo, Rafael' ORDER BY created_at DESC LIMIT 1),
    '{
      "id": "lead-mateus-moura-v2",
      "name": "Mateus Moura",
      "phone": "31999766846",
      "address": "Belo Horizonte, MG",
      "rating": 4.5,
      "reviews_count": 89,
      "website": "https://mateusmoura.com",
      "business_type": "Desenvolvimento"
    }'::jsonb,
    md5('Mateus Moura31999766846'),
    now()
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM bulk_campaigns WHERE name = 'Teste Disparo LeadBaze V2' ORDER BY created_at DESC LIMIT 1),
    (SELECT id FROM lead_lists WHERE name = 'Lista Teste V2 - Jean, Mateus, Danilo, Rafael' ORDER BY created_at DESC LIMIT 1),
    '{
      "id": "lead-danilo-v2",
      "name": "Danilo",
      "phone": "31983528585",
      "address": "Belo Horizonte, MG",
      "rating": 4.2,
      "reviews_count": 45,
      "website": null,
      "business_type": "Marketing"
    }'::jsonb,
    md5('Danilo31983528585'),
    now()
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM bulk_campaigns WHERE name = 'Teste Disparo LeadBaze V2' ORDER BY created_at DESC LIMIT 1),
    (SELECT id FROM lead_lists WHERE name = 'Lista Teste V2 - Jean, Mateus, Danilo, Rafael' ORDER BY created_at DESC LIMIT 1),
    '{
      "id": "lead-rafael-v2",
      "name": "Rafael",
      "phone": "31996609993",
      "address": "Belo Horizonte, MG",
      "rating": 4.7,
      "reviews_count": 120,
      "website": "https://rafael.com",
      "business_type": "Design"
    }'::jsonb,
    md5('Rafael31996609993'),
    now()
  );

-- Verificar se a campanha foi criada
SELECT 
  c.id,
  c.name,
  c.status,
  c.total_leads,
  c.success_count,
  c.failed_count,
  c.created_at
FROM bulk_campaigns c
WHERE c.name = 'Teste Disparo LeadBaze V2'
ORDER BY c.created_at DESC
LIMIT 1;

-- Verificar a lista criada
SELECT 
  l.id,
  l.name,
  l.total_leads,
  l.created_at
FROM lead_lists l
WHERE l.name = 'Lista Teste V2 - Jean, Mateus, Danilo, Rafael'
ORDER BY l.created_at DESC
LIMIT 1;

-- Verificar os leads da campanha
SELECT 
  cl.id,
  cl.lead_data->>'name' as name,
  cl.lead_data->>'phone' as phone,
  cl.lead_data->>'business_type' as business_type,
  cl.added_at
FROM campaign_leads cl
JOIN bulk_campaigns c ON cl.campaign_id = c.id
WHERE c.name = 'Teste Disparo LeadBaze V2'
ORDER BY cl.added_at DESC;