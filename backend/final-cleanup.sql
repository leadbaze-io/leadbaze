-- Script final para limpar e resetar o usuário
-- 1. Ver estado atual
SELECT 'ESTADO ATUAL:' as step;
SELECT 
    us.id,
    us.user_id,
    us.status,
    us.recurring_status,
    us.plan_id,
    sp.display_name as plan_name,
    us.leads_used,
    us.leads_remaining,
    us.updated_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = '84d176eb-4f23-4a18-ac6e-6a867ca90967'
ORDER BY us.updated_at DESC;

-- 2. Cancelar TODAS as assinaturas não-gratuitas (incluindo pending)
SELECT 'CANCELANDO TODAS AS ASSINATURAS PAGAS...' as step;
UPDATE user_subscriptions 
SET 
    status = 'cancelled',
    recurring_status = 'cancelled',
    cancel_reason = 'Reset para teste - cancelada automaticamente',
    cancelled_at = NOW(),
    updated_at = NOW()
WHERE user_id = '84d176eb-4f23-4a18-ac6e-6a867ca90967'
  AND plan_id != '00000000-0000-0000-0000-000000000000'; -- Não é o plano gratuito

-- 3. Restaurar plano gratuito para estado original (limite esgotado)
SELECT 'RESTAURANDO PLANO GRATUITO (LIMITE ESGOTADO)...' as step;
UPDATE user_subscriptions 
SET 
    status = 'active',
    recurring_status = 'active',
    plan_id = '00000000-0000-0000-0000-000000000000', -- Plano gratuito
    leads_used = 30, -- Usou todos os leads
    leads_remaining = 0, -- Nenhum restante
    gateway_subscription_id = NULL,
    mercado_pago_preapproval_id = NULL,
    billing_cycle = 'monthly',
    current_period_start = NOW() - INTERVAL '30 days',
    current_period_end = NOW(),
    auto_renewal = false,
    billing_day = NULL,
    next_billing_date = NULL,
    cancel_reason = NULL,
    cancelled_at = NULL,
    updated_at = NOW()
WHERE user_id = '84d176eb-4f23-4a18-ac6e-6a867ca90967'
  AND plan_id = '00000000-0000-0000-0000-000000000000';

-- 4. Se não existir plano gratuito, criar um
INSERT INTO user_subscriptions (
    user_id,
    plan_id,
    status,
    recurring_status,
    billing_cycle,
    current_period_start,
    current_period_end,
    leads_used,
    leads_remaining,
    auto_renewal,
    gateway_subscription_id,
    mercado_pago_preapproval_id,
    billing_day,
    next_billing_date,
    created_at,
    updated_at
)
SELECT 
    '84d176eb-4f23-4a18-ac6e-6a867ca90967',
    '00000000-0000-0000-0000-000000000000',
    'active',
    'active',
    'monthly',
    NOW() - INTERVAL '30 days',
    NOW(),
    30, -- Usou todos os leads
    0,  -- Nenhum restante
    false,
    NULL,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM user_subscriptions 
    WHERE user_id = '84d176eb-4f23-4a18-ac6e-6a867ca90967'
      AND plan_id = '00000000-0000-0000-0000-000000000000'
);

-- 5. Verificar resultado final
SELECT 'RESULTADO FINAL:' as step;
SELECT 
    us.id,
    us.user_id,
    us.status,
    us.recurring_status,
    us.plan_id,
    sp.display_name as plan_name,
    us.leads_used,
    us.leads_remaining,
    sp.leads_limit as plan_leads_limit,
    us.updated_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = '84d176eb-4f23-4a18-ac6e-6a867ca90967'
ORDER BY us.updated_at DESC;

-- 6. Testar a função (deve retornar dados do plano gratuito)
SELECT 'TESTANDO FUNÇÃO (deve retornar plano gratuito):' as step;
SELECT get_user_subscription_with_free_trial('84d176eb-4f23-4a18-ac6e-6a867ca90967') as function_result;

