-- Verificar status atual do usuário creaty123456@gmail
SELECT 
    us.id,
    us.user_id,
    us.status,
    us.recurring_status,
    us.plan_id,
    us.leads_used,
    us.leads_remaining,
    sp.display_name as plan_name,
    sp.leads_limit as plan_leads_limit,
    us.mercado_pago_preapproval_id,
    us.updated_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = '84d176eb-4f23-4a18-ac6e-6a867ca90967'
ORDER BY us.updated_at DESC;
