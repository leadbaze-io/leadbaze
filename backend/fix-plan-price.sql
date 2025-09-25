-- Corrigir preço do plano Start
UPDATE payment_plans 
SET 
    price_reais = 197,
    updated_at = NOW()
WHERE name = 'start';

-- Verificar se foi atualizado
SELECT 
    'Plano Start atualizado:' as status,
    id,
    name,
    display_name,
    price_reais,
    leads_included,
    is_active,
    updated_at
FROM payment_plans 
WHERE name = 'start';


