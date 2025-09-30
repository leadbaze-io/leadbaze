-- ==============================================
-- SCRIPT PARA CONSULTAR INFORMAÇÕES DO USUÁRIO
-- ==============================================

-- Consultar informações do usuário específico
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
-- INFORMAÇÕES ADICIONAIS SOBRE O USUÁRIO
-- ==============================================

-- Verificar se o usuário tem dados relacionados
SELECT 
    'lead_lists' as tabela,
    COUNT(*) as total_registros
FROM lead_lists 
WHERE user_id = '95ca9cd7-ecbf-445f-a48b-643927d27ccf'

UNION ALL

SELECT 
    'whatsapp_templates' as tabela,
    COUNT(*) as total_registros
FROM whatsapp_templates 
WHERE user_id = '95ca9cd7-ecbf-445f-a48b-643927d27ccf'

UNION ALL

SELECT 
    'contact_attempts' as tabela,
    COUNT(*) as total_registros
FROM contact_attempts 
WHERE user_id = '95ca9cd7-ecbf-445f-a48b-643927d27ccf'

UNION ALL

SELECT 
    'user_preferences' as tabela,
    COUNT(*) as total_registros
FROM user_preferences 
WHERE user_id = '95ca9cd7-ecbf-445f-a48b-643927d27ccf'

UNION ALL

SELECT 
    'whatsapp_instances' as tabela,
    COUNT(*) as total_registros
FROM whatsapp_instances 
WHERE user_id = '95ca9cd7-ecbf-445f-a48b-643927d27ccf';

-- ==============================================
-- NOTA IMPORTANTE SOBRE SENHAS
-- ==============================================
-- 
-- IMPORTANTE: As senhas no Supabase são armazenadas de forma criptografada
-- no campo 'encrypted_password' e NÃO podem ser descriptografadas.
-- 
-- Se você precisa redefinir a senha do usuário, use uma das opções:
-- 
-- 1. Via Dashboard do Supabase:
--    - Acesse Authentication > Users
--    - Encontre o usuário pelo ID ou email
--    - Clique em "Send password reset email"
-- 
-- 2. Via SQL (redefinir senha):
--    UPDATE auth.users 
--    SET encrypted_password = crypt('nova_senha', gen_salt('bf'))
--    WHERE id = '95ca9cd7-ecbf-445f-a48b-643927d27ccf';
-- 
-- 3. Via API do Supabase:
--    - Use a função resetPasswordForEmail()
-- 
-- ==============================================

