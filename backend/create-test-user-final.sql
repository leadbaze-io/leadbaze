-- Criar usuário de teste final
INSERT INTO users (
    id,
    email,
    name,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'teste.completo@example.com',
    'Usuário Teste Completo',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = 'teste.completo@example.com',
    name = 'Usuário Teste Completo',
    updated_at = NOW();

-- Verificar se foi criado
SELECT id, email, name, created_at FROM users WHERE id = '550e8400-e29b-41d4-a716-446655440000';

