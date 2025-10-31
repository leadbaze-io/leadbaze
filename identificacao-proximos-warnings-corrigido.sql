-- =====================================================
-- IDENTIFICAÇÃO DOS PRÓXIMOS WARNINGS - VERSÃO CORRIGIDA
-- =====================================================
-- Este script identifica os próximos warnings para resolver
-- após corrigir os 11 erros de segurança
-- =====================================================

-- =====================================================
-- ANÁLISE 1: Warnings de Performance (RLS)
-- =====================================================
SELECT 
    'PERFORMANCE RLS' as categoria,
    'auth_rls_initplan' as tipo_warning,
    COUNT(*) as quantidade_estimada,
    'Otimizar chamadas auth.uid() em políticas RLS' as solucao
FROM pg_policies 
WHERE schemaname = 'public'
AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
AND (qual NOT LIKE '%(select auth.uid())%' AND with_check NOT LIKE '%(select auth.uid())%')
UNION ALL
SELECT 
    'PERFORMANCE RLS' as categoria,
    'current_setting_calls' as tipo_warning,
    COUNT(*) as quantidade_estimada,
    'Otimizar chamadas current_setting() em políticas RLS' as solucao
FROM pg_policies 
WHERE schemaname = 'public'
AND (qual LIKE '%current_setting%' OR with_check LIKE '%current_setting%');

-- =====================================================
-- ANÁLISE 2: Warnings de Duplicatas de Índices (Simplificado)
-- =====================================================
SELECT 
    'DUPLICATAS INDICES' as categoria,
    'indices_duplicados' as tipo_warning,
    COUNT(*) as quantidade_estimada,
    'Remover índices duplicados ou redundantes' as solucao
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname LIKE '%_user_id%'
AND EXISTS (
    SELECT 1 FROM pg_indexes i2 
    WHERE i2.schemaname = 'public' 
    AND i2.tablename = pg_indexes.tablename
    AND i2.indexname != pg_indexes.indexname
    AND i2.indexname LIKE '%_user_id_created_at%'
);

-- =====================================================
-- ANÁLISE 3: Warnings de Múltiplas Políticas Permissivas
-- =====================================================
SELECT 
    'MULTIPLAS POLITICAS' as categoria,
    'politicas_permissivas_multiplas' as tipo_warning,
    COUNT(*) as quantidade_estimada,
    'Consolidar políticas permissivas em uma única' as solucao
FROM (
    SELECT 
        tablename,
        cmd,
        COUNT(*) as total_policies
    FROM pg_policies 
    WHERE schemaname = 'public'
    AND permissive = true
    GROUP BY tablename, cmd
    HAVING COUNT(*) > 1
) subquery;

-- =====================================================
-- ANÁLISE 4: Tabelas sem RLS (se houver)
-- =====================================================
SELECT 
    'RLS DESABILITADO' as categoria,
    'tabelas_sem_rls' as tipo_warning,
    COUNT(*) as quantidade_estimada,
    'Habilitar RLS em tabelas públicas' as solucao
FROM pg_tables 
WHERE schemaname = 'public'
AND NOT rowsecurity
AND tablename NOT LIKE 'backup_%'
AND tablename NOT IN (
    'subscription_changes',
    'upgrade_pending', 
    'campaign_leads_backup',
    'user_payment_subscriptions',
    'backup_rls_performance',
    'backup_seguro_antes_rollback'
);

-- =====================================================
-- ANÁLISE 5: Índices faltando em campos importantes
-- =====================================================
SELECT 
    'INDICES FALTANDO' as categoria,
    'campos_sem_indice' as tipo_warning,
    COUNT(*) as quantidade_estimada,
    'Criar índices em campos user_id, created_at, status' as solucao
FROM (
    SELECT 
        t.table_name,
        c.column_name
    FROM information_schema.tables t
    JOIN information_schema.columns c ON t.table_name = c.table_name
    WHERE t.table_schema = 'public'
    AND c.column_name IN ('user_id', 'created_at', 'status', 'author_id')
    AND NOT EXISTS (
        SELECT 1 FROM pg_indexes i 
        WHERE i.tablename = t.table_name 
        AND i.indexdef LIKE '%' || c.column_name || '%'
    )
) subquery;

-- =====================================================
-- RESUMO: Prioridades de correção
-- =====================================================
SELECT 
    'PRIORIDADES CORREÇÃO' as categoria,
    '1. PERFORMANCE RLS' as prioridade,
    'Corrigir auth.uid() e current_setting()' as acao,
    'ALTA' as urgencia
UNION ALL
SELECT 
    'PRIORIDADES CORREÇÃO' as categoria,
    '2. DUPLICATAS INDICES' as prioridade,
    'Remover índices redundantes' as acao,
    'MÉDIA' as urgencia
UNION ALL
SELECT 
    'PRIORIDADES CORREÇÃO' as categoria,
    '3. MULTIPLAS POLITICAS' as prioridade,
    'Consolidar políticas permissivas' as acao,
    'MÉDIA' as urgencia
UNION ALL
SELECT 
    'PRIORIDADES CORREÇÃO' as categoria,
    '4. INDICES FALTANDO' as prioridade,
    'Criar índices preventivos' as acao,
    'BAIXA' as urgencia;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'ANÁLISE CONCLUÍDA' as status,
    'Próximos warnings identificados' as mensagem,
    'Escolha qual categoria corrigir primeiro' as proximo_passo;


















