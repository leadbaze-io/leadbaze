-- =====================================================
-- IDENTIFICAÇÃO DOS PRÓXIMOS WARNINGS - VERSÃO FINAL
-- =====================================================
-- Este script identifica os próximos warnings para resolver
-- após corrigir os 11 erros de segurança
-- Versão final com todas as correções aplicadas
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
-- ANÁLISE 2: Warnings de Duplicatas de Índices
-- =====================================================
SELECT 
    'DUPLICATAS INDICES' as categoria,
    'indices_duplicados' as tipo_warning,
    COUNT(*) as quantidade_estimada,
    'Remover índices duplicados ou redundantes' as solucao
FROM (
    -- Detecta índices que são subconjuntos de outros índices
    SELECT DISTINCT
        i1.tablename,
        i1.indexname as index_menor,
        i2.indexname as index_maior
    FROM pg_indexes i1
    JOIN pg_indexes i2 ON i1.tablename = i2.tablename 
        AND i1.schemaname = i2.schemaname
        AND i1.indexname != i2.indexname
    WHERE i1.schemaname = 'public'
    AND i2.schemaname = 'public'
    AND (
        -- Índice simples que é prefixo de índice composto
        (i1.indexname LIKE '%_user_id' AND i2.indexname LIKE '%_user_id_%')
        OR (i1.indexname LIKE '%_status' AND i2.indexname LIKE '%_status_%')
        OR (i1.indexname LIKE '%_created_at' AND i2.indexname LIKE '%_created_at_%')
        -- Ou índices com definições muito similares
        OR (LENGTH(i1.indexdef) < LENGTH(i2.indexdef) AND i2.indexdef LIKE '%' || i1.indexdef || '%')
    )
) subquery;

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
    AND permissive = 'PERMISSIVE'
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
-- ANÁLISE 6: Políticas RLS com problemas de performance
-- =====================================================
SELECT 
    'RLS PERFORMANCE' as categoria,
    'politicas_com_problemas' as tipo_warning,
    COUNT(*) as quantidade_estimada,
    'Otimizar políticas RLS complexas' as solucao
FROM pg_policies 
WHERE schemaname = 'public'
AND (
    -- Políticas muito complexas
    LENGTH(qual) > 200 
    OR LENGTH(with_check) > 200
    -- Políticas com múltiplas condições
    OR (qual LIKE '%AND%' AND qual LIKE '%OR%')
    OR (with_check LIKE '%AND%' AND with_check LIKE '%OR%')
    -- Políticas com subconsultas
    OR qual LIKE '%SELECT%'
    OR with_check LIKE '%SELECT%'
);

-- =====================================================
-- ANÁLISE 7: Tabelas com muitos índices (possível overhead)
-- =====================================================
SELECT 
    'MUITOS INDICES' as categoria,
    'tabelas_com_overhead' as tipo_warning,
    COUNT(*) as quantidade_estimada,
    'Revisar necessidade de todos os índices' as solucao
FROM (
    SELECT 
        tablename,
        COUNT(*) as total_indices
    FROM pg_indexes 
    WHERE schemaname = 'public'
    GROUP BY tablename
    HAVING COUNT(*) > 5
) subquery;

-- =====================================================
-- ANÁLISE 8: Views que podem ser materializadas
-- =====================================================
SELECT 
    'VIEWS MATERIALIZADAS' as categoria,
    'views_candidatas' as tipo_warning,
    COUNT(*) as quantidade_estimada,
    'Considerar materializar views complexas' as solucao
FROM information_schema.views v
WHERE v.table_schema = 'public'
AND EXISTS (
    SELECT 1 FROM information_schema.tables t
    WHERE t.table_schema = 'public'
    AND t.table_name = v.table_name
    AND t.table_type = 'VIEW'
)
AND v.table_name NOT LIKE 'backup_%';

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
    '2. RLS PERFORMANCE' as prioridade,
    'Otimizar políticas RLS complexas' as acao,
    'ALTA' as urgencia
UNION ALL
SELECT 
    'PRIORIDADES CORREÇÃO' as categoria,
    '3. DUPLICATAS INDICES' as prioridade,
    'Remover índices redundantes' as acao,
    'MÉDIA' as urgencia
UNION ALL
SELECT 
    'PRIORIDADES CORREÇÃO' as categoria,
    '4. MULTIPLAS POLITICAS' as prioridade,
    'Consolidar políticas permissivas' as acao,
    'MÉDIA' as urgencia
UNION ALL
SELECT 
    'PRIORIDADES CORREÇÃO' as categoria,
    '5. MUITOS INDICES' as prioridade,
    'Revisar overhead de índices' as acao,
    'MÉDIA' as urgencia
UNION ALL
SELECT 
    'PRIORIDADES CORREÇÃO' as categoria,
    '6. INDICES FALTANDO' as prioridade,
    'Criar índices preventivos' as acao,
    'BAIXA' as urgencia
UNION ALL
SELECT 
    'PRIORIDADES CORREÇÃO' as categoria,
    '7. RLS DESABILITADO' as prioridade,
    'Habilitar RLS em tabelas públicas' as acao,
    'BAIXA' as urgencia
UNION ALL
SELECT 
    'PRIORIDADES CORREÇÃO' as categoria,
    '8. VIEWS MATERIALIZADAS' as prioridade,
    'Considerar materializar views' as acao,
    'BAIXA' as urgencia;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'ANÁLISE CONCLUÍDA' as status,
    'Próximos warnings identificados' as mensagem,
    'Escolha qual categoria corrigir primeiro' as proximo_passo;




















