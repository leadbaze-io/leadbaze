-- =====================================================
-- LOGS PARA CONSOLE F12 - DISPARADOR
-- =====================================================
-- Este script cria logs detalhados no console do navegador
-- para identificar exatamente onde está o problema no disparador
-- =====================================================

-- =====================================================
-- FUNÇÃO 1: Criar função de log para console
-- =====================================================
CREATE OR REPLACE FUNCTION console_log(message text, data jsonb DEFAULT NULL)
RETURNS void AS $$
BEGIN
    -- Log no console do PostgreSQL
    RAISE NOTICE 'CONSOLE_LOG: %', message;
    
    -- Se houver dados, mostrar também
    IF data IS NOT NULL THEN
        RAISE NOTICE 'CONSOLE_DATA: %', data;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO 2: Função para testar autenticação
-- =====================================================
CREATE OR REPLACE FUNCTION test_auth_log()
RETURNS jsonb AS $$
DECLARE
    result jsonb;
    user_id uuid;
    auth_result uuid;
BEGIN
    -- Inicializar resultado
    result := '{}'::jsonb;
    
    -- Testar auth.uid()
    BEGIN
        auth_result := auth.uid();
        result := result || jsonb_build_object('auth_uid', auth_result);
        PERFORM console_log('auth.uid() executado', jsonb_build_object('result', auth_result));
    EXCEPTION
        WHEN OTHERS THEN
            result := result || jsonb_build_object('auth_uid_error', SQLERRM);
            PERFORM console_log('ERRO em auth.uid()', jsonb_build_object('error', SQLERRM));
    END;
    
    -- Testar se há usuário autenticado
    IF auth_result IS NOT NULL THEN
        -- Buscar dados do usuário
        BEGIN
            SELECT id INTO user_id FROM auth.users WHERE id = auth_result;
            result := result || jsonb_build_object('user_exists', user_id IS NOT NULL);
            PERFORM console_log('Usuário encontrado', jsonb_build_object('user_id', user_id));
        EXCEPTION
            WHEN OTHERS THEN
            result := result || jsonb_build_object('user_lookup_error', SQLERRM);
            PERFORM console_log('ERRO ao buscar usuário', jsonb_build_object('error', SQLERRM));
        END;
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO 3: Função para testar acesso às campanhas
-- =====================================================
CREATE OR REPLACE FUNCTION test_campaigns_access_log()
RETURNS jsonb AS $$
DECLARE
    result jsonb;
    campaign_count integer;
    user_id uuid;
BEGIN
    -- Inicializar resultado
    result := '{}'::jsonb;
    
    -- Obter user_id
    user_id := auth.uid();
    result := result || jsonb_build_object('user_id', user_id);
    PERFORM console_log('Testando acesso às campanhas', jsonb_build_object('user_id', user_id));
    
    IF user_id IS NOT NULL THEN
        -- Testar SELECT com RLS
        BEGIN
            SELECT COUNT(*) INTO campaign_count FROM bulk_campaigns WHERE user_id = auth.uid();
            result := result || jsonb_build_object('campaigns_with_rls', campaign_count);
            PERFORM console_log('SELECT com RLS executado', jsonb_build_object('count', campaign_count));
        EXCEPTION
            WHEN OTHERS THEN
            result := result || jsonb_build_object('rls_select_error', SQLERRM);
            PERFORM console_log('ERRO no SELECT com RLS', jsonb_build_object('error', SQLERRM));
        END;
        
        -- Testar SELECT direto
        BEGIN
            SELECT COUNT(*) INTO campaign_count FROM bulk_campaigns WHERE user_id = user_id;
            result := result || jsonb_build_object('campaigns_direct', campaign_count);
            PERFORM console_log('SELECT direto executado', jsonb_build_object('count', campaign_count));
        EXCEPTION
            WHEN OTHERS THEN
            result := result || jsonb_build_object('direct_select_error', SQLERRM);
            PERFORM console_log('ERRO no SELECT direto', jsonb_build_object('error', SQLERRM));
        END;
        
        -- Testar SELECT sem RLS
        BEGIN
            ALTER TABLE public.bulk_campaigns DISABLE ROW LEVEL SECURITY;
            SELECT COUNT(*) INTO campaign_count FROM bulk_campaigns;
            ALTER TABLE public.bulk_campaigns ENABLE ROW LEVEL SECURITY;
            result := result || jsonb_build_object('campaigns_total', campaign_count);
            PERFORM console_log('SELECT sem RLS executado', jsonb_build_object('count', campaign_count));
        EXCEPTION
            WHEN OTHERS THEN
            ALTER TABLE public.bulk_campaigns ENABLE ROW LEVEL SECURITY;
            result := result || jsonb_build_object('no_rls_select_error', SQLERRM);
            PERFORM console_log('ERRO no SELECT sem RLS', jsonb_build_object('error', SQLERRM));
        END;
    ELSE
        result := result || jsonb_build_object('no_user', 'Usuário não autenticado');
        PERFORM console_log('Usuário não autenticado');
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO 4: Função para testar criação de campanhas
-- =====================================================
CREATE OR REPLACE FUNCTION test_campaign_creation_log()
RETURNS jsonb AS $$
DECLARE
    result jsonb;
    user_id uuid;
    new_campaign_id uuid;
    campaign_name text;
BEGIN
    -- Inicializar resultado
    result := '{}'::jsonb;
    
    -- Obter user_id
    user_id := auth.uid();
    result := result || jsonb_build_object('user_id', user_id);
    PERFORM console_log('Testando criação de campanha', jsonb_build_object('user_id', user_id));
    
    IF user_id IS NOT NULL THEN
        -- Criar nome da campanha
        campaign_name := 'Teste Log - ' || NOW();
        result := result || jsonb_build_object('campaign_name', campaign_name);
        
        -- Tentar criar campanha
        BEGIN
            INSERT INTO bulk_campaigns (
                name, 
                user_id, 
                status, 
                created_at,
                updated_at
            )
            VALUES (
                campaign_name, 
                user_id, 
                'active', 
                NOW(),
                NOW()
            )
            RETURNING id INTO new_campaign_id;
            
            result := result || jsonb_build_object('campaign_created', true);
            result := result || jsonb_build_object('new_campaign_id', new_campaign_id);
            PERFORM console_log('Campanha criada com sucesso', jsonb_build_object('id', new_campaign_id));
            
        EXCEPTION
            WHEN OTHERS THEN
            result := result || jsonb_build_object('campaign_creation_error', SQLERRM);
            result := result || jsonb_build_object('error_code', SQLSTATE);
            PERFORM console_log('ERRO ao criar campanha', jsonb_build_object('error', SQLERRM, 'code', SQLSTATE));
        END;
    ELSE
        result := result || jsonb_build_object('no_user', 'Usuário não autenticado');
        PERFORM console_log('Usuário não autenticado para criação');
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO 5: Função principal de diagnóstico
-- =====================================================
CREATE OR REPLACE FUNCTION full_diagnostic_log()
RETURNS jsonb AS $$
DECLARE
    result jsonb;
    auth_result jsonb;
    campaigns_result jsonb;
    creation_result jsonb;
BEGIN
    -- Inicializar resultado
    result := '{}'::jsonb;
    
    PERFORM console_log('=== INICIANDO DIAGNÓSTICO COMPLETO ===');
    
    -- Testar autenticação
    auth_result := test_auth_log();
    result := result || jsonb_build_object('auth_test', auth_result);
    
    -- Testar acesso às campanhas
    campaigns_result := test_campaigns_access_log();
    result := result || jsonb_build_object('campaigns_test', campaigns_result);
    
    -- Testar criação de campanhas
    creation_result := test_campaign_creation_log();
    result := result || jsonb_build_object('creation_test', creation_result);
    
    PERFORM console_log('=== DIAGNÓSTICO COMPLETO FINALIZADO ===');
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TESTE: Executar diagnóstico completo
-- =====================================================
SELECT full_diagnostic_log() as diagnostic_result;

-- =====================================================
-- INSTRUÇÕES PARA USO NO FRONTEND
-- =====================================================
SELECT 
    'INSTRUÇÕES PARA FRONTEND' as categoria,
    'Execute estas funções no console do navegador (F12)' as instrucao,
    'SELECT test_auth_log();' as teste_auth,
    'SELECT test_campaigns_access_log();' as teste_campanhas,
    'SELECT test_campaign_creation_log();' as teste_criacao,
    'SELECT full_diagnostic_log();' as teste_completo;

-- =====================================================
-- LIMPEZA: Remover funções após uso
-- =====================================================
-- Descomente estas linhas após o diagnóstico:
-- DROP FUNCTION IF EXISTS console_log(text, jsonb);
-- DROP FUNCTION IF EXISTS test_auth_log();
-- DROP FUNCTION IF EXISTS test_campaigns_access_log();
-- DROP FUNCTION IF EXISTS test_campaign_creation_log();
-- DROP FUNCTION IF EXISTS full_diagnostic_log();






















