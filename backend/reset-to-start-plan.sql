-- Reset user subscription to Start plan for testing
-- This will set the user back to Start plan with 800 leads

-- First, delete any existing subscriptions for the test user
DELETE FROM user_subscriptions 
WHERE user_id = '5069fa1e-5de4-44f8-9f45-8ef95a57f0b0';

-- Insert new Start plan subscription
INSERT INTO user_subscriptions (
  id,
  user_id,
  plan_id,
  status,
  billing_cycle,
  leads_used,
  leads_remaining,
  created_at
) VALUES (
  gen_random_uuid(),
  '5069fa1e-5de4-44f8-9f45-8ef95a57f0b0',
  (SELECT id FROM subscription_plans WHERE name = 'start' LIMIT 1),
  'active',
  'monthly',
  0,  -- No leads used yet
  800, -- 800 leads remaining
  NOW()
);

-- Verify the subscription was created
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
