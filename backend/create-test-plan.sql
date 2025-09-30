-- Script para criar um plano de teste com R$ 1,00
INSERT INTO payment_plans (
    id,
    name,
    display_name,
    price_cents,
    leads_included,
    features,
    is_active,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'test',
    'Teste',
    100, -- R$ 1,00
    10, -- 10 leads para teste
    ARRAY['Plano de teste', 'R$ 1,00', '10 leads'],
    true,
    NOW(),
    NOW()
);

-- Verificar se foi criado
SELECT id, name, display_name, price_cents, leads_included, is_active 
FROM payment_plans 
WHERE name = 'test';












