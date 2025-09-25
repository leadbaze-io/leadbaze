-- =====================================================
-- ADICIONAR CAMPOS PERFECT PAY
-- =====================================================

-- 1. Adicionar campo perfect_pay_id na tabela payment_webhooks
ALTER TABLE payment_webhooks 
ADD COLUMN IF NOT EXISTS perfect_pay_id TEXT;

-- 2. Adicionar campo perfect_pay_transaction_id na tabela user_payment_subscriptions  
ALTER TABLE user_payment_subscriptions 
ADD COLUMN IF NOT EXISTS perfect_pay_transaction_id TEXT;



