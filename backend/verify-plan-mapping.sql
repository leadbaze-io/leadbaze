-- =====================================================
-- VERIFICAR MAPEAMENTO DE PLANOS
-- =====================================================

-- 1. Verificar plano Start (por nome, não por ID numérico)
SELECT 
    id,
    name,
    display_name,
    (price_cents / 100) as price_reais,
    leads_included,
    created_at
FROM payment_plans 
WHERE name = 'start';

-- 2. Verificar todos os planos disponíveis
SELECT 
    id,
    name,
    display_name,
    (price_cents / 100) as price_reais,
    leads_included,
    is_active,
    created_at
FROM payment_plans 
ORDER BY id;

-- 3. Verificar se o usuário existe (auth.users + user_profiles)
SELECT 
    'Auth User:' as type,
    u.id,
    u.email,
    u.created_at
FROM auth.users u
WHERE u.id = '39dc6c62-6dea-4222-adb5-7075fd704189'

UNION ALL

SELECT 
    'User Profile:' as type,
    up.user_id as id,
    up.email,
    up.created_at
FROM user_profiles up
WHERE up.user_id = '39dc6c62-6dea-4222-adb5-7075fd704189';

-- 4. Verificar assinaturas existentes do usuário
SELECT 
    id,
    user_id,
    plan_id,
    status,
    leads_balance,
    current_period_start,
    current_period_end,
    created_at
FROM user_payment_subscriptions 
WHERE user_id = '39dc6c62-6dea-4222-adb5-7075fd704189'
ORDER BY created_at DESC;

-- 5. Verificar webhooks recentes
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
LIMIT 5;
