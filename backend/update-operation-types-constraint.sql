-- =====================================================
-- ATUALIZAR CONSTRAINT PARA INCLUIR NOVOS TIPOS
-- =====================================================

-- Remover constraint existente
ALTER TABLE leads_usage_history 
DROP CONSTRAINT IF EXISTS leads_usage_history_operation_type_check;

-- Recriar constraint com todos os tipos válidos
ALTER TABLE leads_usage_history 
ADD CONSTRAINT leads_usage_history_operation_type_check 
CHECK (operation_type IN (
    'generated',           -- Lead gerado
    'subscription_created', -- Assinatura criada
    'subscription_cancelled', -- Assinatura cancelada
    'subscription_paused',    -- Assinatura pausada
    'subscription_reactivated', -- Assinatura reativada
    'subscription_upgraded',   -- Upgrade de plano
    'subscription_downgraded', -- Downgrade de plano
    'refund_requested',        -- Reembolso solicitado
    'refund_status_updated',   -- Status do reembolso atualizado
    'refund_completed'         -- Reembolso concluído
));

