-- ==============================================
-- VERIFICAÇÃO DE CADASTRO DO USUÁRIO
-- Email: creaty123456@gmail.com
-- ==============================================

-- 1. Verificar se o usuário foi criado na tabela auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    last_sign_in_at
FROM auth.users 
WHERE email = 'creaty123456@gmail.com';

-- 2. Verificar se o perfil foi criado na tabela user_profiles
SELECT 
    up.id,
    up.user_id,
    up.tax_type,
    up.cpf,
    up.cnpj,
    up.full_name,
    up.birth_date,
    up.rg,
    up.company_name,
    up.trade_name,
    up.state_registration,
    up.municipal_registration,
    up.email,
    up.phone,
    up.alternative_phone,
    up.preferred_contact,
    up.billing_street,
    up.billing_number,
    up.billing_complement,
    up.billing_neighborhood,
    up.billing_city,
    up.billing_state,
    up.billing_zip_code,
    up.billing_country,
    up.accepted_payment_methods,
    up.billing_cycle,
    up.auto_renewal,
    up.card_last4,
    up.card_brand,
    up.card_expiry_month,
    up.card_expiry_year,
    up.card_holder_name,
    up.profile_completion_percentage,
    up.is_verified,
    up.verification_status,
    up.lgpd_consent,
    up.lgpd_consent_date,
    up.created_at,
    up.updated_at
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE au.email = 'creaty123456@gmail.com';

-- 3. Verificar se há verificações criadas na tabela user_verifications
SELECT 
    uv.id,
    uv.user_id,
    uv.verification_type,
    uv.verification_method,
    uv.verification_code,
    uv.verification_token,
    uv.external_id,
    uv.status,
    uv.attempts,
    uv.max_attempts,
    uv.verification_result,
    uv.error_message,
    uv.verified_at,
    uv.expires_at,
    uv.created_at
FROM user_verifications uv
JOIN auth.users au ON uv.user_id = au.id
WHERE au.email = 'creaty123456@gmail.com';

-- 4. Verificar se há documentos na tabela user_documents
SELECT 
    ud.id,
    ud.user_id,
    ud.document_type,
    ud.document_name,
    ud.file_url,
    ud.file_size,
    ud.mime_type,
    ud.status,
    ud.rejection_reason,
    ud.uploaded_at,
    ud.reviewed_at,
    ud.expires_at
FROM user_documents ud
JOIN auth.users au ON ud.user_id = au.id
WHERE au.email = 'creaty123456@gmail.com';

-- 5. Verificar se há métodos de pagamento na tabela user_payment_methods
SELECT 
    upm.id,
    upm.user_id,
    upm.payment_type,
    upm.is_default,
    upm.card_token,
    upm.card_last4,
    upm.card_brand,
    upm.card_expiry_month,
    upm.card_expiry_year,
    upm.card_holder_name,
    upm.pix_key,
    upm.pix_type,
    upm.is_active,
    upm.is_verified,
    upm.created_at,
    upm.updated_at
FROM user_payment_methods upm
JOIN auth.users au ON upm.user_id = au.id
WHERE au.email = 'creaty123456@gmail.com';

-- 6. Resumo geral do cadastro
SELECT 
    'RESUMO DO CADASTRO' as tipo,
    au.email,
    au.email_confirmed_at,
    up.tax_type,
    up.full_name,
    up.phone,
    up.billing_city || ', ' || up.billing_state as endereco,
    up.profile_completion_percentage || '%' as completude,
    up.is_verified,
    up.lgpd_consent,
    up.created_at as data_cadastro
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE au.email = 'creaty123456@gmail.com';

-- 7. Contar registros por tabela
SELECT 
    'auth.users' as tabela,
    COUNT(*) as total_registros
FROM auth.users 
WHERE email = 'creaty123456@gmail.com'

UNION ALL

SELECT 
    'user_profiles' as tabela,
    COUNT(*) as total_registros
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE au.email = 'creaty123456@gmail.com'

UNION ALL

SELECT 
    'user_verifications' as tabela,
    COUNT(*) as total_registros
FROM user_verifications uv
JOIN auth.users au ON uv.user_id = au.id
WHERE au.email = 'creaty123456@gmail.com'

UNION ALL

SELECT 
    'user_documents' as tabela,
    COUNT(*) as total_registros
FROM user_documents ud
JOIN auth.users au ON ud.user_id = au.id
WHERE au.email = 'creaty123456@gmail.com'

UNION ALL

SELECT 
    'user_payment_methods' as tabela,
    COUNT(*) as total_registros
FROM user_payment_methods upm
JOIN auth.users au ON upm.user_id = au.id
WHERE au.email = 'creaty123456@gmail.com';
