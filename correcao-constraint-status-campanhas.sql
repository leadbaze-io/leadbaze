-- =====================================================
-- CORREÇÃO CONSTRAINT STATUS - CAMPANHAS
-- =====================================================
-- Este script verifica e corrige o constraint de status
-- que está impedindo a criação de campanhas
-- =====================================================

-- =====================================================
-- VERIFICAÇÃO 1: Verificar constraint de status atual
-- =====================================================
SELECT 
    'CONSTRAINT STATUS ATUAL' as categoria,
    conname as constraint_name,
    contype as tipo,
    pg_get_constraintdef(oid) as definicao
FROM pg_constraint 
WHERE conrelid = 'public.bulk_campaigns'::regclass
AND conname LIKE '%status%';

-- =====================================================
-- VERIFICAÇÃO 2: Verificar valores válidos para status
-- =====================================================
SELECT 
    'VALORES VÁLIDOS STATUS' as categoria,
    'Verificando constraint de status...' as info;

-- =====================================================
-- CORREÇÃO 1: Remover constraint problemático
-- =====================================================
DO $$
BEGIN
    -- Remover constraint de status se existir
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.bulk_campaigns'::regclass
        AND conname LIKE '%status%'
    ) THEN
        ALTER TABLE public.bulk_campaigns DROP CONSTRAINT IF EXISTS bulk_campaigns_status_check;
        RAISE NOTICE 'Constraint de status removido';
    ELSE
        RAISE NOTICE 'Nenhum constraint de status encontrado';
    END IF;
END $$;

-- =====================================================
-- CORREÇÃO 2: Criar constraint correto para status
-- =====================================================
DO $$
BEGIN
    -- Criar constraint correto para status
    ALTER TABLE public.bulk_campaigns 
    ADD CONSTRAINT bulk_campaigns_status_check 
    CHECK (status IN ('active', 'draft', 'paused', 'completed', 'cancelled'));
    
    RAISE NOTICE 'Constraint de status criado com valores válidos';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Constraint já existe';
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao criar constraint: %', SQLERRM;
END $$;

-- =====================================================
-- CORREÇÃO 3: Testar inserção com status válido
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
        RAISE NOTICE 'User ID de teste: %', user_id_test;
        
        -- Verificar se há campanhas
        SELECT COUNT(*) INTO campaign_count FROM bulk_campaigns WHERE user_id = user_id_test;
        RAISE NOTICE 'Campanhas existentes: %', campaign_count;
        
        IF campaign_count = 0 THEN
            -- Criar campanha de teste com status válido
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
                    'active', 
                    NOW(),
                    NOW()
                )
                RETURNING id INTO new_campaign_id;
                
                RAISE NOTICE 'Campanha criada com sucesso: %', new_campaign_id;
                
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'ERRO ao criar campanha: %', SQLERRM;
                    RAISE NOTICE 'Código do erro: %', SQLSTATE;
            END;
        ELSE
            RAISE NOTICE 'Usuário já tem % campanhas', campaign_count;
        END IF;
    ELSE
        RAISE NOTICE 'Nenhum usuário encontrado para teste';
    END IF;
END $$;

-- =====================================================
-- VERIFICAÇÃO 3: Verificar constraint após correção
-- =====================================================
SELECT 
    'CONSTRAINT STATUS APÓS CORREÇÃO' as categoria,
    conname as constraint_name,
    contype as tipo,
    pg_get_constraintdef(oid) as definicao
FROM pg_constraint 
WHERE conrelid = 'public.bulk_campaigns'::regclass
AND conname LIKE '%status%';

-- =====================================================
-- VERIFICAÇÃO 4: Verificar campanhas existentes
-- =====================================================
SELECT 
    'CAMPANHAS EXISTENTES' as categoria,
    id,
    name,
    user_id,
    status,
    created_at
FROM bulk_campaigns 
ORDER BY created_at DESC 
LIMIT 5;

-- =====================================================
-- VERIFICAÇÃO 5: Testar políticas RLS
-- =====================================================
DO $$
DECLARE
    user_id_test uuid;
    record_count integer;
BEGIN
    -- Obter um user_id de teste
    SELECT id INTO user_id_test FROM auth.users LIMIT 1;
    
    IF user_id_test IS NOT NULL THEN
        RAISE NOTICE 'Testando políticas RLS para user: %', user_id_test;
        
        -- Testar SELECT com política RLS
        BEGIN
            SELECT COUNT(*) INTO record_count FROM bulk_campaigns WHERE user_id = auth.uid();
            RAISE NOTICE 'SELECT com auth.uid(): % campanhas', record_count;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'ERRO no SELECT com auth.uid(): %', SQLERRM;
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
-- VERIFICAÇÃO FINAL
-- =====================================================
SELECT 'VERIFICAÇÃO FINAL' as categoria, COUNT(*) as total_campanhas FROM bulk_campaigns;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'CORREÇÃO CONSTRAINT CONCLUÍDA' as status,
    'Teste a criação de campanhas na aplicação' as mensagem,
    'Se ainda não funcionar, verifique as políticas RLS' as proximo_passo;






















