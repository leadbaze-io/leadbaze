-- Verificar se a assinatura foi ativada após o webhook
SELECT 'ASSINATURA APÓS WEBHOOK:' as step;
SELECT 
    us.id,
    us.user_id,
    us.status,
    us.recurring_status,
    us.plan_id,
    sp.display_name as plan_name,
    us.mercado_pago_preapproval_id,
    us.updated_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = '84d176eb-4f23-4a18-ac6e-6a867ca90967'
  AND us.mercado_pago_preapproval_id = '13b44673d7bb48048d4d4a2e16cd9d81'
ORDER BY us.updated_at DESC;

-- Verificar se há alguma assinatura ativa agora
SELECT 'ASSINATURAS ATIVAS:' as step;
SELECT 
    us.id,
    us.user_id,
    us.status,
    us.recurring_status,
    us.plan_id,
    sp.display_name as plan_name,
    us.mercado_pago_preapproval_id,
    us.updated_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = '84d176eb-4f23-4a18-ac6e-6a867ca90967'
  AND us.status = 'active'
ORDER BY us.updated_at DESC;

