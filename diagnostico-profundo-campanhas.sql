-- =====================================================
-- DIAGNÓSTICO PROFUNDO - PROBLEMA DAS CAMPANHAS
-- =====================================================
-- Este script faz um diagnóstico completo para entender
-- exatamente onde está o problema com as campanhas
-- =====================================================

-- =====================================================
-- DIAGNÓSTICO 1: Verificar estrutura da tabela bulk_campaigns
-- =====================================================
SELECT 
    'ESTRUTURA TABELA' as categoria,
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable,
    column_default as default_value
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'bulk_campaigns'
ORDER BY ordinal_position;

-- =====================================================
-- DIAGNÓSTICO 2: Verificar se a tabela existe e tem dados
-- =====================================================
SELECT 
    'EXISTÊNCIA TABELA' as categoria,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bulk_campaigns') THEN 'TABELA EXISTE'
        ELSE 'TABELA NÃO EXISTE'
    END as status;

-- =====================================================
-- DIAGNÓSTICO 3: Contar registros sem RLS
-- =====================================================
DO $$
DECLARE
    record_count integer;
BEGIN
    -- Desabilitar RLS temporariamente
    ALTER TABLE public.bulk_campaigns DISABLE ROW LEVEL SECURITY;
    
    -- Contar registros
    SELECT COUNT(*) INTO record_count FROM bulk_campaigns;
    RAISE NOTICE 'Total de campanhas no banco (sem RLS): %', record_count;
    
    -- Reabilitar RLS
    ALTER TABLE public.bulk_campaigns ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'RLS reabilitado';
END $$;

-- =====================================================
-- DIAGNÓSTICO 4: Verificar usuários e suas campanhas
-- =====================================================
SELECT 
    'USUÁRIOS E CAMPANHAS' as categoria,
    u.id as user_id,
    u.email,
    COUNT(bc.id) as total_campanhas
FROM auth.users u
LEFT JOIN bulk_campaigns bc ON u.id = bc.user_id
GROUP BY u.id, u.email
ORDER BY total_campanhas DESC;

-- =====================================================
-- DIAGNÓSTICO 5: Testar auth.uid() diretamente
-- =====================================================
DO $$
DECLARE
    auth_uid_result uuid;
    user_id_test uuid;
BEGIN
    -- Obter um user_id de teste
    SELECT id INTO user_id_test FROM auth.users LIMIT 1;
    
    IF user_id_test IS NOT NULL THEN
        RAISE NOTICE 'User ID de teste: %', user_id_test;
        
        -- Simular auth.uid()
        PERFORM set_config('request.jwt.claims', '{"sub":"' || user_id_test || '"}', true);
        
        -- Testar auth.uid()
        BEGIN
            SELECT auth.uid() INTO auth_uid_result;
            RAISE NOTICE 'auth.uid() retornou: %', auth_uid_result;
            
            IF auth_uid_result IS NULL THEN
                RAISE NOTICE 'PROBLEMA: auth.uid() retornou NULL';
            ELSIF auth_uid_result != user_id_test THEN
                RAISE NOTICE 'PROBLEMA: auth.uid() não corresponde ao user_id de teste';
            ELSE
                RAISE NOTICE 'auth.uid() funcionando corretamente';
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'ERRO ao executar auth.uid(): %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'Nenhum usuário encontrado para teste';
    END IF;
END $$;

-- =====================================================
-- DIAGNÓSTICO 6: Testar políticas RLS individualmente
-- =====================================================
DO $$
DECLARE
    user_id_test uuid;
    record_count integer;
BEGIN
    -- Obter um user_id de teste
    SELECT id INTO user_id_test FROM auth.users LIMIT 1;
    
    IF user_id_test IS NOT NULL THEN
        RAISE NOTICE 'Testando políticas RLS com user_id: %', user_id_test;
        
        -- Simular auth.uid()
        PERFORM set_config('request.jwt.claims', '{"sub":"' || user_id_test || '"}', true);
        
        -- Testar SELECT com política
        BEGIN
            SELECT COUNT(*) INTO record_count FROM bulk_campaigns WHERE user_id = auth.uid();
            RAISE NOTICE 'SELECT com política: % campanhas', record_count;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'ERRO no SELECT com política: %', SQLERRM;
        END;
        
        -- Testar SELECT direto
        BEGIN
            SELECT COUNT(*) INTO record_count FROM bulk_campaigns WHERE user_id = user_id_test;
            RAISE NOTICE 'SELECT direto: % campanhas', record_count;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'ERRO no SELECT direto: %', SQLERRM;
        END;
        
    END IF;
END $$;

-- =====================================================
-- DIAGNÓSTICO 7: Verificar todas as políticas ativas
-- =====================================================
SELECT 
    'POLÍTICAS DETALHADAS' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    permissive as permissiva,
    roles as roles,
    qual as condicao_usando,
    with_check as condicao_verificacao
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'bulk_campaigns'
ORDER BY cmd, policyname;

-- =====================================================
-- DIAGNÓSTICO 8: Verificar status RLS e permissões
-- =====================================================
SELECT 
    'STATUS RLS DETALHADO' as categoria,
    tablename as tabela,
    rowsecurity as rls_habilitado,
    CASE 
        WHEN rowsecurity THEN 'RLS HABILITADO'
        ELSE 'RLS DESABILITADO'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename = 'bulk_campaigns';

-- =====================================================
-- DIAGNÓSTICO 9: Verificar permissões da tabela
-- =====================================================
SELECT 
    'PERMISSÕES TABELA' as categoria,
    table_name as tabela,
    privilege_type as tipo_permissao,
    grantee as usuario
FROM information_schema.table_privileges 
WHERE table_schema = 'public'
AND table_name = 'bulk_campaigns'
ORDER BY privilege_type, grantee;

-- =====================================================
-- DIAGNÓSTICO 10: Testar sem RLS completamente
-- =====================================================
DO $$
DECLARE
    record_count integer;
BEGIN
    RAISE NOTICE 'Testando acesso sem RLS...';
    
    -- Desabilitar RLS
    ALTER TABLE public.bulk_campaigns DISABLE ROW LEVEL SECURITY;
    
    -- Testar acesso
    SELECT COUNT(*) INTO record_count FROM bulk_campaigns;
    RAISE NOTICE 'Campanhas acessíveis sem RLS: %', record_count;
    
        -- Mostrar algumas campanhas
        IF record_count > 0 THEN
            RAISE NOTICE 'Primeiras campanhas:';
            -- Mostrar dados sem loop
            PERFORM id, name, user_id, status 
            FROM bulk_campaigns 
            ORDER BY created_at DESC 
            LIMIT 5;
        END IF;
    
    -- Reabilitar RLS
    ALTER TABLE public.bulk_campaigns ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS reabilitado';
END $$;

-- =====================================================
-- DIAGNÓSTICO 11: Verificar se há problemas com a aplicação
-- =====================================================
SELECT 
    'VERIFICAÇÃO APLICAÇÃO' as categoria,
    'Se as campanhas existem no banco mas não aparecem na aplicação' as problema,
    'O problema pode estar na consulta da aplicação ou na autenticação' as possivel_causa;

-- =====================================================
-- DIAGNÓSTICO 12: Criar campanha de teste se não existir
-- =====================================================
DO $$
DECLARE
    user_id_test uuid;
    campaign_count integer;
    new_campaign_id uuid;
BEGIN
    -- Obter um user_id de teste
    SELECT id INTO user_id_test FROM auth.users LIMIT 1;
    
    IF user_id_test IS NOT NULL THEN
        -- Verificar se há campanhas
        SELECT COUNT(*) INTO campaign_count FROM bulk_campaigns WHERE user_id = user_id_test;
        
        IF campaign_count = 0 THEN
            -- Criar campanha de teste
            INSERT INTO bulk_campaigns (name, user_id, status, created_at)
            VALUES ('Campanha de Teste - ' || NOW(), user_id_test, 'active', NOW())
            RETURNING id INTO new_campaign_id;
            
            RAISE NOTICE 'Campanha de teste criada: %', new_campaign_id;
        ELSE
            RAISE NOTICE 'Usuário % já tem % campanhas', user_id_test, campaign_count;
        END IF;
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
    'DIAGNÓSTICO PROFUNDO CONCLUÍDO' as status,
    'Analise todos os resultados acima' as mensagem,
    'Identifique onde está o problema' as proximo_passo;
