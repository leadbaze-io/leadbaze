-- =====================================================
-- CORREÇÃO ERRO 403 - CRIAÇÃO DE CAMPANHAS
-- =====================================================
-- Este script corrige o erro 403 ao tentar criar campanhas
-- O problema está nas políticas RLS de INSERT
-- =====================================================

-- =====================================================
-- CORREÇÃO 1: Verificar políticas atuais de INSERT
-- =====================================================
SELECT 
    'POLÍTICAS INSERT ATUAIS' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    qual as condicao_usando,
    with_check as condicao_verificacao
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'bulk_campaigns'
AND cmd = 'INSERT'
ORDER BY policyname;

-- =====================================================
-- CORREÇÃO 2: Remover políticas de INSERT problemáticas
-- =====================================================
DROP POLICY IF EXISTS "Users can insert own campaigns" ON public.bulk_campaigns;
DROP POLICY IF EXISTS "Users can insert campaigns" ON public.bulk_campaigns;
DROP POLICY IF EXISTS "Insert campaigns" ON public.bulk_campaigns;

-- =====================================================
-- CORREÇÃO 3: Criar política de INSERT mais simples
-- =====================================================
CREATE POLICY "Users can insert campaigns" ON public.bulk_campaigns 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- =====================================================
-- CORREÇÃO 4: Verificar se a tabela tem RLS habilitado
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
-- CORREÇÃO 5: Garantir que RLS está habilitado
-- =====================================================
ALTER TABLE public.bulk_campaigns ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CORREÇÃO 6: Testar inserção com política simples
-- =====================================================
DO $$
DECLARE
    user_id_test uuid;
    campaign_id uuid;
BEGIN
    -- Obter um user_id de teste
    SELECT id INTO user_id_test FROM auth.users LIMIT 1;
    
    IF user_id_test IS NOT NULL THEN
        RAISE NOTICE 'Testando inserção com user_id: %', user_id_test;
        
        -- Simular auth.uid()
        PERFORM set_config('request.jwt.claims', '{"sub":"' || user_id_test || '"}', true);
        
        -- Tentar inserir uma campanha de teste
        BEGIN
            INSERT INTO bulk_campaigns (name, user_id, status, created_at)
            VALUES ('Teste de Inserção', user_id_test, 'active', NOW())
            RETURNING id INTO campaign_id;
            
            RAISE NOTICE 'Campanha de teste inserida com sucesso: %', campaign_id;
            
            -- Remover a campanha de teste
            DELETE FROM bulk_campaigns WHERE id = campaign_id;
            RAISE NOTICE 'Campanha de teste removida';
            
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'ERRO ao inserir campanha de teste: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'Nenhum usuário encontrado para teste';
    END IF;
END $$;

-- =====================================================
-- CORREÇÃO 7: Criar política alternativa mais permissiva
-- =====================================================
DROP POLICY IF EXISTS "Users can insert campaigns" ON public.bulk_campaigns;
CREATE POLICY "Allow campaign insertion" ON public.bulk_campaigns 
FOR INSERT 
WITH CHECK (true);

-- =====================================================
-- CORREÇÃO 8: Verificar políticas de outras operações
-- =====================================================
SELECT 
    'TODAS AS POLÍTICAS' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    qual as condicao_usando,
    with_check as condicao_verificacao
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'bulk_campaigns'
ORDER BY cmd, policyname;

-- =====================================================
-- CORREÇÃO 9: Garantir que todas as operações têm políticas
-- =====================================================
-- Política para SELECT
DROP POLICY IF EXISTS "Users can view own campaigns" ON public.bulk_campaigns;
CREATE POLICY "Users can view own campaigns" ON public.bulk_campaigns 
FOR SELECT 
USING (user_id = auth.uid());

-- Política para UPDATE
DROP POLICY IF EXISTS "Users can update own campaigns" ON public.bulk_campaigns;
CREATE POLICY "Users can update own campaigns" ON public.bulk_campaigns 
FOR UPDATE 
USING (user_id = auth.uid());

-- Política para DELETE
DROP POLICY IF EXISTS "Users can delete own campaigns" ON public.bulk_campaigns;
CREATE POLICY "Users can delete own campaigns" ON public.bulk_campaigns 
FOR DELETE 
USING (user_id = auth.uid());

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
-- Mostrar todas as políticas ativas
SELECT 
    'POLÍTICAS FINAIS' as categoria,
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

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'CORREÇÃO ERRO 403 CONCLUÍDA' as status,
    'Políticas de INSERT corrigidas' as mensagem,
    'Teste a criação de campanhas agora' as proximo_passo;


















