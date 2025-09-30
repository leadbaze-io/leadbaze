-- =====================================================
-- DEBUG COMPLETO DO USUÁRIO E PERFIL
-- =====================================================

-- 1. Verificar se o usuário existe na auth.users
SELECT 
    'Usuário auth:' as status,
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    u.raw_user_meta_data
FROM auth.users u
WHERE u.id = '084b6a9c-49d4-420d-9315-3c01d9620c9d';

-- 2. Verificar perfil completo do usuário
SELECT 
    'Perfil completo:' as status,
    up.*
FROM user_profiles up
WHERE up.user_id = '084b6a9c-49d4-420d-9315-3c01d9620c9d';

-- 3. Verificar se o usuário tem perfil com todos os campos obrigatórios
SELECT 
    'Campos obrigatórios:' as status,
    CASE 
        WHEN up.full_name IS NULL THEN '❌ full_name está NULL'
        ELSE '✅ full_name: ' || up.full_name
    END as full_name_status,
    CASE 
        WHEN up.email IS NULL THEN '❌ email está NULL'
        ELSE '✅ email: ' || up.email
    END as email_status,
    CASE 
        WHEN up.phone IS NULL THEN '❌ phone está NULL'
        ELSE '✅ phone: ' || up.phone
    END as phone_status,
    CASE 
        WHEN up.billing_street IS NULL THEN '❌ billing_street está NULL'
        ELSE '✅ billing_street: ' || up.billing_street
    END as billing_street_status
FROM user_profiles up
WHERE up.user_id = '084b6a9c-49d4-420d-9315-3c01d9620c9d';

-- 4. Verificar leads bônus especificamente
SELECT 
    'Leads bônus:' as status,
    up.bonus_leads,
    up.bonus_leads_used,
    (up.bonus_leads - up.bonus_leads_used) as leads_disponiveis
FROM user_profiles up
WHERE up.user_id = '084b6a9c-49d4-420d-9315-3c01d9620c9d';









