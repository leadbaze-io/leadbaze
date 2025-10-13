-- Criar tabela de webhooks do Perfect Pay
CREATE TABLE IF NOT EXISTS perfect_pay_webhooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    webhook_data JSONB NOT NULL,
    signature TEXT,
    processed BOOLEAN DEFAULT FALSE,
    status TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_perfect_pay_webhooks_processed ON perfect_pay_webhooks(processed);
CREATE INDEX IF NOT EXISTS idx_perfect_pay_webhooks_created_at ON perfect_pay_webhooks(created_at);
CREATE INDEX IF NOT EXISTS idx_perfect_pay_webhooks_status ON perfect_pay_webhooks(status);

-- Comentários
COMMENT ON TABLE perfect_pay_webhooks IS 'Webhooks recebidos do Perfect Pay';
COMMENT ON COLUMN perfect_pay_webhooks.webhook_data IS 'Dados completos do webhook em JSON';
COMMENT ON COLUMN perfect_pay_webhooks.signature IS 'Assinatura do webhook para validação';
COMMENT ON COLUMN perfect_pay_webhooks.processed IS 'Se o webhook foi processado com sucesso';
COMMENT ON COLUMN perfect_pay_webhooks.status IS 'Status do processamento (success, error, pending)';
COMMENT ON COLUMN perfect_pay_webhooks.error_message IS 'Mensagem de erro se houver falha no processamento';







