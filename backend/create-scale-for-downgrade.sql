-- Limpar assinaturas existentes
DELETE FROM user_subscriptions 
WHERE user_id = '5069fa1e-5de4-44f8-9f45-8ef95a57f0b0';

-- Criar assinatura Scale para testar downgrade
INSERT INTO user_subscriptions (
  user_id,
  plan_id,
  status,
  billing_cycle,
  current_period_start,
  current_period_end,
  leads_used,
  leads_remaining,
  auto_renewal,
  gateway_subscription_id,
  gateway_customer_id
) VALUES (
  '5069fa1e-5de4-44f8-9f45-8ef95a57f0b0',
  '885ba694-e01a-45d7-b367-b2da0059bf29', -- Scale plan ID
  'active',
  'monthly',
  NOW() - INTERVAL '10 days',
  NOW() + INTERVAL '20 days',
  1000, -- Usou 1000 leads
  3000, -- Restam 3000 leads
  true,
  'test-scale-for-downgrade',
  'test-customer'
);

-- Verificar se foi criada
SELECT 
  us.id,
  sp.display_name as plan_name,
  sp.price_monthly,
  us.leads_used,
  us.leads_remaining,
  us.status,
  us.created_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = '5069fa1e-5de4-44f8-9f45-8ef95a57f0b0'
ORDER BY us.created_at DESC;



