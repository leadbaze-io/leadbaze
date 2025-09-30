-- Adicionar colunas de cancelamento na tabela user_subscriptions
-- Este script adiciona as colunas necessárias para rastrear cancelamentos

-- Adicionar colunas de cancelamento
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancel_reason TEXT;

-- Adicionar comentários para documentação
COMMENT ON COLUMN user_subscriptions.cancelled_at IS 'Data e hora do cancelamento da assinatura';
COMMENT ON COLUMN user_subscriptions.cancel_reason IS 'Motivo do cancelamento informado pelo usuário';

-- Criar índice para melhor performance nas consultas de cancelamento
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_cancelled_at ON user_subscriptions(cancelled_at);

-- Verificar se as colunas foram adicionadas
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions' 
  AND column_name IN ('cancelled_at', 'cancel_reason')
ORDER BY column_name;


