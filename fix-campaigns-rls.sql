-- Script para corrigir permissões RLS na tabela campaigns
-- Execute este SQL no Supabase

-- 1. Verificar se a tabela campaigns existe e suas permissões
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'campaigns';

-- 2. Verificar políticas RLS existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'campaigns';

-- 3. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can insert their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can update their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can delete their own campaigns" ON campaigns;

-- 4. Criar políticas RLS
-- Política para SELECT (usuários podem ver apenas suas próprias campanhas)
CREATE POLICY "Users can view their own campaigns" ON campaigns
  FOR SELECT USING (auth.uid() = user_id);

-- Política para INSERT (usuários podem criar campanhas para si mesmos)
CREATE POLICY "Users can insert their own campaigns" ON campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE (usuários podem atualizar apenas suas próprias campanhas)
CREATE POLICY "Users can update their own campaigns" ON campaigns
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para DELETE (usuários podem deletar apenas suas próprias campanhas)
CREATE POLICY "Users can delete their own campaigns" ON campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Habilitar RLS na tabela campaigns se não estiver habilitado
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- 6. Verificar se as políticas foram criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'campaigns'
ORDER BY policyname;

-- 7. Testar se o usuário atual pode inserir na tabela
-- (Execute este comando logado como o usuário que está tendo problemas)
SELECT auth.uid() as current_user_id;
