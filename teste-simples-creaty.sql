-- =====================================================
-- TESTE SIMPLES COM CREATY1234567@GMAIL.COM
-- =====================================================

-- PASSO 1: Verificar se o usuário existe
SELECT id, email FROM auth.users WHERE email = 'creaty1234567@gmail.com';

-- PASSO 2: Verificar planos disponíveis
SELECT name, display_name, leads_limit FROM subscription_plans WHERE name = 'start';

-- PASSO 3: Deletar assinatura existente (se houver)
DELETE FROM user_subscriptions 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'creaty1234567@gmail.com');

-- PASSO 4: Criar nova assinatura
INSERT INTO user_subscriptions (
    user_id,
    plan_id,
    status,
    billing_cycle,
    leads_used,
    leads_remaining,
    current_period_start,
    current_period_end,
    auto_renewal
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'creaty1234567@gmail.com'),
    (SELECT id FROM subscription_plans WHERE name = 'start'),
    'active',
    'monthly',
    0,
    1000,
    NOW(),
    NOW() + INTERVAL '30 days',
    true
);

-- PASSO 5: Verificar assinatura criada
SELECT 
    us.status,
    us.leads_used,
    us.leads_remaining,
    sp.display_name as plan_name,
    sp.leads_limit
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
JOIN auth.users au ON us.user_id = au.id
WHERE au.email = 'creaty1234567@gmail.com';

-- PASSO 6: Testar verificação de leads
SELECT * FROM check_leads_availability(
    (SELECT id FROM auth.users WHERE email = 'creaty1234567@gmail.com'), 
    1
);

-- PASSO 7: Testar status da assinatura
SELECT * FROM get_subscription_status(
    (SELECT id FROM auth.users WHERE email = 'creaty1234567@gmail.com')
);

-- PASSO 8: Consumir 5 leads
SELECT * FROM consume_leads(
    (SELECT id FROM auth.users WHERE email = 'creaty1234567@gmail.com'), 
    5, 
    'teste_manual'
);

-- PASSO 9: Verificar status após consumo
SELECT * FROM get_subscription_status(
    (SELECT id FROM auth.users WHERE email = 'creaty1234567@gmail.com')
);

-- PASSO 10: Verificar histórico
SELECT 
    leads_generated,
    operation_reason,
    remaining_leads,
    created_at
FROM leads_usage_history luh
JOIN auth.users au ON luh.user_id = au.id
WHERE au.email = 'creaty1234567@gmail.com'
ORDER BY created_at DESC
LIMIT 3;











