-- =====================================================
-- SCRIPT SIMPLES PARA COPIAR LISTA "TESTE DISPARO"
-- =====================================================
-- Execute este script diretamente no SQL Editor do Supabase

-- 1. Primeiro, vamos verificar se os usuários existem
SELECT 
    'Verificando usuários...' as status,
    u.id,
    u.email
FROM auth.users u 
WHERE u.email IN ('creaty12345@gmail.com', 'dvemarketingadm@gmail.com');

-- 2. Verificar a lista original
SELECT 
    'Lista original encontrada:' as status,
    ll.id,
    ll.name,
    ll.total_leads,
    u.email as owner
FROM lead_lists ll
JOIN auth.users u ON ll.user_id = u.id
WHERE u.email = 'creaty12345@gmail.com' 
  AND ll.name = 'Teste Disparo';

-- 3. COPIAR A LISTA (execute esta parte)
INSERT INTO lead_lists (
    user_id,
    name,
    description,
    leads,
    total_leads,
    tags,
    status,
    created_at,
    updated_at
)
SELECT 
    (SELECT id FROM auth.users WHERE email = 'dvemarketingadm@gmail.com') as user_id,
    'Teste Disparo (Cópia)' as name,
    'Cópia da lista original de creaty12345@gmail.com' as description,
    leads,
    total_leads,
    tags,
    status,
    NOW() as created_at,
    NOW() as updated_at
FROM lead_lists ll
JOIN auth.users u ON ll.user_id = u.id
WHERE u.email = 'creaty12345@gmail.com' 
  AND ll.name = 'Teste Disparo';

-- 4. Verificar se a cópia foi criada
SELECT 
    'Lista copiada criada:' as status,
    ll.id,
    ll.name,
    ll.total_leads,
    u.email as owner,
    ll.created_at
FROM lead_lists ll
JOIN auth.users u ON ll.user_id = u.id
WHERE u.email = 'dvemarketingadm@gmail.com' 
  AND ll.name = 'Teste Disparo (Cópia)';











