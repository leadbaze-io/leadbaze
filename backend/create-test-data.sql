-- =====================================================
-- CRIAÇÃO DE DADOS DE TESTE PARA PERFECT PAY
-- =====================================================

-- 1. Criar usuário de teste
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    'c7f5c454-36fb-4a39-8460-620a09169f50',
    'joao.teste@email.com',
    '$2a$10$dummy.hash.for.test.user',
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "João Silva Teste"}',
    false,
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- 2. Criar perfil do usuário de teste
INSERT INTO user_profiles (
    id,
    user_id,
    tax_type,
    email,
    full_name,
    created_at,
    updated_at
) VALUES (
    'c7f5c454-36fb-4a39-8460-620a09169f50',
    'c7f5c454-36fb-4a39-8460-620a09169f50',
    'individual', -- Tipo de pessoa física
    'joao.teste@email.com',
    'João Silva Teste',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. Criar plano de teste
INSERT INTO payment_plans (
    id,
    name,
    display_name,
    price_cents,
    leads_included,
    created_at,
    updated_at
) VALUES (
    '1',
    'start',
    'Plano Start',
    9700, -- R$ 97,00
    1000,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 4. Verificar se os dados foram criados
SELECT 
    'Usuário criado:' as status,
    u.id,
    u.email,
    p.email as profile_email
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.user_id
WHERE u.id = 'c7f5c454-36fb-4a39-8460-620a09169f50';

SELECT 
    'Plano criado:' as status,
    id,
    name,
    display_name,
    price_cents,
    leads_included
FROM payment_plans
WHERE id = '1';
