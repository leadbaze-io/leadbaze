-- =====================================================
-- LIMPEZA FINAL DE CAMPOS MERCADOPAGO RESTANTES
-- =====================================================

-- Remover campos MercadoPago restantes da tabela user_payment_subscriptions
ALTER TABLE user_payment_subscriptions 
DROP COLUMN IF EXISTS mercadopago_preapproval_id,
DROP COLUMN IF EXISTS mercadopago_payer_id,
DROP COLUMN IF EXISTS mercadopago_payment_method_id;

-- Verificar estrutura final
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_payment_subscriptions'
ORDER BY ordinal_position;













