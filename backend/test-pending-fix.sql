-- Testar se a correção está funcionando
-- 1. Verificar assinaturas do usuário
SELECT 
    us.id,
    us.user_id,
    us.status,
    us.recurring_status,
    us.plan_id,
    sp.display_name as plan_name,
    us.leads_used,
    us.leads_remaining,
    us.mercado_pago_preapproval_id,
    us.updated_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = '84d176eb-4f23-4a18-ac6e-6a867ca90967'
ORDER BY us.updated_at DESC;

-- 2. Testar a função corrigida
SELECT get_user_subscription_with_free_trial('84d176eb-4f23-4a18-ac6e-6a867ca90967') as subscription_data;

-- 3. Verificar se a função retorna apenas assinaturas ativas/canceladas (não pending)
SELECT 
    'Função deve retornar NULL se só houver assinaturas pending' as test_result,
    CASE 
        WHEN get_user_subscription_with_free_trial('84d176eb-4f23-4a18-ac6e-6a867ca90967') IS NULL 
        THEN '✅ CORRETO - Função retorna NULL para assinaturas pending'
        ELSE '❌ ERRO - Função ainda retorna dados de assinatura pending'
    END as test_status;

