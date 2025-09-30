-- =====================================================
-- VERIFICAR FUNÇÃO DE LEADS BÔNUS
-- =====================================================

-- 1. Verificar se a função existe
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'give_bonus_leads_to_new_user'
  AND routine_schema = 'public';

-- 2. Verificar se o usuário tem perfil e leads bônus
SELECT 
    'Perfil do usuário:' as status,
    up.user_id,
    up.bonus_leads,
    up.bonus_leads_used,
    up.created_at,
    up.updated_at
FROM user_profiles up
WHERE up.user_id = '084b6a9c-49d4-420d-9315-3c01d9620c9d';

-- 3. Verificar se o usuário existe na tabela auth.users
SELECT 
    'Usuário auth:' as status,
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at
FROM auth.users u
WHERE u.id = '084b6a9c-49d4-420d-9315-3c01d9620c9d';

-- 4. Testar a função diretamente
SELECT give_bonus_leads_to_new_user('084b6a9c-49d4-420d-9315-3c01d9620c9d') as resultado;









