-- =====================================================
-- CORREÇÃO DA CONSTRAINT DE TAX_TYPE
-- =====================================================

-- 1. Verificar constraint atual
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'user_profiles'::regclass 
  AND conname LIKE '%tax_type%';

-- 2. Remover constraint antiga se existir
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_tax_type_check;

-- 3. Criar nova constraint com valores corretos
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_tax_type_check 
CHECK (tax_type IN ('individual', 'company', 'pessoa_fisica', 'pessoa_juridica'));

-- 4. Verificar se a constraint foi criada
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'user_profiles'::regclass 
  AND conname LIKE '%tax_type%';

