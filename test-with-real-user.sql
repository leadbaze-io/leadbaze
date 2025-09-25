-- =====================================================
-- TESTE COM USUÁRIO REAL
-- =====================================================

-- 1. BUSCAR USUÁRIOS EXISTENTES
-- =====================================================

SELECT 
    'Usuários encontrados:' as status,
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 2. VERIFICAR FUNÇÕES EXISTENTES
-- =====================================================

SELECT 
    'Funções encontradas:' as status,
    proname as function_name
FROM pg_proc 
WHERE proname IN (
    'check_leads_availability',
    'consume_leads',
    'get_subscription_status'
)
ORDER BY proname;

-- 3. VERIFICAR PLANOS DISPONÍVEIS
-- =====================================================

SELECT 
    'Planos encontrados:' as status,
    id,
    name,
    display_name,
    price_monthly,
    leads_limit,
    is_active
FROM subscription_plans
ORDER BY price_monthly;

-- 4. VERIFICAR ASSINATURAS EXISTENTES
-- =====================================================

SELECT 
    'Assinaturas encontradas:' as status,
    us.id,
    us.user_id,
    au.email,
    us.status,
    us.leads_used,
    us.leads_remaining,
    sp.display_name as plan_name,
    sp.leads_limit,
    us.current_period_end
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
LEFT JOIN auth.users au ON us.user_id = au.id
ORDER BY us.created_at DESC
LIMIT 5;

-- 5. CRIAR ASSINATURA DE TESTE (usando o primeiro usuário encontrado)
-- =====================================================

-- Primeiro, vamos pegar o ID do primeiro usuário
WITH first_user AS (
    SELECT id, email 
    FROM auth.users 
    ORDER BY created_at DESC 
    LIMIT 1
)
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
)
SELECT 
    fu.id,
    sp.id,
    'active',
    'monthly',
    0,
    sp.leads_limit,
    NOW(),
    NOW() + INTERVAL '30 days',
    true
FROM first_user fu
CROSS JOIN subscription_plans sp
WHERE sp.name = 'start'
ON CONFLICT (user_id, plan_id) DO NOTHING;

-- 6. TESTAR FUNÇÕES COM O USUÁRIO REAL
-- =====================================================

-- Testar check_leads_availability
WITH test_user AS (
    SELECT id, email 
    FROM auth.users 
    ORDER BY created_at DESC 
    LIMIT 1
)
SELECT 
    'Teste check_leads_availability:' as status,
    tu.email,
    check_leads_availability(tu.id, 1) as result
FROM test_user tu;

-- Testar get_subscription_status
WITH test_user AS (
    SELECT id, email 
    FROM auth.users 
    ORDER BY created_at DESC 
    LIMIT 1
)
SELECT 
    'Teste get_subscription_status:' as status,
    tu.email,
    get_subscription_status(tu.id) as result
FROM test_user tu;

-- 7. TESTAR CONSUMO DE LEADS
-- =====================================================

-- Consumir 5 leads
WITH test_user AS (
    SELECT id, email 
    FROM auth.users 
    ORDER BY created_at DESC 
    LIMIT 1
)
SELECT 
    'Teste consume_leads:' as status,
    tu.email,
    consume_leads(tu.id, 5, 'teste_manual') as result
FROM test_user tu;

-- 8. VERIFICAR RESULTADO APÓS CONSUMO
-- =====================================================

-- Verificar status após consumo
WITH test_user AS (
    SELECT id, email 
    FROM auth.users 
    ORDER BY created_at DESC 
    LIMIT 1
)
SELECT 
    'Status após consumo:' as status,
    tu.email,
    get_subscription_status(tu.id) as result
FROM test_user tu;

-- 9. VERIFICAR HISTÓRICO DE USO
-- =====================================================

SELECT 
    'Histórico de uso:' as status,
    luh.id,
    au.email,
    luh.leads_generated,
    luh.operation_type,
    luh.operation_reason,
    luh.remaining_leads,
    luh.created_at
FROM leads_usage_history luh
LEFT JOIN auth.users au ON luh.user_id = au.id
ORDER BY luh.created_at DESC
LIMIT 5;

-- 10. TESTAR LIMITE DE LEADS
-- =====================================================

-- Tentar consumir mais leads do que disponível
WITH test_user AS (
    SELECT id, email 
    FROM auth.users 
    ORDER BY created_at DESC 
    LIMIT 1
)
SELECT 
    'Teste limite excedido:' as status,
    tu.email,
    consume_leads(tu.id, 10000, 'teste_limite') as result
FROM test_user tu;











