-- =====================================================
-- SINCRONIZAR PREÇOS COM PERFECT PAY
-- =====================================================

-- 1. Verificar preços atuais
SELECT 
    name,
    display_name,
    (price_cents / 100) as price_atual,
    leads_included
FROM payment_plans 
ORDER BY price_cents;

-- 2. Atualizar Start: R$ 197 (19700 centavos)
UPDATE payment_plans 
SET 
    price_cents = 19700,
    updated_at = NOW()
WHERE name = 'start';

-- 3. Atualizar Scale: R$ 497 (49700 centavos)
UPDATE payment_plans 
SET 
    price_cents = 49700,
    updated_at = NOW()
WHERE name = 'scale';

-- 4. Atualizar Enterprise: R$ 997 (99700 centavos)  
UPDATE payment_plans 
SET 
    price_cents = 99700,
    updated_at = NOW()
WHERE name = 'enterprise';

-- 5. Verificar alterações aplicadas
SELECT 
    name,
    display_name,
    (price_cents / 100) as price_novo,
    leads_included,
    updated_at
FROM payment_plans 
ORDER BY price_cents;

-- 6. Resumo do mapeamento Perfect Pay
SELECT 
    name as plano_interno,
    display_name,
    (price_cents / 100) as preco_reais,
    leads_included,
    CASE 
        WHEN name = 'start' THEN 'PPLQQNGCO'
        WHEN name = 'scale' THEN 'PPLQQNGCM' 
        WHEN name = 'enterprise' THEN 'PPLQQNGCN'
    END as codigo_perfect_pay
FROM payment_plans 
ORDER BY price_cents;


