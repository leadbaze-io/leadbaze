-- Verificar usuários existentes
SELECT id, email, name, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;

