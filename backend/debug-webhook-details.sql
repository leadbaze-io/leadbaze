-- =====================================================
-- DEBUG DETALHADO DO WEBHOOK MAIS RECENTE
-- =====================================================

-- Ver o raw_data completo do último webhook
SELECT 
    'Webhook mais recente:' as status,
    id,
    perfect_pay_id,
    action,
    processed,
    created_at,
    raw_data
FROM payment_webhooks 
WHERE perfect_pay_id = 'PPCPMTB1758754454209';

-- Verificar se existe alguma assinatura criada hoje
SELECT 
    'Assinaturas hoje:' as status,
    COUNT(*) as total,
    MAX(created_at) as ultima_criada
FROM user_payment_subscriptions 
WHERE created_at >= CURRENT_DATE;

-- Verificar se o usuário existe no sistema
SELECT 
    'Usuário existe:' as status,
    u.id as auth_id,
    u.email as auth_email,
    up.id as profile_id,
    up.email as profile_email,
    up.full_name
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.id = '39dc6c62-6dea-4222-adb5-7075fd704189';











