-- =====================================================
-- ATUALIZAR PREÇO DO PLANO START PARA R$ 200
-- =====================================================

-- 1. Verificar plano atual
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
WHERE name = 'start';

-- 2. Atualizar preço para R$ 200 (20000 centavos)
UPDATE payment_plans 
SET 
    price_cents = 20000,
    updated_at = NOW()
WHERE name = 'start';

-- 3. Verificar alteração aplicada
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
WHERE name = 'start';

-- 4. Verificar todos os planos para contexto
SELECT 
    name,
    display_name,
    (price_cents / 100) as price_reais,
    leads_included
FROM payment_plans 
ORDER BY price_cents;

-- Log da alteração (comentário)
-- Plano Start atualizado de R$ 97 para R$ 200
-- Data: NOW()
-- Atualizado por: admin