-- =====================================================
-- DIAGNÓSTICO COM LOGS - PROBLEMA DAS CAMPANHAS
-- =====================================================
-- Este script adiciona logs detalhados para entender
-- exatamente onde está o problema com as campanhas
-- =====================================================

-- =====================================================
-- DIAGNÓSTICO 1: Verificar constraints da tabela bulk_campaigns
-- =====================================================
SELECT 
    'CONSTRAINTS TABELA' as categoria,
    conname as constraint_name,
    contype as tipo,
    pg_get_constraintdef(oid) as definicao
FROM pg_constraint 
WHERE conrelid = 'public.bulk_campaigns'::regclass
ORDER BY conname;

-- =====================================================
-- DIAGNÓSTICO 2: Verificar estrutura completa da tabela
-- =====================================================
SELECT 
    'ESTRUTURA COMPLETA' as categoria,
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable,
    column_default as default_value,
    character_maximum_length as tamanho_max
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'bulk_campaigns'
ORDER BY ordinal_position;

-- =====================================================
-- DIAGNÓSTICO 3: Verificar valores válidos para status
-- =====================================================
SELECT 
    'VALORES VÁLIDOS STATUS' as categoria,
    'Verificando constraint de status...' as info;

-- =====================================================
-- DIAGNÓSTICO 4: Criar função de log para debug
-- =====================================================
CREATE OR REPLACE FUNCTION debug_log(message text)
RETURNS void AS $$
BEGIN
    RAISE NOTICE 'DEBUG: %', message;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DIAGNÓSTICO 5: Testar inserção com valores explícitos
-- =====================================================
DO $$
DECLARE
    user_id_test uuid;
    campaign_count integer;
    new_campaign_id uuid;
    test_status text;
BEGIN
    -- Obter um user_id de teste
    SELECT id INTO user_id_test FROM auth.users LIMIT 1;
    
    IF user_id_test IS NOT NULL THEN
        PERFORM debug_log('User ID de teste: ' || user_id_test);
        
        -- Verificar se há campanhas
        SELECT COUNT(*) INTO campaign_count FROM bulk_campaigns WHERE user_id = user_id_test;
        PERFORM debug_log('Campanhas existentes: ' || campaign_count);
        
        IF campaign_count = 0 THEN
            -- Testar diferentes valores de status
            test_status := 'active';
            PERFORM debug_log('Tentando inserir com status: ' || test_status);
            
            BEGIN
                INSERT INTO bulk_campaigns (
                    name, 
                    user_id, 
                    status, 
                    created_at,
                    updated_at
                )
                VALUES (
                    'Campanha de Teste - ' || NOW(), 
                    user_id_test, 
                    test_status, 
                    NOW(),
                    NOW()
                )
                RETURNING id INTO new_campaign_id;
                
                PERFORM debug_log('Campanha criada com sucesso: ' || new_campaign_id);
                
            EXCEPTION
                WHEN OTHERS THEN
                    PERFORM debug_log('ERRO ao criar campanha: ' || SQLERRM);
                    PERFORM debug_log('Código do erro: ' || SQLSTATE);
                    
                    -- Tentar com status diferente
                    test_status := 'draft';
                    PERFORM debug_log('Tentando com status: ' || test_status);
                    
                    BEGIN
                        INSERT INTO bulk_campaigns (
                            name, 
                            user_id, 
                            status, 
                            created_at,
                            updated_at
                        )
                        VALUES (
                            'Campanha de Teste Draft - ' || NOW(), 
                            user_id_test, 
                            test_status, 
                            NOW(),
                            NOW()
                        )
                        RETURNING id INTO new_campaign_id;
                        
                        PERFORM debug_log('Campanha draft criada: ' || new_campaign_id);
                        
                    EXCEPTION
                        WHEN OTHERS THEN
                            PERFORM debug_log('ERRO também com draft: ' || SQLERRM);
                    END;
            END;
        ELSE
            PERFORM debug_log('Usuário já tem campanhas, não criando teste');
        END IF;
    ELSE
        PERFORM debug_log('Nenhum usuário encontrado para teste');
    END IF;
END $$;

-- =====================================================
-- DIAGNÓSTICO 6: Verificar campanhas existentes com detalhes
-- =====================================================
SELECT 
    'CAMPANHAS EXISTENTES DETALHADAS' as categoria,
    id,
    name,
    user_id,
    status,
    created_at,
    updated_at
FROM bulk_campaigns 
ORDER BY created_at DESC 
LIMIT 5;

-- =====================================================
-- DIAGNÓSTICO 7: Verificar políticas RLS ativas
-- =====================================================
SELECT 
    'POLÍTICAS RLS ATIVAS' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    permissive as permissiva,
    qual as condicao_usando,
    with_check as condicao_verificacao
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'bulk_campaigns'
ORDER BY cmd, policyname;

-- =====================================================
-- DIAGNÓSTICO 8: Testar SELECT com RLS
-- =====================================================
DO $$
DECLARE
    user_id_test uuid;
    record_count integer;
BEGIN
    -- Obter um user_id de teste
    SELECT id INTO user_id_test FROM auth.users LIMIT 1;
    
    IF user_id_test IS NOT NULL THEN
        PERFORM debug_log('Testando SELECT com RLS para user: ' || user_id_test);
        
        -- Testar SELECT com política RLS
        BEGIN
            SELECT COUNT(*) INTO record_count FROM bulk_campaigns WHERE user_id = auth.uid();
            PERFORM debug_log('SELECT com auth.uid(): ' || record_count || ' campanhas');
        EXCEPTION
            WHEN OTHERS THEN
                PERFORM debug_log('ERRO no SELECT com auth.uid(): ' || SQLERRM);
        END;
        
        -- Testar SELECT direto
        BEGIN
            SELECT COUNT(*) INTO record_count FROM bulk_campaigns WHERE user_id = user_id_test;
            PERFORM debug_log('SELECT direto: ' || record_count || ' campanhas');
        EXCEPTION
            WHEN OTHERS THEN
                PERFORM debug_log('ERRO no SELECT direto: ' || SQLERRM);
        END;
        
    END IF;
END $$;

-- =====================================================
-- DIAGNÓSTICO 9: Verificar se há problemas com a aplicação
-- =====================================================
SELECT 
    'VERIFICAÇÃO APLICAÇÃO' as categoria,
    'Se as campanhas existem no banco mas não aparecem na aplicação' as problema,
    'O problema pode estar na consulta da aplicação ou na autenticação' as possivel_causa;

-- =====================================================
-- DIAGNÓSTICO 10: Limpar função de debug
-- =====================================================
DROP FUNCTION IF EXISTS debug_log(text);

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
SELECT 'VERIFICAÇÃO FINAL' as categoria, COUNT(*) as total_campanhas FROM bulk_campaigns;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'DIAGNÓSTICO COM LOGS CONCLUÍDO' as status,
    'Analise todos os logs acima' as mensagem,
    'Identifique onde está o problema' as proximo_passo;




















