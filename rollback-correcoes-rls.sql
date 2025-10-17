-- =====================================================
-- SCRIPT DE ROLLBACK - CORREÇÕES RLS
-- =====================================================
-- Este script reverte as correções de RLS em caso de problemas

-- =====================================================
-- 1. VERIFICAR BACKUP DAS POLÍTICAS
-- =====================================================

-- Verificar se o backup existe
SELECT 
    'BACKUP VERIFICATION' as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_rls_policies')
        THEN 'Backup encontrado - ' || COUNT(*) || ' políticas salvas'
        ELSE 'Backup NÃO encontrado'
    END as resultado
FROM backup_rls_policies;

-- =====================================================
-- 2. RESTAURAR POLÍTICAS ORIGINAIS
-- =====================================================

-- Restaurar políticas originais do backup
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Verificar se o backup existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_rls_policies') THEN
        RAISE EXCEPTION 'Backup não encontrado. Não é possível fazer rollback.';
    END IF;

    -- Restaurar cada política do backup
    FOR policy_record IN 
        SELECT * FROM backup_rls_policies
    LOOP
        -- Remover política atual se existir
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            policy_record.policyname, 
            policy_record.schemaname, 
            policy_record.tablename);
        
        -- Recriar política original
        EXECUTE format('CREATE POLICY %I ON %I.%I FOR %s %s %s %s',
            policy_record.policyname,
            policy_record.schemaname,
            policy_record.tablename,
            policy_record.cmd,
            CASE WHEN policy_record.permissive THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END,
            CASE WHEN policy_record.qual IS NOT NULL THEN 'USING (' || policy_record.qual || ')' ELSE '' END,
            CASE WHEN policy_record.with_check IS NOT NULL THEN 'WITH CHECK (' || policy_record.with_check || ')' ELSE '' END
        );
        
        RAISE NOTICE 'Política restaurada: %', policy_record.policyname;
    END LOOP;
    
    RAISE NOTICE 'Rollback concluído com sucesso!';
END $$;

-- =====================================================
-- 3. VERIFICAÇÃO PÓS-ROLLBACK
-- =====================================================

-- Verificar se as políticas foram restauradas
SELECT 
    'VERIFICAÇÃO PÓS-ROLLBACK' as status,
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 4. LIMPEZA DO BACKUP (OPCIONAL)
-- =====================================================

-- Descomente a linha abaixo para remover o backup após rollback bem-sucedido
-- DROP TABLE IF EXISTS backup_rls_policies;

-- =====================================================
-- 5. VERIFICAÇÃO DE FUNCIONALIDADE
-- =====================================================

-- Testar se as políticas originais estão funcionando
DO $$
DECLARE
    table_name text;
    test_result boolean;
BEGIN
    -- Testar acesso básico às tabelas principais
    FOR table_name IN 
        SELECT unnest(ARRAY['lead_lists', 'whatsapp_instances', 'bulk_campaigns'])
    LOOP
        -- Verificar se a tabela existe
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = table_name
        ) THEN
            -- Testar se consegue fazer SELECT (sem dados, apenas estrutura)
            EXECUTE format('SELECT 1 FROM public.%I LIMIT 1', table_name) INTO test_result;
            RAISE NOTICE 'Tabela %: Acesso restaurado com sucesso', table_name;
        ELSE
            RAISE NOTICE 'Tabela %: NÃO EXISTE', table_name;
        END IF;
    END LOOP;
END $$;

-- =====================================================
-- 6. RESUMO DO ROLLBACK
-- =====================================================

SELECT 
    'ROLLBACK CONCLUÍDO' as status,
    'Políticas RLS restauradas para versão original' as resultado,
    'Sistema voltou ao estado anterior' as observacao;











