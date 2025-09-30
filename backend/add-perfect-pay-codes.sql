-- Adicionar coluna codigo_perfect_pay na tabela payment_plans
ALTER TABLE payment_plans 
ADD COLUMN IF NOT EXISTS codigo_perfect_pay VARCHAR(50);

-- Atualizar códigos dos planos
UPDATE payment_plans 
SET codigo_perfect_pay = 'PPLQQNGCO' 
WHERE name = 'start';

UPDATE payment_plans 
SET codigo_perfect_pay = 'PPLQQNGCM' 
WHERE name = 'scale';

UPDATE payment_plans 
SET codigo_perfect_pay = 'PPLQQNGCN' 
WHERE name = 'enterprise';

-- Verificar atualização
SELECT name, display_name, codigo_perfect_pay, price_cents, leads_included 
FROM payment_plans 
ORDER BY price_cents;



