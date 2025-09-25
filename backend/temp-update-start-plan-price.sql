-- Script temporário para alterar o valor do plano Start para R$ 1,00 (100 centavos)
-- Para testar se o problema é o valor ou a validação do cartão

UPDATE payment_plans 
SET price_cents = 100, -- R$ 1,00
    updated_at = NOW()
WHERE name = 'start';

-- Verificar a alteração
SELECT id, name, display_name, price_cents, leads_included, is_active, updated_at 
FROM payment_plans 
WHERE name = 'start';






