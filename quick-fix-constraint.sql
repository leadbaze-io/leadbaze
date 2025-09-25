-- CORREÇÃO RÁPIDA DA CONSTRAINT TAX_TYPE
-- Execute este SQL no Supabase Dashboard

-- 1. Remover constraint antiga
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_tax_type_check;

-- 2. Criar nova constraint com todos os valores possíveis
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_tax_type_check 
CHECK (tax_type IN ('individual', 'company', 'pessoa_fisica', 'pessoa_juridica'));

-- 3. Verificar se foi criada corretamente
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'user_profiles'::regclass 
  AND conname LIKE '%tax_type%';

