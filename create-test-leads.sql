-- Script para criar lista de teste "Teste Disparo" com 2 leads
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos inserir a lista de leads
INSERT INTO lead_lists (name, description, user_id, created_at, updated_at)
VALUES (
  'Teste Disparo',
  'Lista criada para testar o Disparador de campanhas',
  (SELECT id FROM auth.users WHERE email = 'creaty12345@gmail.com' LIMIT 1),
  NOW(),
  NOW()
);

-- 2. Agora vamos inserir os leads na lista
-- Primeiro lead: Jean Lopes
INSERT INTO leads (name, phone, email, company, position, lead_list_id, created_at, updated_at)
VALUES (
  'Jean Lopes',
  '31983323121',
  'jean.lopes@email.com',
  'Empresa Teste',
  'Gerente',
  (SELECT id FROM lead_lists WHERE name = 'Teste Disparo' LIMIT 1),
  NOW(),
  NOW()
);

-- Segundo lead: Matheus Moura
INSERT INTO leads (name, phone, email, company, position, lead_list_id, created_at, updated_at)
VALUES (
  'Matheus Moura',
  '3199766846',
  'matheus.moura@email.com',
  'Empresa Teste 2',
  'Analista',
  (SELECT id FROM lead_lists WHERE name = 'Teste Disparo' LIMIT 1),
  NOW(),
  NOW()
);

-- 3. Verificar se os dados foram inseridos corretamente
SELECT 
  ll.name as lista_nome,
  l.name as lead_nome,
  l.phone as telefone,
  l.email as email
FROM lead_lists ll
JOIN leads l ON ll.id = l.lead_list_id
WHERE ll.name = 'Teste Disparo'
ORDER BY l.name;





























