-- =====================================================
-- ADICIONAR CAMPOS DE CANCELAMENTO PARA PERFECT PAY
-- =====================================================

-- Adicionar campo para motivo do cancelamento
ALTER TABLE user_payment_subscriptions 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Adicionar campo para data do cancelamento (se não existir)
ALTER TABLE user_payment_subscriptions 
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- Verificar se os campos foram adicionados
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_payment_subscriptions' 
  AND column_name IN ('cancellation_reason', 'cancelled_at')
ORDER BY column_name;














