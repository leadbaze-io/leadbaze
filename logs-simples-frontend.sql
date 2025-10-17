-- =====================================================
-- LOGS SIMPLES PARA FRONTEND - DISPARADOR
-- =====================================================
-- Este script cria logs simples que podem ser executados
-- diretamente no console do navegador (F12)
-- =====================================================

-- =====================================================
-- FUNÇÃO 1: Log simples de autenticação
-- =====================================================
CREATE OR REPLACE FUNCTION log_auth()
RETURNS text AS $$
DECLARE
    user_id uuid;
    result text;
BEGIN
    user_id := auth.uid();
    
    IF user_id IS NOT NULL THEN
        result := 'AUTH OK - User ID: ' || user_id;
    ELSE
        result := 'AUTH ERROR - Usuário não autenticado';
    END IF;
    
    RAISE NOTICE '%', result;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO 2: Log simples de campanhas
-- =====================================================
CREATE OR REPLACE FUNCTION log_campaigns()
RETURNS text AS $$
DECLARE
    user_id uuid;
    campaign_count integer;
    result text;
BEGIN
    user_id := auth.uid();
    
    IF user_id IS NOT NULL THEN
        SELECT COUNT(*) INTO campaign_count FROM bulk_campaigns WHERE user_id = user_id;
        result := 'CAMPANHAS OK - Count: ' || campaign_count || ' para user: ' || user_id;
    ELSE
        result := 'CAMPANHAS ERROR - Usuário não autenticado';
    END IF;
    
    RAISE NOTICE '%', result;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO 3: Log simples de criação
-- =====================================================
CREATE OR REPLACE FUNCTION log_creation()
RETURNS text AS $$
DECLARE
    user_id uuid;
    new_campaign_id uuid;
    result text;
BEGIN
    user_id := auth.uid();
    
    IF user_id IS NOT NULL THEN
        BEGIN
            INSERT INTO bulk_campaigns (name, user_id, status, created_at, updated_at)
            VALUES ('Teste Log - ' || NOW(), user_id, 'active', NOW(), NOW())
            RETURNING id INTO new_campaign_id;
            
            result := 'CRIAÇÃO OK - Campanha criada: ' || new_campaign_id;
        EXCEPTION
            WHEN OTHERS THEN
            result := 'CRIAÇÃO ERROR - ' || SQLERRM;
        END;
    ELSE
        result := 'CRIAÇÃO ERROR - Usuário não autenticado';
    END IF;
    
    RAISE NOTICE '%', result;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO 4: Log completo
-- =====================================================
CREATE OR REPLACE FUNCTION log_all()
RETURNS text AS $$
DECLARE
    auth_result text;
    campaigns_result text;
    creation_result text;
    result text;
BEGIN
    auth_result := log_auth();
    campaigns_result := log_campaigns();
    creation_result := log_creation();
    
    result := '=== DIAGNÓSTICO COMPLETO ===' || chr(10) ||
              'AUTH: ' || auth_result || chr(10) ||
              'CAMPANHAS: ' || campaigns_result || chr(10) ||
              'CRIAÇÃO: ' || creation_result || chr(10) ||
              '=== FIM DIAGNÓSTICO ===';
    
    RAISE NOTICE '%', result;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TESTE: Executar logs
-- =====================================================
SELECT log_all() as diagnostic_log;

-- =====================================================
-- INSTRUÇÕES PARA USO NO FRONTEND
-- =====================================================
SELECT 
    'INSTRUÇÕES PARA FRONTEND' as categoria,
    'Abra o console do navegador (F12) e execute:' as instrucao,
    'SELECT log_auth();' as teste_auth,
    'SELECT log_campaigns();' as teste_campanhas,
    'SELECT log_creation();' as teste_criacao,
    'SELECT log_all();' as teste_completo;

-- =====================================================
-- LIMPEZA: Remover funções após uso
-- =====================================================
-- Descomente estas linhas após o diagnóstico:
-- DROP FUNCTION IF EXISTS log_auth();
-- DROP FUNCTION IF EXISTS log_campaigns();
-- DROP FUNCTION IF EXISTS log_creation();
-- DROP FUNCTION IF EXISTS log_all();











