-- Script para criar tabelas e dados de teste
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos verificar se as tabelas existem e criar se necessário

-- Criar tabela lead_lists se não existir
CREATE TABLE IF NOT EXISTS lead_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela leads se não existir
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  company TEXT,
  position TEXT,
  lead_list_id UUID REFERENCES lead_lists(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS (Row Level Security) se necessário
ALTER TABLE lead_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS se não existirem
DO $$
BEGIN
  -- Política para lead_lists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'lead_lists' 
    AND policyname = 'Users can manage their own lead lists'
  ) THEN
    CREATE POLICY "Users can manage their own lead lists" ON lead_lists
      FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Política para leads
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'leads' 
    AND policyname = 'Users can manage leads in their lists'
  ) THEN
    CREATE POLICY "Users can manage leads in their lists" ON leads
      FOR ALL USING (
        lead_list_id IN (
          SELECT id FROM lead_lists WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- 4. Agora inserir os dados de teste
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
INSERT INTO leads (name, phone, email, company, position, lead_list_id, created_at, updated_at)
VALUES 
  ('Jean Lopes', '31983323121', 'jean.lopes@email.com', 'Empresa Teste', 'Gerente', 
   (SELECT id FROM lead_lists WHERE name = 'Teste Disparo' LIMIT 1), NOW(), NOW()),
  ('Matheus Moura', '3199766846', 'matheus.moura@email.com', 'Empresa Teste 2', 'Analista', 
   (SELECT id FROM lead_lists WHERE name = 'Teste Disparo' LIMIT 1), NOW(), NOW());

-- 5. Verificar se os dados foram inseridos
SELECT 
  ll.name as lista_nome,
  l.name as lead_nome,
  l.phone as telefone,
  l.email as email
FROM lead_lists ll
JOIN leads l ON ll.id = l.lead_list_id
WHERE ll.name = 'Teste Disparo'
ORDER BY l.name;





























