-- =====================================================
-- VERIFICAR TABELA payment_plans COMPLETA
-- =====================================================

-- 1. Verificar TODOS os planos existentes
SELECT 
    id,
    name,
    display_name,
    (price_cents / 100) as price_reais,
    leads_included,
    is_active,
    created_at,
    updated_at
FROM payment_plans 
ORDER BY created_at;

-- 2. Verificar especificamente o plano "start"
SELECT 
    'Plano Start:' as status,
    id,
    name,
    display_name,
    (price_cents / 100) as price_reais,
    leads_included,
    is_active
FROM payment_plans 
WHERE name = 'start';

-- 3. Verificar se existem planos com nomes similares
SELECT 
    'Planos similares:' as status,
    id,
    name,
    display_name
FROM payment_plans 
WHERE name ILIKE '%start%' OR display_name ILIKE '%start%';

-- 5. Contar total de planos
SELECT 
    'Total de planos:' as status,
    COUNT(*) as total
FROM payment_plans;
