-- =====================================================
-- VERIFICAR USUÁRIO DE TESTE PARA PERFECT PAY
-- =====================================================

-- Verificar usuário no auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE id = '39dc6c62-6dea-4222-adb5-7075fd704189';

-- Verificar perfil do usuário
SELECT 
    id,
    user_id,
    full_name,
    email,
    phone,
    tax_type,
    bonus_leads,
    bonus_leads_used,
    (bonus_leads - COALESCE(bonus_leads_used, 0)) as leads_remaining,
    created_at
FROM user_profiles 
WHERE user_id = '39dc6c62-6dea-4222-adb5-7075fd704189';

-- Verificar assinaturas existentes
SELECT 
    id,
    user_id,
    plan_id,
    status,
    leads_balance,
    current_period_start,
    current_period_end,
    perfect_pay_transaction_id,
    created_at
FROM user_payment_subscriptions 
WHERE user_id = '39dc6c62-6dea-4222-adb5-7075fd704189'
ORDER BY created_at DESC;

-- Verificar webhooks relacionados
SELECT 
    id,
    webhook_type,
    perfect_pay_id,
    action,
    processed,
    created_at
FROM payment_webhooks 
WHERE raw_data::text LIKE '%39dc6c62-6dea-4222-adb5-7075fd704189%'
ORDER BY created_at DESC
LIMIT 10;













