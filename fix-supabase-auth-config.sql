-- ==============================================
-- SCRIPT PARA CORRIGIR CONFIGURAÇÕES DE AUTENTICAÇÃO
-- ==============================================

-- Este script deve ser executado no Supabase Dashboard
-- Vá para: Authentication → Settings

-- ==============================================
-- 1. VERIFICAR CONFIGURAÇÕES ATUAIS
-- ==============================================

-- IMPORTANTE: As configurações do Supabase não são acessíveis via SQL
-- Use o Dashboard do Supabase: Authentication → Settings

-- ==============================================
-- 2. CONFIGURAÇÕES QUE DEVEM SER HABILITADAS
-- ==============================================

-- IMPORTANTE: Estas configurações devem ser feitas via Dashboard do Supabase
-- Authentication → Settings → General

/*
CONFIGURAÇÕES OBRIGATÓRIAS:

✅ Enable email confirmations: ON
✅ Enable email change confirmations: ON  
✅ Enable password reset emails: ON
✅ Enable phone confirmations: ON (se usar telefone)

URLs CONFIGURADAS:
✅ Site URL: https://leadbaze.io
✅ Redirect URLs: 
   - https://leadbaze.io/auth/callback
   - http://localhost:3000/auth/callback
*/

-- ==============================================
-- 3. VERIFICAR USUÁRIOS SEM SENHA
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
-- 4. CORRIGIR USUÁRIOS SEM SENHA (SE NECESSÁRIO)
-- ==============================================

-- ATENÇÃO: Execute apenas se necessário
-- Substitua 'senha_padrao' pela senha desejada
-- UPDATE auth.users 
-- SET 
--     encrypted_password = crypt('senha_padrao', gen_salt('bf')),
--     updated_at = NOW()
-- WHERE id = '95ca9cd7-ecbf-445f-a48b-643927d27ccf';

-- ==============================================
-- 5. VERIFICAR CONFIGURAÇÕES SMTP
-- ==============================================

-- IMPORTANTE: Configurações SMTP não são acessíveis via SQL
-- Verifique no Dashboard: Authentication → Settings → SMTP Settings

-- ==============================================
-- 6. INSTRUÇÕES PARA CONFIGURAR SMTP
-- ==============================================

/*
PASSO A PASSO PARA CONFIGURAR SMTP:

1. Acesse: https://supabase.com/dashboard
2. Vá para: Authentication → Settings → SMTP Settings
3. Habilite: "Enable custom SMTP"
4. Configure:
   - SMTP Host: smtp.gmail.com
   - SMTP Port: 587
   - SMTP User: seu-email@gmail.com
   - SMTP Pass: senha-de-app-do-gmail
   - SMTP Admin Email: seu-email@gmail.com
   - SMTP Sender Name: LeadBaze

5. Salve as configurações
6. Teste criando uma nova conta
*/

-- ==============================================
-- 7. TESTE DE CONFIGURAÇÃO
-- ==============================================

-- Após configurar, execute este teste:
-- 1. Crie uma nova conta no frontend
-- 2. Verifique se email de confirmação é enviado
-- 3. Confirme a conta via email
-- 4. Teste o login

-- ==============================================
-- 8. VERIFICAÇÃO FINAL
-- ==============================================

-- Verificar se tudo está funcionando
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN encrypted_password IS NOT NULL THEN 1 END) as usuarios_com_senha,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as usuarios_confirmados
FROM auth.users;

-- ==============================================
-- RESUMO DO PROBLEMA E SOLUÇÃO
-- ==============================================

/*
PROBLEMA IDENTIFICADO:
❌ Email confirmations desabilitados
❌ SMTP não configurado
❌ Usuários criados sem confirmação
❌ Senhas não salvas

SOLUÇÃO:
✅ Habilitar email confirmations no Supabase Dashboard
✅ Configurar SMTP (Gmail recomendado)
✅ Testar fluxo completo de signup
✅ Verificar se senhas são salvas corretamente

TEMPO ESTIMADO: 10-15 minutos
*/
