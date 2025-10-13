-- =====================================================
-- VERIFICAR SE FUNÇÃO get_original_subscription_info EXISTE
-- =====================================================

-- 1. Verificar se a função existe
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'get_original_subscription_info'
AND routine_schema = 'public';

-- 2. Se não existir, criar uma versão simplificada
CREATE OR REPLACE FUNCTION get_original_subscription_info(p_user_id UUID)
RETURNS TABLE (
    original_subscription_date TIMESTAMP WITH TIME ZONE,
    first_plan_id UUID,
    first_plan_name TEXT,
    first_plan_price INTEGER,
    upgrade_count INTEGER,
    downgrade_count INTEGER,
    total_amount_paid INTEGER
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ups.created_at as original_subscription_date,
        ups.plan_id as first_plan_id,
        pp.display_name as first_plan_name,
        pp.price_cents as first_plan_price,
        0::INTEGER as upgrade_count,
        0::INTEGER as downgrade_count,
        pp.price_cents as total_amount_paid
    FROM user_payment_subscriptions ups
    LEFT JOIN payment_plans pp ON ups.plan_id = pp.id
    WHERE ups.user_id = p_user_id
    ORDER BY ups.created_at ASC
    LIMIT 1;
END;
$$;

-- 3. Testar a função
SELECT * FROM get_original_subscription_info('f20ceb6a-0e59-477c-9a85-afc39ea90afe'::UUID);











