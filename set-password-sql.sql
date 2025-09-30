-- ==============================================
-- SCRIPT SQL PARA DEFINIR SENHA PARA USUÁRIO EXISTENTE
-- Email: creaty123456@gmail.com
-- ==============================================

-- IMPORTANTE: Este script deve ser executado no Supabase Dashboard
-- Vá para Authentication > Users > Encontre o usuário > Update user

-- Ou use a função admin do Supabase para atualizar a senha
-- Isso deve ser feito via API ou Dashboard, não via SQL direto

-- ==============================================
-- ALTERNATIVA: CRIAR NOVO USUÁRIO COM SENHA
-- ==============================================

-- Se necessário, você pode deletar o usuário atual e recriar com senha
-- CUIDADO: Isso apagará todos os dados do usuário!

-- 1. Deletar usuário atual (CUIDADO!)
-- DELETE FROM auth.users WHERE email = 'creaty123456@gmail.com';

-- 2. Criar novo usuário com senha (via aplicação)
-- Isso deve ser feito via signUp com senha

-- ==============================================
-- RECOMENDAÇÃO: USAR DASHBOARD DO SUPABASE
-- ==============================================

-- 1. Acesse o Supabase Dashboard
-- 2. Vá para Authentication > Users
-- 3. Encontre o usuário creaty123456@gmail.com
-- 4. Clique em "Update user"
-- 5. Defina uma senha temporária (ex: 123456)
-- 6. Salve as alterações

-- ==============================================
-- VERIFICAÇÃO APÓS DEFINIR SENHA
-- ==============================================

-- Verificar se o usuário pode fazer login
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at
FROM auth.users 
WHERE email = 'creaty123456@gmail.com';
