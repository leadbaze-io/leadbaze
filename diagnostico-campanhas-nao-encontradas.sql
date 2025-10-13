-- =====================================================
-- DIAGNÓSTICO COMPLETO - CAMPANHAS NÃO ENCONTRADAS
-- =====================================================
-- Este script verifica se existem campanhas no banco
-- e diagnostica por que não estão aparecendo
-- =====================================================

-- =====================================================
-- DIAGNÓSTICO 1: Verificar se existem campanhas no banco
-- =====================================================
SELECT 'VERIFICAÇÃO CAMPANHAS' as categoria, COUNT(*) as total_campanhas FROM bulk_campaigns;

-- =====================================================
-- DIAGNÓSTICO 2: Mostrar todas as campanhas existentes
-- =====================================================
SELECT 
    'CAMPANHAS EXISTENTES' as categoria,
    id,
    name,
    user_id,
    status,
    created_at
FROM bulk_campaigns
ORDER BY created_at DESC;

-- =====================================================
-- DIAGNÓSTICO 3: Verificar usuários existentes
-- =====================================================
SELECT 'VERIFICAÇÃO USUÁRIOS' as categoria, COUNT(*) as total_usuarios FROM auth.users;

-- =====================================================
-- DIAGNÓSTICO 4: Mostrar usuários existentes
-- =====================================================
SELECT 
    'USUÁRIOS EXISTENTES' as categoria,
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- =====================================================
-- DIAGNÓSTICO 5: Verificar se há campanhas por usuário
-- =====================================================
SELECT 
    'CAMPANHAS POR USUÁRIO' as categoria,
    user_id,
    COUNT(*) as total_campanhas
FROM bulk_campaigns
GROUP BY user_id
ORDER BY total_campanhas DESC;

-- =====================================================
-- DIAGNÓSTICO 6: Testar acesso com auth.uid() simulado
-- =====================================================
DO $$
DECLARE
    user_id_test uuid;
    record_count integer;
BEGIN
    -- Obter um user_id de teste
    SELECT id INTO user_id_test FROM auth.users LIMIT 1;
    
    IF user_id_test IS NOT NULL THEN
        RAISE NOTICE 'Testando com user_id: %', user_id_test;
        
        -- Simular auth.uid()
        PERFORM set_config('request.jwt.claims', '{"sub":"' || user_id_test || '"}', true);
        
        -- Testar acesso às campanhas
        SELECT COUNT(*) INTO record_count FROM bulk_campaigns WHERE user_id = auth.uid();
        RAISE NOTICE 'Campanhas acessíveis com auth.uid(): %', record_count;
        
        -- Testar acesso direto
        SELECT COUNT(*) INTO record_count FROM bulk_campaigns WHERE user_id = user_id_test;
        RAISE NOTICE 'Campanhas acessíveis diretamente: %', record_count;
        
    ELSE
        RAISE NOTICE 'Nenhum usuário encontrado para teste';
    END IF;
END $$;

-- =====================================================
-- DIAGNÓSTICO 7: Verificar políticas ativas
-- =====================================================
SELECT 
    'POLÍTICAS ATIVAS' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    qual as condicao
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'bulk_campaigns'
ORDER BY policyname;

-- =====================================================
-- DIAGNÓSTICO 8: Verificar status RLS
-- =====================================================
SELECT 
    'STATUS RLS' as categoria,
    tablename as tabela,
    CASE 
        WHEN rowsecurity THEN 'RLS HABILITADO'
        ELSE 'RLS DESABILITADO'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename = 'bulk_campaigns';

-- =====================================================
-- DIAGNÓSTICO 9: Testar sem RLS
-- =====================================================
DO $$
DECLARE
    record_count integer;
BEGIN
    -- Desabilitar RLS temporariamente
    ALTER TABLE public.bulk_campaigns DISABLE ROW LEVEL SECURITY;
    
    -- Testar acesso
    SELECT COUNT(*) INTO record_count FROM bulk_campaigns;
    RAISE NOTICE 'Campanhas acessíveis sem RLS: %', record_count;
    
    -- Reabilitar RLS
    ALTER TABLE public.bulk_campaigns ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'RLS reabilitado';
END $$;

-- =====================================================
-- DIAGNÓSTICO 10: Criar campanha de teste se não existir
-- =====================================================
DO $$
DECLARE
    user_id_test uuid;
    campaign_count integer;
BEGIN
    -- Obter um user_id de teste
    SELECT id INTO user_id_test FROM auth.users LIMIT 1;
    
    IF user_id_test IS NOT NULL THEN
        -- Verificar se há campanhas
        SELECT COUNT(*) INTO campaign_count FROM bulk_campaigns WHERE user_id = user_id_test;
        
        IF campaign_count = 0 THEN
            -- Criar campanha de teste
            INSERT INTO bulk_campaigns (name, user_id, status, created_at)
            VALUES ('Campanha de Teste', user_id_test, 'active', NOW());
            
            RAISE NOTICE 'Campanha de teste criada para usuário %', user_id_test;
        ELSE
            RAISE NOTICE 'Usuário % já tem % campanhas', user_id_test, campaign_count;
        END IF;
    ELSE
        RAISE NOTICE 'Nenhum usuário encontrado para criar campanha de teste';
    END IF;
END $$;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
SELECT 'VERIFICAÇÃO FINAL' as categoria, COUNT(*) as total_campanhas FROM bulk_campaigns;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'DIAGNÓSTICO CONCLUÍDO' as status,
    'Verifique os resultados acima' as mensagem,
    'Identifique se há campanhas no banco' as proximo_passo;









