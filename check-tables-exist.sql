-- ==============================================
-- VERIFICAR SE AS TABELAS EXISTEM
-- Execute este script primeiro para verificar se as tabelas foram criadas
-- ==============================================

-- Verificar se as tabelas existem
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'user_profiles',
    'user_verifications', 
    'user_documents',
    'user_payment_methods'
)
ORDER BY table_name;

-- Verificar estrutura da tabela user_profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se há dados na tabela user_profiles
SELECT COUNT(*) as total_profiles FROM user_profiles;

-- Verificar se há dados na tabela auth.users
SELECT COUNT(*) as total_users FROM auth.users;
