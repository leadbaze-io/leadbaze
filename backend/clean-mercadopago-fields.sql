-- =====================================================
-- LIMPEZA DE CAMPOS MERCADOPAGO - PERFECT PAY MIGRATION
-- =====================================================

-- 1. Remover colunas MercadoPago da tabela payment_webhooks
ALTER TABLE payment_webhooks 
DROP COLUMN IF EXISTS mercadopago_id,
DROP COLUMN IF EXISTS mercadopago_payment_id,
DROP COLUMN IF EXISTS mercadopago_status;

-- 2. Remover colunas MercadoPago da tabela user_payment_subscriptions
ALTER TABLE user_payment_subscriptions 
DROP COLUMN IF EXISTS mercadopago_subscription_id,
DROP COLUMN IF EXISTS mercadopago_payment_id,
DROP COLUMN IF EXISTS mercadopago_status;

-- 3. Verificar se existem outras referências ao MercadoPago
-- (Comentário: Se houver outras tabelas com campos MercadoPago, adicione aqui)

-- 4. Atualizar comentários das tabelas
COMMENT ON TABLE payment_webhooks IS 'Webhooks de pagamento - Perfect Pay';
COMMENT ON TABLE user_payment_subscriptions IS 'Assinaturas de usuários - Perfect Pay';

-- 5. Verificar estrutura final
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('payment_webhooks', 'user_payment_subscriptions')
ORDER BY table_name, ordinal_position;











