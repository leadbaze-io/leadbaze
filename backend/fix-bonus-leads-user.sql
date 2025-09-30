-- =====================================================
-- CORRIGIR LEADS BÔNUS PARA USUÁRIO ESPECÍFICO
-- =====================================================

-- 1. Verificar se o usuário tem perfil
SELECT 
    'Verificando perfil:' as status,
    up.user_id,
    up.bonus_leads,
    up.bonus_leads_used,
    up.created_at
FROM user_profiles up
WHERE up.user_id = '084b6a9c-49d4-420d-9315-3c01d9620c9d';

-- 2. Atualizar ou inserir leads bônus para o usuário
INSERT INTO user_profiles (
    user_id,
    bonus_leads,
    bonus_leads_used,
    created_at,
    updated_at
) VALUES (
    '084b6a9c-49d4-420d-9315-3c01d9620c9d',
    30, -- 30 leads bônus
    0,  -- nenhum usado ainda
    NOW(),
    NOW()
) ON CONFLICT (user_id) 
DO UPDATE SET 
    bonus_leads = 30,
    bonus_leads_used = 0,
    updated_at = NOW();

-- 3. Verificar se foi atualizado
SELECT 
    'Após atualização:' as status,
    up.user_id,
    up.bonus_leads,
    up.bonus_leads_used,
    up.updated_at
FROM user_profiles up
WHERE up.user_id = '084b6a9c-49d4-420d-9315-3c01d9620c9d';

-- 4. Testar a função de verificação de leads
SELECT check_leads_availability_simple('084b6a9c-49d4-420d-9315-3c01d9620c9d', 1) as disponibilidade;








