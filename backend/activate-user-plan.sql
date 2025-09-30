-- =====================================================
-- ATIVAR PLANO START PARA USUÁRIO ESPECÍFICO
-- =====================================================

-- 1. Verificar se o usuário existe
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE id = '66875e05-eace-49ac-bf07-0e794dbab8fd';

-- 2. Verificar plano Start
SELECT 
    id,
    name,
    display_name,
    price_cents,
    leads_included
FROM payment_plans 
WHERE name = 'start';

-- 3. Verificar se já existe assinatura ativa
SELECT 
    id,
    user_id,
    plan_id,
    status,
    leads_balance,
    created_at
FROM user_payment_subscriptions 
WHERE user_id = '66875e05-eace-49ac-bf07-0e794dbab8fd'
AND status = 'active';

-- 4. Cancelar assinaturas existentes (se houver)
UPDATE user_payment_subscriptions 
SET 
    status = 'cancelled',
    cancelled_at = NOW(),
    updated_at = NOW()
WHERE user_id = '66875e05-eace-49ac-bf07-0e794dbab8fd'
AND status = 'active';

-- 5. Criar nova assinatura Start
INSERT INTO user_payment_subscriptions (
    id,
    user_id,
    plan_id,
    status,
    leads_balance,
    leads_bonus,
    first_payment_date,
    current_period_start,
    current_period_end,
    next_billing_date,
    is_refund_eligible,
    refund_deadline,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '66875e05-eace-49ac-bf07-0e794dbab8fd',
    (SELECT id FROM payment_plans WHERE name = 'start'),
    'active',
    1000, -- 1000 leads do plano Start
    0,    -- Nenhum bonus
    NOW(), -- Primeira data de pagamento
    NOW(), -- Início do período atual
    NOW() + INTERVAL '1 month', -- Fim do período atual
    NOW() + INTERVAL '1 month', -- Próxima cobrança
    false, -- Não elegível para reembolso
    NOW() + INTERVAL '7 days', -- Prazo para reembolso
    NOW(),
    NOW()
);

-- 6. Registrar atividade
INSERT INTO user_subscription_activities (
    id,
    user_id,
    activity_type,
    activity_data,
    created_at
) VALUES (
    gen_random_uuid(),
    '66875e05-eace-49ac-bf07-0e794dbab8fd',
    'plan_activated',
    '{"plan": "start", "leads": 1000, "method": "manual_activation"}',
    NOW()
);

-- 7. Verificar resultado
SELECT 
    ups.id,
    ups.user_id,
    pp.display_name as plan_name,
    ups.status,
    ups.leads_balance,
    ups.leads_used,
    ups.created_at
FROM user_payment_subscriptions ups
JOIN payment_plans pp ON ups.plan_id = pp.id
WHERE ups.user_id = '66875e05-eace-49ac-bf07-0e794dbab8fd'
AND ups.status = 'active';

-- 8. Verificar atividade registrada
SELECT 
    activity_type,
    activity_data,
    created_at
FROM user_subscription_activities 
WHERE user_id = '66875e05-eace-49ac-bf07-0e794dbab8fd'
ORDER BY created_at DESC
LIMIT 5;
