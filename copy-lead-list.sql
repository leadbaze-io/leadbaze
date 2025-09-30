-- =====================================================
-- SCRIPT PARA COPIAR LISTA DE LEADS ENTRE USUÁRIOS
-- =====================================================
-- Este script copia a lista "Teste Disparo" do usuário creaty12345@gmail.com
-- para o usuário dvemarketingadm@gmail.com

-- =====================================================
-- 1. VERIFICAR USUÁRIOS E LISTA ORIGINAL
-- =====================================================

-- Verificar se os usuários existem
SELECT 
    'Usuários encontrados:' as info,
    u.id,
    u.email,
    u.created_at
FROM auth.users u 
WHERE u.email IN ('creaty12345@gmail.com', 'dvemarketingadm@gmail.com')
ORDER BY u.email;

-- Verificar a lista original
SELECT 
    'Lista original encontrada:' as info,
    ll.id,
    ll.name,
    ll.description,
    ll.total_leads,
    ll.status,
    ll.created_at,
    u.email as owner_email
FROM lead_lists ll
JOIN auth.users u ON ll.user_id = u.id
WHERE u.email = 'creaty12345@gmail.com' 
  AND ll.name = 'Teste Disparo';

-- =====================================================
-- 2. COPIAR A LISTA DE LEADS
-- =====================================================

-- Inserir a cópia da lista para o usuário destino
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
    name || ' (Cópia)' as name,  -- Adiciona "(Cópia)" ao nome
    COALESCE(description, '') || ' - Cópia da lista original de ' || 
    (SELECT email FROM auth.users WHERE email = 'creaty12345@gmail.com') as description,
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

-- =====================================================
-- 3. VERIFICAR SE A CÓPIA FOI CRIADA
-- =====================================================

-- Verificar a lista copiada
SELECT 
    'Lista copiada criada:' as info,
    ll.id,
    ll.name,
    ll.description,
    ll.total_leads,
    ll.status,
    ll.created_at,
    u.email as owner_email
FROM lead_lists ll
JOIN auth.users u ON ll.user_id = u.id
WHERE u.email = 'dvemarketingadm@gmail.com' 
  AND ll.name LIKE '%Teste Disparo%'
ORDER BY ll.created_at DESC;

-- =====================================================
-- 4. VERIFICAR DADOS DOS LEADS COPIADOS
-- =====================================================

-- Verificar os leads da lista copiada
SELECT 
    'Leads na lista copiada:' as info,
    ll.name as lista_nome,
    ll.total_leads,
    jsonb_array_length(ll.leads) as leads_count,
    u.email as owner_email
FROM lead_lists ll
JOIN auth.users u ON ll.user_id = u.id
WHERE u.email = 'dvemarketingadm@gmail.com' 
  AND ll.name LIKE '%Teste Disparo%'
ORDER BY ll.created_at DESC;

-- =====================================================
-- 5. RESUMO FINAL
-- =====================================================

-- Resumo das listas dos dois usuários
SELECT 
    'RESUMO FINAL:' as info,
    u.email,
    COUNT(ll.id) as total_listas,
    SUM(ll.total_leads) as total_leads_todas_listas
FROM auth.users u
LEFT JOIN lead_lists ll ON u.id = ll.user_id
WHERE u.email IN ('creaty12345@gmail.com', 'dvemarketingadm@gmail.com')
GROUP BY u.email
ORDER BY u.email;

-- =====================================================
-- 6. SCRIPT DE ROLLBACK (caso precise desfazer)
-- =====================================================

/*
-- Para desfazer a cópia, execute este comando:
DELETE FROM lead_lists 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'dvemarketingadm@gmail.com')
  AND name LIKE '%Teste Disparo%'
  AND created_at > NOW() - INTERVAL '1 hour';
*/











