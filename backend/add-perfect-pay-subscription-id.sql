-- =====================================================
-- ADICIONAR COLUNA PERFECT_PAY_SUBSCRIPTION_ID
-- =====================================================

-- Adicionar coluna perfect_pay_subscription_id
ALTER TABLE user_payment_subscriptions 
ADD COLUMN IF NOT EXISTS perfect_pay_subscription_id VARCHAR(255);

-- Adicionar comentário para documentação
COMMENT ON COLUMN user_payment_subscriptions.perfect_pay_subscription_id IS 'ID da assinatura no Perfect Pay';

-- Verificar se a coluna foi criada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_payment_subscriptions' 
  AND column_name = 'perfect_pay_subscription_id';












