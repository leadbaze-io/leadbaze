-- ==============================================
-- SCRIPT PARA REDEFINIR SENHA DO USUÁRIO
-- ==============================================

-- Usuário encontrado:
-- ID: 95ca9cd7-ecbf-445f-a48b-643927d27ccf
-- Email: creaty123456@gmail.com
-- Criado em: 2025-09-15T23:27:19.174978Z
-- Email confirmado: Sim
-- Último login: 2025-09-15T23:27:54.969561Z

-- ==============================================
-- OPÇÃO 1: REDEFINIR SENHA VIA SQL (DIRETO)
-- ==============================================

-- Definir nova senha (substitua 'nova_senha_aqui' pela senha desejada)
UPDATE auth.users 
SET 
    encrypted_password = crypt('nova_senha_aqui', gen_salt('bf')),
    updated_at = NOW()
WHERE id = '95ca9cd7-ecbf-445f-a48b-643927d27ccf';

-- ==============================================
-- OPÇÃO 2: VERIFICAR SE A ATUALIZAÇÃO FUNCIONOU
-- ==============================================

-- Verificar se a senha foi atualizada
SELECT 
    id,
    email,
    encrypted_password IS NOT NULL as has_password,
    updated_at
FROM auth.users 
WHERE id = '95ca9cd7-ecbf-445f-a48b-643927d27ccf';

-- ==============================================
-- OPÇÃO 3: ENVIAR EMAIL DE REDEFINIÇÃO (RECOMENDADO)
-- ==============================================

-- Esta opção é mais segura e permite ao usuário definir sua própria senha
-- Execute via API ou Dashboard do Supabase:
-- supabase.auth.resetPasswordForEmail('creaty123456@gmail.com')

-- ==============================================
-- INFORMAÇÕES IMPORTANTES
-- ==============================================

-- ⚠️  IMPORTANTE: 
-- 1. As senhas no Supabase são criptografadas com bcrypt
-- 2. A senha original NÃO pode ser recuperada
-- 3. Use a Opção 3 (email de redefinição) quando possível
-- 4. A Opção 1 (SQL direto) deve ser usada apenas em casos especiais

-- ==============================================
-- COMANDOS ADICIONAIS (SE NECESSÁRIO)
-- ==============================================

-- Verificar todos os usuários (para referência)
-- SELECT id, email, created_at, email_confirmed_at FROM auth.users ORDER BY created_at DESC;

-- Verificar se o usuário tem dados relacionados
-- SELECT 
--     'lead_lists' as tabela, COUNT(*) as total
-- FROM lead_lists WHERE user_id = '95ca9cd7-ecbf-445f-a48b-643927d27ccf'
-- UNION ALL
-- SELECT 
--     'whatsapp_templates' as tabela, COUNT(*) as total
-- FROM whatsapp_templates WHERE user_id = '95ca9cd7-ecbf-445f-a48b-643927d27ccf';

