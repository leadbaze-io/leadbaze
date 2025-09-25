-- =====================================================
-- TESTE COM OS NOMES CORRETOS DAS FUNÇÕES
-- =====================================================

-- 1. VERIFICAR FUNÇÕES EXISTENTES
-- =====================================================

SELECT 
    proname as function_name,
    proargnames as parameter_names,
    proargtypes::regtype[] as parameter_types
FROM pg_proc 
WHERE proname IN (
    'check_leads_availability',
    'consume_leads',
    'get_subscription_status'
)
ORDER BY proname;

-- 2. VERIFICAR PLANOS DISPONÍVEIS
-- =====================================================

SELECT 
    id,
    name,
    display_name,
    price_monthly,
    leads_limit,
    is_active
FROM subscription_plans
ORDER BY price_monthly;

-- 3. TESTAR FUNÇÃO check_leads_availability
-- =====================================================
-- Substitua 'SEU_USER_ID_AQUI' pelo ID real do usuário

-- Testar disponibilidade de leads
SELECT * FROM check_leads_availability('SEU_USER_ID_AQUI', 1);

-- 4. TESTAR FUNÇÃO get_subscription_status
-- =====================================================
-- Substitua 'SEU_USER_ID_AQUI' pelo ID real do usuário

-- Verificar status da assinatura
SELECT * FROM get_subscription_status('SEU_USER_ID_AQUI');

-- 5. TESTAR FUNÇÃO consume_leads
-- =====================================================
-- Substitua 'SEU_USER_ID_AQUI' pelo ID real do usuário

-- Consumir 5 leads
SELECT * FROM consume_leads('SEU_USER_ID_AQUI', 5, 'teste_manual');

-- 6. VERIFICAR ASSINATURAS EXISTENTES
-- =====================================================

SELECT 
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
ORDER BY us.created_at DESC
LIMIT 5;

-- 7. VERIFICAR HISTÓRICO DE USO
-- =====================================================

SELECT 
    id,
    user_id,
    leads_generated,
    operation_type,
    operation_reason,
    remaining_leads,
    created_at
FROM leads_usage_history
ORDER BY created_at DESC
LIMIT 10;

-- 8. CRIAR ASSINATURA DE TESTE (se necessário)
-- =====================================================
-- Descomente e execute se precisar criar uma assinatura de teste

/*
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
    'SEU_USER_ID_AQUI',  -- Substitua pelo ID real
    (SELECT id FROM subscription_plans WHERE name = 'start'),
    'active',
    'monthly',
    0,
    1000,  -- leads_remaining = leads_limit - leads_used
    NOW(),
    NOW() + INTERVAL '30 days',
    true
);
*/











