-- =====================================================
-- TESTAR API DE LEADS PARA O USUÁRIO
-- =====================================================

-- 1. Testar função de verificação de leads disponíveis
SELECT 
    'Teste API leads:' as status,
    check_leads_availability_simple('084b6a9c-49d4-420d-9315-3c01d9620c9d', 1) as resultado;

-- 2. Verificar se existe função consume_leads_simple
SELECT 
    'Função consume_leads_simple:' as status,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'consume_leads_simple'
  AND routine_schema = 'public';

-- 3. Testar função de consumo de leads (1 lead)
SELECT 
    'Teste consumo 1 lead:' as status,
    consume_leads_simple('084b6a9c-49d4-420d-9315-3c01d9620c9d', 1, 'teste') as resultado;

-- 4. Verificar leads após teste
SELECT 
    'Leads após teste:' as status,
    up.bonus_leads,
    up.bonus_leads_used,
    (up.bonus_leads - up.bonus_leads_used) as leads_disponiveis
FROM user_profiles up
WHERE up.user_id = '084b6a9c-49d4-420d-9315-3c01d9620c9d';









