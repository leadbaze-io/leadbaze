-- =====================================================
-- TESTE COM USUÁRIO CREATY1234567@GMAIL.COM
-- =====================================================

-- 1. BUSCAR O USUÁRIO CREATY
-- =====================================================

SELECT 
    'Usuário creaty encontrado:' as status,
    id,
    email,
    created_at
FROM auth.users
WHERE email = 'creaty1234567@gmail.com';

-- 2. VERIFICAR SE JÁ TEM ASSINATURA
-- =====================================================

SELECT 
    'Assinatura existente:' as status,
    us.id,
    us.user_id,
    us.status,
    us.leads_used,
    us.leads_remaining,
    sp.display_name as plan_name,
    sp.leads_limit,
    us.current_period_end
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
JOIN auth.users au ON us.user_id = au.id
WHERE au.email = 'creaty1234567@gmail.com';

-- 3. CRIAR ASSINATURA DE TESTE (sem ON CONFLICT)
-- =====================================================

-- Primeiro, vamos deletar qualquer assinatura existente
DELETE FROM user_subscriptions 
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'creaty1234567@gmail.com'
);

-- Agora criar a nova assinatura
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
    au.id,
    sp.id,
    'active',
    'monthly',
    0,
    sp.leads_limit,
    NOW(),
    NOW() + INTERVAL '30 days',
    true
FROM auth.users au
CROSS JOIN subscription_plans sp
WHERE au.email = 'creaty1234567@gmail.com'
AND sp.name = 'start';

-- 4. VERIFICAR ASSINATURA CRIADA
-- =====================================================

SELECT 
    'Assinatura criada:' as status,
    us.id,
    us.user_id,
    us.status,
    us.leads_used,
    us.leads_remaining,
    sp.display_name as plan_name,
    sp.leads_limit,
    us.current_period_end
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
JOIN auth.users au ON us.user_id = au.id
WHERE au.email = 'creaty1234567@gmail.com';

-- 5. TESTAR FUNÇÕES COM O USUÁRIO CREATY
-- =====================================================

-- Testar check_leads_availability
SELECT 
    'Teste check_leads_availability:' as status,
    check_leads_availability(
        (SELECT id FROM auth.users WHERE email = 'creaty1234567@gmail.com'), 
        1
    ) as result;

-- Testar get_subscription_status
SELECT 
    'Teste get_subscription_status:' as status,
    get_subscription_status(
        (SELECT id FROM auth.users WHERE email = 'creaty1234567@gmail.com')
    ) as result;

-- 6. TESTAR CONSUMO DE LEADS
-- =====================================================

-- Consumir 5 leads
SELECT 
    'Teste consume_leads (5 leads):' as status,
    consume_leads(
        (SELECT id FROM auth.users WHERE email = 'creaty1234567@gmail.com'), 
        5, 
        'teste_manual'
    ) as result;

-- 7. VERIFICAR RESULTADO APÓS CONSUMO
-- =====================================================

-- Verificar status após consumo
SELECT 
    'Status após consumo:' as status,
    get_subscription_status(
        (SELECT id FROM auth.users WHERE email = 'creaty1234567@gmail.com')
    ) as result;

-- 8. VERIFICAR HISTÓRICO DE USO
-- =====================================================

SELECT 
    'Histórico de uso:' as status,
    luh.id,
    luh.leads_generated,
    luh.operation_type,
    luh.operation_reason,
    luh.remaining_leads,
    luh.created_at
FROM leads_usage_history luh
JOIN auth.users au ON luh.user_id = au.id
WHERE au.email = 'creaty1234567@gmail.com'
ORDER BY luh.created_at DESC
LIMIT 5;

-- 9. TESTAR LIMITE DE LEADS
-- =====================================================

-- Tentar consumir mais leads do que disponível
SELECT 
    'Teste limite excedido:' as status,
    consume_leads(
        (SELECT id FROM auth.users WHERE email = 'creaty1234567@gmail.com'), 
        10000, 
        'teste_limite'
    ) as result;

-- 10. CONSUMIR QUASE TODOS OS LEADS PARA TESTAR LIMITE
-- =====================================================

-- Consumir 990 leads (deixar apenas 5)
SELECT 
    'Consumindo 990 leads:' as status,
    consume_leads(
        (SELECT id FROM auth.users WHERE email = 'creaty1234567@gmail.com'), 
        990, 
        'teste_limite_quase_atingido'
    ) as result;

-- 11. VERIFICAR STATUS FINAL
-- =====================================================

SELECT 
    'Status final:' as status,
    get_subscription_status(
        (SELECT id FROM auth.users WHERE email = 'creaty1234567@gmail.com')
    ) as result;

-- 12. TESTAR GERAÇÃO DE 10 LEADS (DEVE FALHAR)
-- =====================================================

SELECT 
    'Teste geração 10 leads (deve falhar):' as status,
    consume_leads(
        (SELECT id FROM auth.users WHERE email = 'creaty1234567@gmail.com'), 
        10, 
        'teste_limite_atingido'
    ) as result;


