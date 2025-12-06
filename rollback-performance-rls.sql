-- =====================================================
-- ROLLBACK COMPLETO - PERFORMANCE RLS
-- =====================================================
-- Este script reverte TODAS as mudanças feitas pela
-- correção de Performance RLS
-- =====================================================

-- =====================================================
-- VERIFICAÇÃO: Backup disponível
-- =====================================================
SELECT 
    'VERIFICAÇÃO BACKUP' as categoria,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_policies_performance_rls') THEN '✅ Backup disponível'
        ELSE '❌ Backup não encontrado'
    END as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_policies_performance_rls') THEN (SELECT COUNT(*)::text FROM backup_policies_performance_rls WHERE backup_tag = 'ANTES_CORRECAO_PERFORMANCE')
        ELSE '0'
    END as politicas_backup;

-- =====================================================
-- ROLLBACK: Restaurar políticas originais
-- =====================================================
DO $$
DECLARE
    backup_rec RECORD;
    restore_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== INICIANDO ROLLBACK PERFORMANCE RLS ===';
    
    -- Verificar se backup existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_policies_performance_rls') THEN
        RAISE NOTICE 'ERRO: Tabela de backup não encontrada!';
        RETURN;
    END IF;
    
    -- Loop através das políticas no backup
    FOR backup_rec IN 
        SELECT 
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
        FROM backup_policies_performance_rls
        WHERE backup_tag = 'ANTES_CORRECAO_PERFORMANCE'
    LOOP
        BEGIN
            -- Remover política atual (se existir)
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                backup_rec.policyname, 
                backup_rec.schemaname, 
                backup_rec.tablename);
            
            -- Recriar política original
            EXECUTE format('CREATE POLICY %I ON %I.%I FOR %s USING (%s) WITH CHECK (%s)', 
                backup_rec.policyname,
                backup_rec.schemaname,
                backup_rec.tablename,
                backup_rec.cmd,
                COALESCE(backup_rec.qual, 'true'),
                COALESCE(backup_rec.with_check, 'true'));
            
            restore_count := restore_count + 1;
            RAISE NOTICE 'Política % restaurada na tabela %', backup_rec.policyname, backup_rec.tablename;
            
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'ERRO ao restaurar política % na tabela %: %', 
                    backup_rec.policyname, backup_rec.tablename, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE '=== ROLLBACK CONCLUÍDO: % políticas restauradas ===', restore_count;
END $$;

-- =====================================================
-- VERIFICAÇÃO: Status após rollback
-- =====================================================
SELECT 
    'STATUS APÓS ROLLBACK' as categoria,
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
    'STATUS APÓS ROLLBACK' as categoria,
    'Políticas com current_setting não otimizado' as problema,
    COUNT(*) as quantidade
FROM pg_policies 
WHERE schemaname = 'public'
AND (
    qual LIKE '%current_setting%'
    OR with_check LIKE '%current_setting%'
);

-- =====================================================
-- LIMPEZA: Remover tabela de backup (opcional)
-- =====================================================
-- Descomente a linha abaixo se quiser remover o backup após rollback
-- DROP TABLE IF EXISTS backup_policies_performance_rls;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'ROLLBACK PERFORMANCE RLS CONCLUÍDO' as status,
    'Todas as políticas foram restauradas ao estado original' as mensagem,
    'Sistema deve estar funcionando como antes' as proximo_passo;






















