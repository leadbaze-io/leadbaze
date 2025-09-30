-- =====================================================
-- VERIFICAR SE OS LEADS BÔNUS ESTÃO FUNCIONANDO
-- =====================================================

-- 1. Verificar perfil do usuário
SELECT 
    'Perfil do usuário:' as status,
    up.user_id,
    up.bonus_leads,
    up.bonus_leads_used,
    up.created_at,
    up.updated_at
FROM user_profiles up
WHERE up.user_id = '084b6a9c-49d4-420d-9315-3c01d9620c9d';

-- 2. Testar função de verificação de leads disponíveis
SELECT 
    'Verificação de leads:' as status,
    check_leads_availability_simple('084b6a9c-49d4-420d-9315-3c01d9620c9d', 1) as disponibilidade;

-- 3. Verificar se o usuário tem assinatura ativa
SELECT 
    'Assinaturas do usuário:' as status,
    ups.id,
    ups.status,
    ups.plan_id,
    ups.current_period_end,
    pp.display_name as plan_name
FROM user_payment_subscriptions ups
LEFT JOIN payment_plans pp ON ups.plan_id = pp.id
WHERE ups.user_id = '084b6a9c-49d4-420d-9315-3c01d9620c9d'
ORDER BY ups.created_at DESC;











