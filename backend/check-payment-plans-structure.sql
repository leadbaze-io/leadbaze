-- =====================================================
-- VERIFICAR ESTRUTURA DA TABELA PAYMENT_PLANS
-- =====================================================

-- 1. Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'payment_plans' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar constraints da tabela
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'payment_plans' 
  AND tc.table_schema = 'public'
ORDER BY tc.constraint_type, kcu.ordinal_position;

-- 3. Verificar todos os planos existentes
SELECT 
    id,
    name,
    display_name,
    price_cents,
    (price_cents / 100) as price_reais,
    leads_included,
    created_at,
    updated_at
FROM payment_plans 
ORDER BY id;

-- 4. Verificar se existe plano 'start' especificamente
SELECT 
    COUNT(*) as total_plans,
    COUNT(CASE WHEN name = 'start' THEN 1 END) as start_plans
FROM payment_plans;

-- 5. Se não existir plano 'start', mostrar todos os nomes disponíveis
SELECT DISTINCT name, display_name
FROM payment_plans
ORDER BY name;










