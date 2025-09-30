-- =====================================================
-- VERIFICAR ASSINATURAS DO USUÁRIO DE TESTE
-- =====================================================

-- Verificar assinaturas do usuário específico
SELECT 
    'Assinaturas do usuário:' as status,
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

-- Verificar se o plano Start está sendo referenciado corretamente
SELECT 
    'Plano Start detalhes:' as status,
    id,
    name,
    display_name
FROM payment_plans 
WHERE name = 'start';

-- Verificar últimos webhooks processados
SELECT 
    'Últimos webhooks:' as status,
    id,
    perfect_pay_id,
    action,
    processed,
    created_at,
    SUBSTRING(raw_data::text, 1, 200) as raw_data_preview
FROM payment_webhooks 
WHERE raw_data::text LIKE '%39dc6c62-6dea-4222-adb5-7075fd704189%'
ORDER BY created_at DESC
LIMIT 3;











