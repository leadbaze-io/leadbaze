-- =====================================================
-- ATUALIZAR CÓDIGOS PERFECT PAY PARA OS NOVOS
-- =====================================================

-- 1. Verificar códigos atuais
SELECT 
    name as plano_interno,
    display_name,
    (price_cents / 100) as preco_reais,
    leads_included,
    CASE 
        WHEN name = 'start' THEN 'PPLQQNG92'
        WHEN name = 'scale' THEN 'PPLQQNG90' 
        WHEN name = 'enterprise' THEN 'PPLQQNG91'
    END as codigo_atual
FROM payment_plans 
ORDER BY price_cents;

-- 2. Atualizar códigos Perfect Pay (se houver coluna específica)
-- Nota: Os códigos são usados apenas no código JavaScript, não no banco
-- Mas vamos documentar os novos códigos aqui

-- NOVOS CÓDIGOS PERFECT PAY:
-- Start: PPLQQNGCO → https://go.perfectpay.com.br/PPU38CQ17OT
-- Scale: PPLQQNGCM → https://go.perfectpay.com.br/PPU38CQ17OP  
-- Enterprise: PPLQQNGCN → https://go.perfectpay.com.br/PPU38CQ17OS

-- 3. Verificar se há alguma coluna para armazenar códigos Perfect Pay
-- (Normalmente esses códigos ficam apenas no código JavaScript)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payment_plans' 
AND column_name LIKE '%perfect%' OR column_name LIKE '%code%';

-- 4. Resumo final dos planos atualizados
SELECT 
    name as plano_interno,
    display_name,
    (price_cents / 100) as preco_reais,
    leads_included,
    CASE 
        WHEN name = 'start' THEN 'PPLQQNGCO'
        WHEN name = 'scale' THEN 'PPLQQNGCM' 
        WHEN name = 'enterprise' THEN 'PPLQQNGCN'
    END as codigo_perfect_pay_novo
FROM payment_plans 
ORDER BY price_cents;






