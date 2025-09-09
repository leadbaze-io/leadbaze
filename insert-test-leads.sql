-- Script simplificado para inserir lista de teste
-- Execute no Supabase SQL Editor

-- Inserir lista
INSERT INTO lead_lists (name, description, user_id, created_at, updated_at)
VALUES (
  'Teste Disparo',
  'Lista para testar o Disparador',
  (SELECT id FROM auth.users WHERE email = 'creaty12345@gmail.com' LIMIT 1),
  NOW(),
  NOW()
);

-- Inserir leads
INSERT INTO leads (name, phone, email, lead_list_id, created_at, updated_at)
VALUES 
  ('Jean Lopes', '31983323121', 'jean.lopes@email.com', (SELECT id FROM lead_lists WHERE name = 'Teste Disparo' LIMIT 1), NOW(), NOW()),
  ('Matheus Moura', '3199766846', 'matheus.moura@email.com', (SELECT id FROM lead_lists WHERE name = 'Teste Disparo' LIMIT 1), NOW(), NOW());





