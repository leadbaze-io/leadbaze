-- =====================================================
-- ATUALIZAR PREÇO DO PLANO ENTERPRISE
-- =====================================================

-- Atualizar o preço do plano Enterprise para R$ 997/mês
UPDATE subscription_plans 
SET 
  price_monthly = 997.00,
  price_yearly = 9970.00, -- 10% desconto anual
  updated_at = NOW()
WHERE name = 'enterprise';

-- Verificar a atualização
SELECT 
  name,
  display_name,
  price_monthly,
  price_yearly,
  leads_limit,
  updated_at
FROM subscription_plans 
WHERE name = 'enterprise';

-- Comentário: O plano Enterprise agora custa R$ 997/mês com 10.000 leads








