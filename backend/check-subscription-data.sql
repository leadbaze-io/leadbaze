-- Verificar dados da assinatura criada
SELECT 
    'Assinatura criada:' as status,
    ups.id,
    ups.user_id,
    ups.plan_id,
    ups.status,
    ups.leads_balance,
    ups.leads_bonus,
    ups.first_payment_date,
    ups.current_period_start,
    ups.current_period_end,
    ups.next_billing_date,
    ups.created_at
FROM user_payment_subscriptions ups
WHERE ups.user_id = '39dc6c62-6dea-4222-adb5-7075fd704189'
ORDER BY ups.created_at DESC
LIMIT 1;

-- Verificar dados do plano
SELECT 
    'Plano Start:' as status,
    pp.id,
    pp.name,
    pp.display_name,
    pp.price_reais,
    pp.leads_included,
    pp.is_active
FROM payment_plans pp
WHERE pp.name = 'start';

-- Verificar se há dados do usuário
SELECT 
    'Usuário:' as status,
    au.id as auth_id,
    au.email as auth_email,
    up.id as profile_id,
    up.email as profile_email,
    up.full_name
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE au.id = '39dc6c62-6dea-4222-adb5-7075fd704189';








