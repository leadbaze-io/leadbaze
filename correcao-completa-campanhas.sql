-- =====================================================
-- CORREÇÃO COMPLETA - TODAS AS OPERAÇÕES DE CAMPANHAS
-- =====================================================
-- Este script corrige SELECT, INSERT, UPDATE e DELETE
-- para resolver tanto o problema de visualização quanto criação
-- =====================================================

-- =====================================================
-- CORREÇÃO 1: Remover TODAS as políticas existentes
-- =====================================================
DROP POLICY IF EXISTS "Users can view own campaigns" ON public.bulk_campaigns;
DROP POLICY IF EXISTS "Users can insert own campaigns" ON public.bulk_campaigns;
DROP POLICY IF EXISTS "Users can update own campaigns" ON public.bulk_campaigns;
DROP POLICY IF EXISTS "Users can delete own campaigns" ON public.bulk_campaigns;
DROP POLICY IF EXISTS "Users can insert campaigns" ON public.bulk_campaigns;
DROP POLICY IF EXISTS "Allow campaign insertion" ON public.bulk_campaigns;
DROP POLICY IF EXISTS "Allow all campaigns" ON public.bulk_campaigns;
DROP POLICY IF EXISTS "Simple campaign access" ON public.bulk_campaigns;

-- =====================================================
-- CORREÇÃO 2: Desabilitar RLS temporariamente para teste
-- =====================================================
ALTER TABLE public.bulk_campaigns DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- CORREÇÃO 3: Verificar se há campanhas no banco
-- =====================================================
SELECT 'VERIFICAÇÃO SEM RLS' as categoria, COUNT(*) as total_campanhas FROM bulk_campaigns;

-- =====================================================
-- CORREÇÃO 4: Mostrar campanhas existentes
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
LIMIT 10;

-- =====================================================
-- CORREÇÃO 5: Habilitar RLS novamente
-- =====================================================
ALTER TABLE public.bulk_campaigns ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CORREÇÃO 6: Criar políticas muito simples e diretas
-- =====================================================
-- Política para SELECT - permitir ver campanhas do usuário
CREATE POLICY "View own campaigns" ON public.bulk_campaigns 
FOR SELECT 
USING (user_id = auth.uid());

-- Política para INSERT - permitir criar campanhas
CREATE POLICY "Insert own campaigns" ON public.bulk_campaigns 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Política para UPDATE - permitir editar campanhas do usuário
CREATE POLICY "Update own campaigns" ON public.bulk_campaigns 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Política para DELETE - permitir deletar campanhas do usuário
CREATE POLICY "Delete own campaigns" ON public.bulk_campaigns 
FOR DELETE 
USING (user_id = auth.uid());

-- =====================================================
-- CORREÇÃO 7: Testar todas as operações
-- =====================================================
DO $$
DECLARE
    user_id_test uuid;
    record_count integer;
    campaign_id uuid;
BEGIN
    -- Obter um user_id de teste
    SELECT id INTO user_id_test FROM auth.users LIMIT 1;
    
    IF user_id_test IS NOT NULL THEN
        RAISE NOTICE 'Testando com user_id: %', user_id_test;
        
        -- Simular auth.uid()
        PERFORM set_config('request.jwt.claims', '{"sub":"' || user_id_test || '"}', true);
        
        -- Testar SELECT
        BEGIN
            SELECT COUNT(*) INTO record_count FROM bulk_campaigns WHERE user_id = auth.uid();
            RAISE NOTICE 'SELECT: % campanhas encontradas', record_count;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'ERRO no SELECT: %', SQLERRM;
        END;
        
        -- Testar INSERT
        BEGIN
            INSERT INTO bulk_campaigns (name, user_id, status, created_at)
            VALUES ('Teste de Inserção', user_id_test, 'active', NOW())
            RETURNING id INTO campaign_id;
            
            RAISE NOTICE 'INSERT: Campanha criada com ID %', campaign_id;
            
            -- Testar UPDATE
            BEGIN
                UPDATE bulk_campaigns 
                SET name = 'Teste Atualizado' 
                WHERE id = campaign_id;
                
                RAISE NOTICE 'UPDATE: Campanha atualizada';
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'ERRO no UPDATE: %', SQLERRM;
            END;
            
            -- Testar DELETE
            BEGIN
                DELETE FROM bulk_campaigns WHERE id = campaign_id;
                RAISE NOTICE 'DELETE: Campanha removida';
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'ERRO no DELETE: %', SQLERRM;
            END;
            
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'ERRO no INSERT: %', SQLERRM;
        END;
        
    ELSE
        RAISE NOTICE 'Nenhum usuário encontrado para teste';
    END IF;
END $$;

-- =====================================================
-- CORREÇÃO 8: Criar políticas alternativas mais permissivas se necessário
-- =====================================================
-- Se ainda houver problemas, criar políticas mais permissivas
DO $$
DECLARE
    policy_count integer;
BEGIN
    -- Verificar quantas políticas existem
    SELECT COUNT(*) INTO policy_count FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'bulk_campaigns';
    
    IF policy_count = 0 THEN
        -- Criar política única para todas as operações
        CREATE POLICY "All operations for own campaigns" ON public.bulk_campaigns 
        FOR ALL 
        USING (user_id = auth.uid());
        
        RAISE NOTICE 'Política única criada para todas as operações';
    END IF;
END $$;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
-- Mostrar políticas ativas
SELECT 
    'POLÍTICAS ATIVAS' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    CASE 
        WHEN with_check IS NOT NULL THEN with_check
        WHEN qual IS NOT NULL THEN qual
        ELSE 'N/A'
    END as condicao
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'bulk_campaigns'
ORDER BY cmd, policyname;

-- Mostrar status RLS
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
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'CORREÇÃO COMPLETA CONCLUÍDA' as status,
    'Todas as operações de campanhas corrigidas' as mensagem,
    'Teste visualização e criação de campanhas' as proximo_passo;


















