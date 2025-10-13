-- =====================================================
-- DEBUG COMPLETO DA DISPONIBILIDADE DE LEADS
-- =====================================================

-- 1. Testar função de verificação de leads disponíveis
SELECT 
    'Teste disponibilidade:' as status,
    check_leads_availability_simple('084b6a9c-49d4-420d-9315-3c01d9620c9d', 50) as resultado_50_leads;

-- 2. Testar com quantidade menor
SELECT 
    'Teste disponibilidade:' as status,
    check_leads_availability_simple('084b6a9c-49d4-420d-9315-3c01d9620c9d', 10) as resultado_10_leads;

-- 3. Verificar perfil do usuário
SELECT 
    'Perfil atual:' as status,
    up.bonus_leads,
    up.bonus_leads_used,
    (up.bonus_leads - up.bonus_leads_used) as leads_disponiveis
FROM user_profiles up
WHERE up.user_id = '084b6a9c-49d4-420d-9315-3c01d9620c9d';

-- 4. Verificar se tem assinatura ativa
SELECT 
    'Assinaturas:' as status,
    ups.id,
    ups.status,
    ups.plan_id,
    ups.current_period_end,
    pp.display_name as plan_name
FROM user_payment_subscriptions ups
LEFT JOIN payment_plans pp ON ups.plan_id = pp.id
WHERE ups.user_id = '084b6a9c-49d4-420d-9315-3c01d9620c9d'
ORDER BY ups.created_at DESC;













