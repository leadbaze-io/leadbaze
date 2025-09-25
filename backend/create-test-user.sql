-- Criar usuário de teste completo
INSERT INTO users (
    id,
    email,
    name,
    created_at,
    updated_at
) VALUES (
    'test-user-complete-123',
    'teste.completo@example.com',
    'Usuário Teste Completo',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    name = 'Usuário Teste Completo',
    updated_at = NOW();

-- Verificar se foi criado
SELECT id, email, name, created_at FROM users WHERE email = 'teste.completo@example.com';

