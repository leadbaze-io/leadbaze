-- ==============================================
-- VERIFICAÇÃO RÁPIDA DO USUÁRIO
-- Email: creaty123456@gmail.com
-- Execute este script no SQL Editor do Supabase
-- ==============================================

-- Buscar dados completos do usuário
SELECT 
    au.id as user_id,
    au.email,
    au.email_confirmed_at,
    au.created_at as user_created_at,
    
    -- Dados do perfil
    up.tax_type,
    up.full_name,
    up.cpf,
    up.cnpj,
    up.birth_date,
    up.phone,
    up.email as profile_email,
    up.billing_street,
    up.billing_number,
    up.billing_city,
    up.billing_state,
    up.billing_zip_code,
    up.profile_completion_percentage,
    up.is_verified,
    up.lgpd_consent,
    up.lgpd_consent_date,
    up.created_at as profile_created_at,
    
    -- Contadores
    (SELECT COUNT(*) FROM user_verifications uv WHERE uv.user_id = au.id) as total_verifications,
    (SELECT COUNT(*) FROM user_documents ud WHERE ud.user_id = au.id) as total_documents,
    (SELECT COUNT(*) FROM user_payment_methods upm WHERE upm.user_id = au.id) as total_payment_methods

FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE au.email = 'creaty123456@gmail.com';
