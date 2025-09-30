-- =====================================================
-- ADICIONAR COLUNAS FALTANTES PARA CANCELAMENTO
-- =====================================================

-- Adicionar coluna perfect_pay_cancelled
ALTER TABLE user_payment_subscriptions 
ADD COLUMN IF NOT EXISTS perfect_pay_cancelled BOOLEAN DEFAULT FALSE;

-- Adicionar coluna requires_manual_cancellation
ALTER TABLE user_payment_subscriptions 
ADD COLUMN IF NOT EXISTS requires_manual_cancellation BOOLEAN DEFAULT FALSE;

-- Adicionar comentários para documentação
COMMENT ON COLUMN user_payment_subscriptions.perfect_pay_cancelled IS 'Indica se a assinatura foi cancelada no Perfect Pay';
COMMENT ON COLUMN user_payment_subscriptions.requires_manual_cancellation IS 'Indica se é necessário cancelamento manual no Perfect Pay';

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_payment_subscriptions' 
  AND column_name IN ('perfect_pay_cancelled', 'requires_manual_cancellation')
ORDER BY column_name;










