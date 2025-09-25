-- =====================================================
-- LISTAR TODOS OS PLANOS DETALHADAMENTE
-- =====================================================

-- Verificar TODOS os planos existentes com detalhes completos
SELECT 
    id,
    name,
    display_name,
    (price_cents / 100) as price_reais,
    leads_included,
    is_active,
    created_at
FROM payment_plans 
ORDER BY created_at;


