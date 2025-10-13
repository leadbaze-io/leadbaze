-- =====================================================
-- VERIFICAR ESTRUTURA DA TABELA user_payment_subscriptions
-- =====================================================

-- 1. Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_payment_subscriptions'
ORDER BY ordinal_position;

-- 2. Verificar estrutura da tabela payment_plans
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'payment_plans'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da tabela user_subscription_activities
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_subscription_activities'
ORDER BY ordinal_position;

-- 4. Verificar dados de exemplo da tabela user_payment_subscriptions
SELECT * FROM user_payment_subscriptions LIMIT 1;

-- 5. Verificar dados de exemplo da tabela payment_plans
SELECT * FROM payment_plans LIMIT 3;







