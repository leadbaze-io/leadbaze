-- =====================================================
-- VERIFICAÇÃO E CORREÇÃO FINAL - CAMPANHAS
-- =====================================================
-- Este script verifica e corrige definitivamente
-- os problemas com as campanhas
-- =====================================================

-- =====================================================
-- VERIFICAÇÃO 1: Status atual das políticas RLS
-- =====================================================
SELECT 
    'POLÍTICAS RLS ATUAIS' as categoria,
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
-- VERIFICAÇÃO 2: Status RLS da tabela
-- =====================================================
SELECT 
    'STATUS RLS TABELA' as categoria,
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
-- CORREÇÃO 1: Remover todas as políticas existentes
-- =====================================================
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Remover todas as políticas existentes
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND tablename = 'bulk_campaigns'
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.bulk_campaigns', policy_record.policyname);
            RAISE NOTICE 'Política removida: %', policy_record.policyname;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Erro ao remover política %: %', policy_record.policyname, SQLERRM;
        END;
    END LOOP;
END $$;

-- =====================================================
-- CORREÇÃO 2: Habilitar RLS e criar políticas simples
-- =====================================================
DO $$
BEGIN
    -- Habilitar RLS
    ALTER TABLE public.bulk_campaigns ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS habilitado para bulk_campaigns';
    
    -- Criar políticas simples e funcionais
    CREATE POLICY "Users can view own campaigns" ON public.bulk_campaigns 
        FOR SELECT USING (user_id = auth.uid());
    
    CREATE POLICY "Users can insert own campaigns" ON public.bulk_campaigns 
        FOR INSERT WITH CHECK (user_id = auth.uid());
    
    CREATE POLICY "Users can update own campaigns" ON public.bulk_campaigns 
        FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
    
    CREATE POLICY "Users can delete own campaigns" ON public.bulk_campaigns 
        FOR DELETE USING (user_id = auth.uid());
    
    RAISE NOTICE 'Políticas RLS criadas com sucesso';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao criar políticas: %', SQLERRM;
END $$;

-- =====================================================
-- CORREÇÃO 3: Verificar constraint de status
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
-- CORREÇÃO 4: Testar criação de campanha
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
        
        -- Verificar campanhas existentes
        SELECT COUNT(*) INTO campaign_count FROM bulk_campaigns WHERE user_id = user_id_test;
        RAISE NOTICE 'Campanhas existentes: %', campaign_count;
        
        -- Criar campanha de teste
        BEGIN
            INSERT INTO bulk_campaigns (
                name, 
                user_id, 
                status, 
                created_at,
                updated_at
            )
            VALUES (
                'Teste Final - ' || NOW(), 
                user_id_test, 
                'active', 
                NOW(),
                NOW()
            )
            RETURNING id INTO new_campaign_id;
            
            RAISE NOTICE '✅ Campanha criada com sucesso: %', new_campaign_id;
            
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '❌ ERRO ao criar campanha: %', SQLERRM;
                RAISE NOTICE 'Código do erro: %', SQLSTATE;
        END;
    ELSE
        RAISE NOTICE 'Nenhum usuário encontrado para teste';
    END IF;
END $$;

-- =====================================================
-- VERIFICAÇÃO FINAL: Políticas criadas
-- =====================================================
SELECT 
    'POLÍTICAS RLS FINAIS' as categoria,
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
-- VERIFICAÇÃO FINAL: Campanhas existentes
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
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'CORREÇÃO FINAL CONCLUÍDA' as status,
    'Teste a criação de campanhas na aplicação' as mensagem,
    'Se ainda não funcionar, verifique os logs acima' as proximo_passo;









