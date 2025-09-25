-- ==============================================
-- SCRIPT PARA VER A SENHA/HASH DO USUÁRIO
-- ==============================================

-- Consultar TODAS as informações do usuário, incluindo hash da senha
SELECT 
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    confirmed_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
FROM auth.users 
WHERE id = '95ca9cd7-ecbf-445f-a48b-643927d27ccf';

-- ==============================================
-- CONSULTA ALTERNATIVA - APENAS CAMPOS ESSENCIAIS
-- ==============================================

-- Se a consulta acima não funcionar, tente esta versão mais simples:
SELECT 
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    last_sign_in_at
FROM auth.users 
WHERE email = 'creaty123456@gmail.com';

-- ==============================================
-- VERIFICAR SE O USUÁRIO EXISTE
-- ==============================================

-- Contar quantos usuários existem com este email
SELECT COUNT(*) as total_usuarios
FROM auth.users 
WHERE email = 'creaty123456@gmail.com';

-- ==============================================
-- LISTAR TODOS OS USUÁRIOS (PARA REFERÊNCIA)
-- ==============================================

-- Ver todos os usuários (últimos 10)
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    CASE 
        WHEN encrypted_password IS NOT NULL THEN 'Tem senha'
        ELSE 'Sem senha'
    END as status_senha
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- ==============================================
-- INFORMAÇÕES IMPORTANTES
-- ==============================================

-- ⚠️  IMPORTANTE: 
-- 1. O campo 'encrypted_password' contém o hash da senha
-- 2. Se estiver NULL, significa que o usuário não tem senha definida
-- 3. Se estiver preenchido, é um hash bcrypt que NÃO pode ser revertido
-- 4. Para testar se uma senha está correta, use a API de login do Supabase

-- ==============================================
-- TESTE DE SENHA VIA SQL (ALTERNATIVA)
-- ==============================================

-- Se você souber uma senha suspeita, pode testar assim:
-- SELECT 
--     id,
--     email,
--     (encrypted_password = crypt('sua_senha_suspeita', encrypted_password)) as senha_correta
-- FROM auth.users 
-- WHERE email = 'creaty123456@gmail.com';

-- ==============================================
-- COMANDOS PARA EXECUTAR NO SUPABASE
-- ==============================================

-- 1. Execute a primeira consulta para ver todas as informações
-- 2. Se não funcionar, execute a segunda consulta (mais simples)
-- 3. Use a terceira consulta para verificar se o usuário existe
-- 4. Use a quarta consulta para ver todos os usuários

