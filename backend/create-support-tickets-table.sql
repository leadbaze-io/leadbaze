-- Criar tabela de tickets de suporte
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'cancellation', 'downgrade', 'refund', etc.
  priority VARCHAR(20) DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
  status VARCHAR(20) DEFAULT 'OPEN', -- 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'
  subject VARCHAR(200) NOT NULL,
  description TEXT,
  perfect_pay_subscription_id VARCHAR(100),
  perfect_pay_transaction_id VARCHAR(100),
  metadata JSONB, -- Dados adicionais específicos do tipo de ticket
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  assigned_to VARCHAR(100), -- Email do suporte responsável
  resolution_notes TEXT
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_support_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_tickets_updated_at();

-- Inserir ticket de exemplo
INSERT INTO support_tickets (
  ticket_id,
  user_id,
  type,
  priority,
  subject,
  description,
  perfect_pay_subscription_id,
  metadata
) VALUES (
  'CANCEL-1735123456789-132bc618',
  '132bc618-23ef-483e-a96f-2027a8f47619',
  'cancellation',
  'HIGH',
  'Cancelamento de Assinatura - Requer Ação Manual',
  'Usuário solicitou cancelamento de assinatura. Cancelamento local registrado, mas requer cancelamento manual no Perfect Pay.',
  'PPSUB1O91FP1I',
  '{"requires_manual_cancellation": true, "access_until": "2025-10-25T00:00:00Z"}'
) ON CONFLICT (ticket_id) DO NOTHING;








