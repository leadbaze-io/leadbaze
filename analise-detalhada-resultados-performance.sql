-- =====================================================
-- ANÁLISE DETALHADA - RESULTADOS PERFORMANCE RLS
-- =====================================================
-- Este script mostra exatamente o que aconteceu com as
-- correções de Performance RLS e por que os warnings podem
-- não ter diminuído tanto quanto esperado
-- =====================================================

-- =====================================================
-- ANÁLISE 1: Problemas Performance RLS ANTES das correções
-- =====================================================
SELECT 
    'ANTES DAS CORREÇÕES' as categoria,
    'Políticas com auth.uid() não otimizado' as problema,
    COUNT(*) as quantidade
FROM backup_policies_performance_rls
WHERE backup_tag = 'ANTES_CORRECAO_PERFORMANCE'
AND (
    (qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%')
    OR (with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%')
)
UNION ALL
SELECT 
    'ANTES DAS CORREÇÕES' as categoria,
    'Políticas com current_setting não otimizado' as problema,
    COUNT(*) as quantidade
FROM backup_policies_performance_rls
WHERE backup_tag = 'ANTES_CORRECAO_PERFORMANCE'
AND (
    qual LIKE '%current_setting%'
    OR with_check LIKE '%current_setting%'
)
UNION ALL
SELECT 
    'ANTES DAS CORREÇÕES' as categoria,
    'Total de políticas problemáticas' as problema,
    COUNT(*) as quantidade
FROM backup_policies_performance_rls
WHERE backup_tag = 'ANTES_CORRECAO_PERFORMANCE';

-- =====================================================
-- ANÁLISE 2: Problemas Performance RLS APÓS as correções
-- =====================================================
SELECT 
    'APÓS AS CORREÇÕES' as categoria,
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
    'APÓS AS CORREÇÕES' as categoria,
    'Políticas com current_setting não otimizado' as problema,
    COUNT(*) as quantidade
FROM pg_policies 
WHERE schemaname = 'public'
AND (
    qual LIKE '%current_setting%'
    OR with_check LIKE '%current_setting%'
);

-- =====================================================
-- ANÁLISE 3: Políticas que foram realmente otimizadas
-- =====================================================
SELECT 
    'POLÍTICAS OTIMIZADAS' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    CASE 
        WHEN qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%' THEN 'auth.uid() otimizado'
        WHEN qual LIKE '%(select current_setting%' OR with_check LIKE '%(select current_setting%' THEN 'current_setting() otimizado'
        ELSE 'Outro'
    END as tipo_otimizacao,
    qual as definicao_qual,
    with_check as definicao_with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND (
    (qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%')
    OR (qual LIKE '%(select current_setting%' OR with_check LIKE '%(select current_setting%')
)
ORDER BY tablename, policyname;

-- =====================================================
-- ANÁLISE 4: Comparação ANTES vs DEPOIS
-- =====================================================
SELECT 
    'COMPARAÇÃO ANTES vs DEPOIS' as categoria,
    'Políticas problemáticas ANTES' as metrica,
    (SELECT COUNT(*) FROM backup_policies_performance_rls WHERE backup_tag = 'ANTES_CORRECAO_PERFORMANCE')::text as quantidade
UNION ALL
SELECT 
    'COMPARAÇÃO ANTES vs DEPOIS' as categoria,
    'Políticas problemáticas DEPOIS' as metrica,
    (
        (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND ((qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%') OR (with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%')))
        + (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND (qual LIKE '%current_setting%' OR with_check LIKE '%current_setting%'))
    )::text as quantidade
UNION ALL
SELECT 
    'COMPARAÇÃO ANTES vs DEPOIS' as categoria,
    'Políticas otimizadas' as metrica,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND ((qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%') OR (qual LIKE '%(select current_setting%' OR with_check LIKE '%(select current_setting%')))::text as quantidade;

-- =====================================================
-- ANÁLISE 5: Por que os warnings podem não ter diminuído?
-- =====================================================
SELECT 
    'POSSÍVEIS MOTIVOS' as categoria,
    'Outros tipos de warnings Performance RLS' as motivo,
    'Pode haver outros padrões não detectados' as explicacao
UNION ALL
SELECT 
    'POSSÍVEIS MOTIVOS' as categoria,
    'Warnings de outras categorias' as motivo,
    'Duplicatas, múltiplas políticas, etc.' as explicacao
UNION ALL
SELECT 
    'POSSÍVEIS MOTIVOS' as categoria,
    'Cache do Supabase' as motivo,
    'Warnings podem demorar para atualizar' as explicacao
UNION ALL
SELECT 
    'POSSÍVEIS MOTIVOS' as categoria,
    'Políticas não detectadas' as motivo,
    'Algumas políticas podem ter padrões diferentes' as explicacao;

-- =====================================================
-- ANÁLISE 6: Verificar todos os tipos de warnings atuais
-- =====================================================
SELECT 
    'TIPOS DE WARNINGS ATUAIS' as categoria,
    'auth_rls_initplan' as tipo,
    COUNT(*) as quantidade
FROM pg_policies 
WHERE schemaname = 'public'
AND (
    (qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%')
    OR (with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%')
)
UNION ALL
SELECT 
    'TIPOS DE WARNINGS ATUAIS' as categoria,
    'current_setting_calls' as tipo,
    COUNT(*) as quantidade
FROM pg_policies 
WHERE schemaname = 'public'
AND (
    qual LIKE '%current_setting%'
    OR with_check LIKE '%current_setting%'
)
UNION ALL
SELECT 
    'TIPOS DE WARNINGS ATUAIS' as categoria,
    'duplicate_index' as tipo,
    COUNT(*) as quantidade
FROM (
    SELECT DISTINCT i1.tablename, i1.indexname
    FROM pg_indexes i1
    JOIN pg_indexes i2 ON i1.tablename = i2.tablename AND i1.schemaname = i2.schemaname AND i1.indexname != i2.indexname
    WHERE i1.schemaname = 'public' AND i2.schemaname = 'public'
    AND ((i1.indexname LIKE '%_user_id' AND i2.indexname LIKE '%_user_id_%') OR (i1.indexname LIKE '%_status' AND i2.indexname LIKE '%_status_%') OR (i1.indexname LIKE '%_created_at' AND i2.indexname LIKE '%_created_at_%') OR (LENGTH(i1.indexdef) < LENGTH(i2.indexdef) AND i2.indexdef LIKE '%' || i1.indexdef || '%'))
) subquery
UNION ALL
SELECT 
    'TIPOS DE WARNINGS ATUAIS' as categoria,
    'multiple_permissive_policies' as tipo,
    COUNT(*) as quantidade
FROM (
    SELECT tablename, cmd FROM pg_policies WHERE schemaname = 'public' AND permissive = 'PERMISSIVE' GROUP BY tablename, cmd HAVING COUNT(*) > 1
) subquery;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'ANÁLISE DETALHADA CONCLUÍDA' as status,
    'Verifique os resultados acima para entender o impacto' as mensagem,
    'Se necessário, execute próximas correções' as proximo_passo;


















