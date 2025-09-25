-- Adicionar coluna external_reference na tabela upgrade_pending
ALTER TABLE upgrade_pending ADD COLUMN IF NOT EXISTS external_reference VARCHAR(255);
ALTER TABLE upgrade_pending ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255);
ALTER TABLE upgrade_pending ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_upgrade_pending_external_reference ON upgrade_pending(external_reference);
CREATE INDEX IF NOT EXISTS idx_upgrade_pending_payment_id ON upgrade_pending(payment_id);

