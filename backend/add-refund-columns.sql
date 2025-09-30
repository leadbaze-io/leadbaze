-- Adicionar colunas de reembolso na tabela user_subscriptions
-- Este script adiciona as colunas necessárias para rastrear reembolsos do Mercado Pago

-- Adicionar colunas de reembolso
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS mercado_pago_payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS refund_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS refund_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2);

-- Adicionar comentários para documentação
COMMENT ON COLUMN user_subscriptions.mercado_pago_payment_id IS 'ID do pagamento no Mercado Pago para processar reembolsos';
COMMENT ON COLUMN user_subscriptions.refund_id IS 'ID do reembolso processado no Mercado Pago';
COMMENT ON COLUMN user_subscriptions.refund_status IS 'Status do reembolso: pending, approved, rejected, cancelled';
COMMENT ON COLUMN user_subscriptions.refund_amount IS 'Valor do reembolso processado';

-- Criar índice para melhor performance nas consultas de reembolso
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_refund_id ON user_subscriptions(refund_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_payment_id ON user_subscriptions(mercado_pago_payment_id);

-- Verificar se as colunas foram adicionadas
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions' 
  AND column_name IN ('mercado_pago_payment_id', 'refund_id', 'refund_status', 'refund_amount')
ORDER BY column_name;


