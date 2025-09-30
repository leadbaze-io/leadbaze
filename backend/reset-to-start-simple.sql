-- Reset user subscription to Start plan for testing
-- Using the same structure that worked before

-- 1. Delete existing subscriptions
DELETE FROM user_subscriptions 
WHERE user_id = '5069fa1e-5de4-44f8-9f45-8ef95a57f0b0';

-- 2. Create Start plan subscription with 800 leads remaining
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
  (SELECT id FROM subscription_plans WHERE name = 'start' LIMIT 1),
  'active',
  'monthly',
  NOW() - INTERVAL '15 days',
  NOW() + INTERVAL '15 days',
  200, -- Used 200 leads
  800, -- 800 leads remaining
  true,
  'test-reset-to-start',
  'creaty1234567@gmail.com'
);

-- 3. Verify the subscription
SELECT 
  us.id,
  sp.display_name as plan_name,
  us.leads_used,
  us.leads_remaining,
  us.status,
  us.created_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = '5069fa1e-5de4-44f8-9f45-8ef95a57f0b0'
ORDER BY us.created_at DESC;



