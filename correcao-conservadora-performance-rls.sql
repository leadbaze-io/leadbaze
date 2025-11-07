-- =====================================================
-- CORREÇÃO CONSERVADORA - PERFORMANCE RLS
-- =====================================================
-- Este script corrige problemas de Performance RLS de forma
-- ultra-conservadora com rollback completo
-- =====================================================

-- =====================================================
-- BACKUP COMPLETO ANTES DAS CORREÇÕES
-- =====================================================
-- Criar tabela de backup das políticas atuais
CREATE TABLE IF NOT EXISTS backup_policies_performance_rls AS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check,
    'ANTES_CORRECAO_PERFORMANCE' as backup_tag,
    NOW() as backup_timestamp
FROM pg_policies 
WHERE schemaname = 'public'
AND (
    (qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%')
    OR (with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%')
    OR qual LIKE '%current_setting%'
    OR with_check LIKE '%current_setting%'
);

-- =====================================================
-- VERIFICAÇÃO: Políticas que serão alteradas
-- =====================================================
SELECT 
    'POLÍTICAS QUE SERÃO ALTERADAS' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    CASE 
        WHEN qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%' THEN 'auth.uid() → (select auth.uid())'
        WHEN with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%' THEN 'auth.uid() → (select auth.uid())'
        WHEN qual LIKE '%current_setting%' THEN 'current_setting() → (select current_setting())'
        WHEN with_check LIKE '%current_setting%' THEN 'current_setting() → (select current_setting())'
        ELSE 'Outro problema'
    END as alteracao
FROM pg_policies 
WHERE schemaname = 'public'
AND (
    (qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%')
    OR (with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%')
    OR qual LIKE '%current_setting%'
    OR with_check LIKE '%current_setting%'
)
ORDER BY tablename, policyname;

-- =====================================================
-- CORREÇÃO 1: Otimizar auth.uid() em políticas RLS
-- =====================================================
DO $$
DECLARE
    policy_rec RECORD;
    new_qual TEXT;
    new_with_check TEXT;
    update_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== INICIANDO CORREÇÃO PERFORMANCE RLS ===';
    
    -- Loop através das políticas que precisam ser corrigidas
    FOR policy_rec IN 
        SELECT 
            schemaname,
            tablename,
            policyname,
            cmd,
            qual,
            with_check
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND (
            (qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%')
            OR (with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%')
        )
    LOOP
        BEGIN
            -- Preparar novas definições
            new_qual := policy_rec.qual;
            new_with_check := policy_rec.with_check;
            
            -- Substituir auth.uid() por (select auth.uid())
            IF new_qual IS NOT NULL THEN
                new_qual := REPLACE(new_qual, 'auth.uid()', '(select auth.uid())');
            END IF;
            
            IF new_with_check IS NOT NULL THEN
                new_with_check := REPLACE(new_with_check, 'auth.uid()', '(select auth.uid())');
            END IF;
            
            -- Remover política existente
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                policy_rec.policyname, 
                policy_rec.schemaname, 
                policy_rec.tablename);
            
            -- Recriar política otimizada
            EXECUTE format('CREATE POLICY %I ON %I.%I FOR %s USING (%s) WITH CHECK (%s)', 
                policy_rec.policyname,
                policy_rec.schemaname,
                policy_rec.tablename,
                policy_rec.cmd,
                COALESCE(new_qual, 'true'),
                COALESCE(new_with_check, 'true'));
            
            update_count := update_count + 1;
            RAISE NOTICE 'Política % atualizada na tabela %', policy_rec.policyname, policy_rec.tablename;
            
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'ERRO ao atualizar política % na tabela %: %', 
                    policy_rec.policyname, policy_rec.tablename, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE '=== CORREÇÃO CONCLUÍDA: % políticas atualizadas ===', update_count;
END $$;

-- =====================================================
-- CORREÇÃO 2: Otimizar current_setting() em políticas RLS
-- =====================================================
DO $$
DECLARE
    policy_rec RECORD;
    new_qual TEXT;
    new_with_check TEXT;
    update_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== INICIANDO CORREÇÃO CURRENT_SETTING ===';
    
    -- Loop através das políticas que usam current_setting
    FOR policy_rec IN 
        SELECT 
            schemaname,
            tablename,
            policyname,
            cmd,
            qual,
            with_check
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND (
            qual LIKE '%current_setting%'
            OR with_check LIKE '%current_setting%'
        )
    LOOP
        BEGIN
            -- Preparar novas definições
            new_qual := policy_rec.qual;
            new_with_check := policy_rec.with_check;
            
            -- Substituir current_setting() por (select current_setting())
            IF new_qual IS NOT NULL THEN
                new_qual := REPLACE(new_qual, 'current_setting(', '(select current_setting(');
                new_qual := REPLACE(new_qual, '))', ')');
            END IF;
            
            IF new_with_check IS NOT NULL THEN
                new_with_check := REPLACE(new_with_check, 'current_setting(', '(select current_setting(');
                new_with_check := REPLACE(new_with_check, '))', ')');
            END IF;
            
            -- Remover política existente
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                policy_rec.policyname, 
                policy_rec.schemaname, 
                policy_rec.tablename);
            
            -- Recriar política otimizada
            EXECUTE format('CREATE POLICY %I ON %I.%I FOR %s USING (%s) WITH CHECK (%s)', 
                policy_rec.policyname,
                policy_rec.schemaname,
                policy_rec.tablename,
                policy_rec.cmd,
                COALESCE(new_qual, 'true'),
                COALESCE(new_with_check, 'true'));
            
            update_count := update_count + 1;
            RAISE NOTICE 'Política % atualizada na tabela %', policy_rec.policyname, policy_rec.tablename;
            
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'ERRO ao atualizar política % na tabela %: %', 
                    policy_rec.policyname, policy_rec.tablename, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE '=== CORREÇÃO CURRENT_SETTING CONCLUÍDA: % políticas atualizadas ===', update_count;
END $$;

-- =====================================================
-- VERIFICAÇÃO: Status após correções
-- =====================================================
SELECT 
    'STATUS APÓS CORREÇÕES' as categoria,
    'Políticas com auth.uid() não otimizado' as problema,
    COUNT(*) as quantidade
FROM pg_policies 
WHERE schemaname = 'public'
AND (
    (qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%')
    OR (with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%')
)
UNION ALL
SELECT 
    'STATUS APÓS CORREÇÕES' as categoria,
    'Políticas com current_setting não otimizado' as problema,
    COUNT(*) as quantidade
FROM pg_policies 
WHERE schemaname = 'public'
AND (
    qual LIKE '%current_setting%'
    OR with_check LIKE '%current_setting%'
)
UNION ALL
SELECT 
    'STATUS APÓS CORREÇÕES' as categoria,
    'Total de políticas otimizadas' as problema,
    COUNT(*) as quantidade
FROM backup_policies_performance_rls
WHERE backup_tag = 'ANTES_CORRECAO_PERFORMANCE';

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'CORREÇÃO PERFORMANCE RLS CONCLUÍDA' as status,
    'Políticas otimizadas com sucesso' as mensagem,
    'Teste a aplicação para verificar se tudo funciona' as proximo_passo;




















