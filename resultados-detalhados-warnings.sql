-- =====================================================
-- RESULTADOS DETALHADOS - PRÓXIMOS WARNINGS
-- =====================================================
-- Este script mostra os resultados detalhados de cada análise
-- para decidir qual categoria corrigir primeiro
-- =====================================================

-- =====================================================
-- RESULTADO 1: Performance RLS - Detalhes
-- =====================================================
SELECT 
    'PERFORMANCE RLS - DETALHES' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    CASE 
        WHEN qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%' THEN 'auth.uid() não otimizado'
        WHEN with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%' THEN 'auth.uid() não otimizado'
        WHEN qual LIKE '%current_setting%' THEN 'current_setting() presente'
        WHEN with_check LIKE '%current_setting%' THEN 'current_setting() presente'
        ELSE 'Outro problema'
    END as problema
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
-- RESULTADO 2: Duplicatas de Índices - Detalhes
-- =====================================================
SELECT 
    'DUPLICATAS INDICES - DETALHES' as categoria,
    i1.tablename as tabela,
    i1.indexname as index_menor,
    i2.indexname as index_maior,
    CASE 
        WHEN i1.indexname LIKE '%_user_id' AND i2.indexname LIKE '%_user_id_%' THEN 'user_id redundante'
        WHEN i1.indexname LIKE '%_status' AND i2.indexname LIKE '%_status_%' THEN 'status redundante'
        WHEN i1.indexname LIKE '%_created_at' AND i2.indexname LIKE '%_created_at_%' THEN 'created_at redundante'
        ELSE 'Definição similar'
    END as tipo_redundancia
FROM pg_indexes i1
JOIN pg_indexes i2 ON i1.tablename = i2.tablename 
    AND i1.schemaname = i2.schemaname
    AND i1.indexname != i2.indexname
WHERE i1.schemaname = 'public'
AND i2.schemaname = 'public'
AND (
    (i1.indexname LIKE '%_user_id' AND i2.indexname LIKE '%_user_id_%')
    OR (i1.indexname LIKE '%_status' AND i2.indexname LIKE '%_status_%')
    OR (i1.indexname LIKE '%_created_at' AND i2.indexname LIKE '%_created_at_%')
    OR (LENGTH(i1.indexdef) < LENGTH(i2.indexdef) AND i2.indexdef LIKE '%' || i1.indexdef || '%')
)
ORDER BY i1.tablename, i1.indexname;

-- =====================================================
-- RESULTADO 3: Múltiplas Políticas Permissivas - Detalhes
-- =====================================================
SELECT 
    'MULTIPLAS POLITICAS - DETALHES' as categoria,
    tablename as tabela,
    cmd as operacao,
    COUNT(*) as total_politicas,
    STRING_AGG(policyname, ', ') as politicas
FROM pg_policies 
WHERE schemaname = 'public'
AND permissive = 'PERMISSIVE'
GROUP BY tablename, cmd
HAVING COUNT(*) > 1
ORDER BY total_politicas DESC, tablename;

-- =====================================================
-- RESULTADO 4: Tabelas sem RLS - Detalhes
-- =====================================================
SELECT 
    'RLS DESABILITADO - DETALHES' as categoria,
    tablename as tabela,
    CASE 
        WHEN tablename LIKE '%backup%' THEN 'Tabela de backup'
        WHEN tablename IN ('subscription_changes', 'upgrade_pending', 'campaign_leads_backup', 'user_payment_subscriptions', 'backup_rls_performance', 'backup_seguro_antes_rollback') THEN 'Já corrigida'
        ELSE 'Precisa correção'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
AND NOT rowsecurity
ORDER BY tablename;

-- =====================================================
-- RESULTADO 5: Índices Faltando - Detalhes
-- =====================================================
SELECT 
    'INDICES FALTANDO - DETALHES' as categoria,
    t.table_name as tabela,
    c.column_name as campo,
    CASE 
        WHEN c.column_name = 'user_id' THEN 'CRÍTICO - Campo principal'
        WHEN c.column_name = 'author_id' THEN 'CRÍTICO - Campo principal'
        WHEN c.column_name = 'created_at' THEN 'IMPORTANTE - Ordenação'
        WHEN c.column_name = 'status' THEN 'IMPORTANTE - Filtros'
        ELSE 'MODERADO'
    END as prioridade
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
AND c.column_name IN ('user_id', 'created_at', 'status', 'author_id')
AND NOT EXISTS (
    SELECT 1 FROM pg_indexes i 
    WHERE i.tablename = t.table_name 
    AND i.indexdef LIKE '%' || c.column_name || '%'
)
ORDER BY 
    CASE 
        WHEN c.column_name IN ('user_id', 'author_id') THEN 1
        WHEN c.column_name = 'created_at' THEN 2
        WHEN c.column_name = 'status' THEN 3
        ELSE 4
    END,
    t.table_name;

-- =====================================================
-- RESULTADO 6: Políticas RLS Complexas - Detalhes
-- =====================================================
SELECT 
    'RLS PERFORMANCE - DETALHES' as categoria,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    CASE 
        WHEN LENGTH(qual) > 200 THEN 'Qual muito longo (' || LENGTH(qual) || ' chars)'
        WHEN LENGTH(with_check) > 200 THEN 'With_check muito longo (' || LENGTH(with_check) || ' chars)'
        WHEN qual LIKE '%AND%' AND qual LIKE '%OR%' THEN 'Múltiplas condições'
        WHEN with_check LIKE '%AND%' AND with_check LIKE '%OR%' THEN 'Múltiplas condições'
        WHEN qual LIKE '%SELECT%' THEN 'Subconsulta em qual'
        WHEN with_check LIKE '%SELECT%' THEN 'Subconsulta em with_check'
        ELSE 'Outro problema'
    END as problema,
    LENGTH(qual) as tamanho_qual,
    LENGTH(with_check) as tamanho_with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND (
    LENGTH(qual) > 200 
    OR LENGTH(with_check) > 200
    OR (qual LIKE '%AND%' AND qual LIKE '%OR%')
    OR (with_check LIKE '%AND%' AND with_check LIKE '%OR%')
    OR qual LIKE '%SELECT%'
    OR with_check LIKE '%SELECT%'
)
ORDER BY 
    CASE 
        WHEN LENGTH(qual) > 200 OR LENGTH(with_check) > 200 THEN 1
        WHEN qual LIKE '%SELECT%' OR with_check LIKE '%SELECT%' THEN 2
        ELSE 3
    END,
    tablename;

-- =====================================================
-- RESUMO EXECUTIVO
-- =====================================================
SELECT 
    'RESUMO EXECUTIVO' as categoria,
    'Total de problemas identificados' as metrica,
    (
        (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND (qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%') OR (with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%') OR qual LIKE '%current_setting%' OR with_check LIKE '%current_setting%')
        + (SELECT COUNT(*) FROM (
            SELECT DISTINCT i1.tablename, i1.indexname
            FROM pg_indexes i1
            JOIN pg_indexes i2 ON i1.tablename = i2.tablename AND i1.schemaname = i2.schemaname AND i1.indexname != i2.indexname
            WHERE i1.schemaname = 'public' AND i2.schemaname = 'public'
            AND ((i1.indexname LIKE '%_user_id' AND i2.indexname LIKE '%_user_id_%') OR (i1.indexname LIKE '%_status' AND i2.indexname LIKE '%_status_%') OR (i1.indexname LIKE '%_created_at' AND i2.indexname LIKE '%_created_at_%') OR (LENGTH(i1.indexdef) < LENGTH(i2.indexdef) AND i2.indexdef LIKE '%' || i1.indexdef || '%'))
        ) subquery)
        + (SELECT COUNT(*) FROM (
            SELECT tablename, cmd FROM pg_policies WHERE schemaname = 'public' AND permissive = 'PERMISSIVE' GROUP BY tablename, cmd HAVING COUNT(*) > 1
        ) subquery)
    )::text as valor
UNION ALL
SELECT 
    'RESUMO EXECUTIVO' as categoria,
    'Recomendação de prioridade' as metrica,
    'Começar com PERFORMANCE RLS (maior impacto na aplicação)' as valor;









