-- ==============================================
-- SCRIPT PARA VERIFICAR STATUS DA AUTENTICAÇÃO
-- ==============================================

-- Este script funciona apenas com tabelas existentes no Supabase
-- Execute no SQL Editor do Supabase Dashboard

-- ==============================================
-- 1. VERIFICAR USUÁRIOS SEM SENHA
-- ==============================================

-- Listar usuários que não têm senha criptografada
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    CASE 
        WHEN encrypted_password IS NULL THEN 'SEM SENHA'
        ELSE 'COM SENHA'
    END as status_senha
FROM auth.users 
WHERE encrypted_password IS NULL
ORDER BY created_at DESC;

-- ==============================================
-- 2. VERIFICAR USUÁRIOS COM SENHA
-- ==============================================

-- Listar usuários que têm senha criptografada
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    'COM SENHA' as status_senha
FROM auth.users 
WHERE encrypted_password IS NOT NULL
ORDER BY created_at DESC;

-- ==============================================
-- 3. ESTATÍSTICAS GERAIS
-- ==============================================

-- Verificar estatísticas dos usuários
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN encrypted_password IS NOT NULL THEN 1 END) as usuarios_com_senha,
    COUNT(CASE WHEN encrypted_password IS NULL THEN 1 END) as usuarios_sem_senha,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as usuarios_confirmados,
    COUNT(CASE WHEN email_confirmed_at IS NULL THEN 1 END) as usuarios_nao_confirmados
FROM auth.users;

-- ==============================================
-- 4. VERIFICAR USUÁRIO ESPECÍFICO
-- ==============================================

-- Verificar o usuário específico que você mencionou
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at,
    CASE 
        WHEN encrypted_password IS NULL THEN 'SEM SENHA'
        ELSE 'COM SENHA'
    END as status_senha,
    CASE 
        WHEN encrypted_password IS NOT NULL THEN encrypted_password
        ELSE 'N/A'
    END as hash_senha
FROM auth.users 
WHERE id = '95ca9cd7-ecbf-445f-a48b-643927d27ccf';

-- ==============================================
-- 5. CORRIGIR USUÁRIO SEM SENHA (SE NECESSÁRIO)
-- ==============================================

-- ATENÇÃO: Execute apenas se necessário
-- Substitua 'senha_padrao' pela senha desejada
-- UPDATE auth.users 
-- SET 
--     encrypted_password = crypt('senha_padrao', gen_salt('bf')),
--     updated_at = NOW()
-- WHERE id = '95ca9cd7-ecbf-445f-a48b-643927d27ccf';

-- ==============================================
-- 6. INSTRUÇÕES PARA CONFIGURAR SUPABASE
-- ==============================================

/*
PASSO A PASSO PARA CORRIGIR O BUG:

1. Acesse: https://supabase.com/dashboard
2. Vá para: Authentication → Settings → General
3. Habilite:
   ✅ Enable email confirmations: ON
   ✅ Enable email change confirmations: ON
   ✅ Enable password reset emails: ON

4. Vá para: Authentication → Settings → SMTP Settings
5. Habilite: "Enable custom SMTP"
6. Configure SMTP (Gmail recomendado):
   - SMTP Host: smtp.gmail.com
   - SMTP Port: 587
   - SMTP User: seu-email@gmail.com
   - SMTP Pass: senha-de-app-do-gmail
   - SMTP Admin Email: seu-email@gmail.com
   - SMTP Sender Name: LeadBaze

7. Configure URLs:
   - Site URL: https://leadbaze.io
   - Redirect URLs: 
     * https://leadbaze.io/auth/callback
     * http://localhost:3000/auth/callback

8. Salve todas as configurações
9. Teste criando uma nova conta
10. Execute este script novamente para verificar se funcionou
*/

-- ==============================================
-- 7. VERIFICAÇÃO FINAL
-- ==============================================

-- Após configurar, execute esta consulta para verificar se funcionou
-- SELECT 
--     'Configuração' as item,
--     CASE 
--         WHEN COUNT(CASE WHEN encrypted_password IS NOT NULL THEN 1 END) = COUNT(*) 
--         THEN 'CORRIGIDO - Todos os usuários têm senha'
--         ELSE 'AINDA COM PROBLEMA - Alguns usuários sem senha'
--     END as status
-- FROM auth.users;

