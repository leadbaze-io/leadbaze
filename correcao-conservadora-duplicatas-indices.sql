-- =====================================================
-- CORREÇÃO CONSERVADORA - DUPLICATAS DE ÍNDICES
-- =====================================================
-- Este script corrige duplicatas de índices de forma
-- ultra-conservadora com rollback completo
-- =====================================================

-- =====================================================
-- BACKUP COMPLETO ANTES DAS CORREÇÕES
-- =====================================================
-- Criar tabela de backup dos índices atuais
CREATE TABLE IF NOT EXISTS backup_indices_duplicatas AS
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef,
    'ANTES_CORRECAO_DUPLICATAS' as backup_tag,
    NOW() as backup_timestamp
FROM pg_indexes 
WHERE schemaname = 'public'
AND (
    -- Índices que são subconjuntos de outros índices
    EXISTS (
        SELECT 1 FROM pg_indexes i2 
        WHERE i2.schemaname = 'public' 
        AND i2.tablename = pg_indexes.tablename
        AND i2.indexname != pg_indexes.indexname
        AND (
            (pg_indexes.indexname LIKE '%_user_id' AND i2.indexname LIKE '%_user_id_%')
            OR (pg_indexes.indexname LIKE '%_status' AND i2.indexname LIKE '%_status_%')
            OR (pg_indexes.indexname LIKE '%_created_at' AND i2.indexname LIKE '%_created_at_%')
            OR (LENGTH(pg_indexes.indexdef) < LENGTH(i2.indexdef) AND i2.indexdef LIKE '%' || pg_indexes.indexdef || '%')
        )
    )
);

-- =====================================================
-- VERIFICAÇÃO: Índices que serão removidos
-- =====================================================
SELECT 
    'ÍNDICES QUE SERÃO REMOVIDOS' as categoria,
    i1.tablename as tabela,
    i1.indexname as index_menor,
    i2.indexname as index_maior,
    CASE 
        WHEN i1.indexname LIKE '%_user_id' AND i2.indexname LIKE '%_user_id_%' THEN 'user_id redundante'
        WHEN i1.indexname LIKE '%_status' AND i2.indexname LIKE '%_status_%' THEN 'status redundante'
        WHEN i1.indexname LIKE '%_created_at' AND i2.indexname LIKE '%_created_at_%' THEN 'created_at redundante'
        ELSE 'Definição similar'
    END as motivo_remocao
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
-- CORREÇÃO: Remover índices duplicados
-- =====================================================
DO $$
DECLARE
    index_rec RECORD;
    remove_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== INICIANDO CORREÇÃO DUPLICATAS DE ÍNDICES ===';
    
    -- Loop através dos índices que precisam ser removidos
    FOR index_rec IN 
        SELECT DISTINCT
            i1.schemaname,
            i1.tablename,
            i1.indexname,
            i1.indexdef
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
        -- Garantir que não removemos índices primários ou únicos
        AND i1.indexname NOT LIKE '%_pkey'
        AND i1.indexname NOT LIKE '%_key'
        AND i1.indexname NOT LIKE '%_fkey'
    LOOP
        BEGIN
            -- Verificar se o índice não é usado por constraints
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint c
                JOIN pg_class cl ON c.conindid = cl.oid
                WHERE cl.relname = index_rec.indexname
            ) THEN
                -- Remover índice duplicado
                EXECUTE format('DROP INDEX IF EXISTS %I.%I', 
                    index_rec.schemaname, 
                    index_rec.indexname);
                
                remove_count := remove_count + 1;
                RAISE NOTICE 'Índice % removido da tabela %', index_rec.indexname, index_rec.tablename;
            ELSE
                RAISE NOTICE 'Índice % mantido (usado por constraint)', index_rec.indexname;
            END IF;
            
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'ERRO ao remover índice % da tabela %: %', 
                    index_rec.indexname, index_rec.tablename, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE '=== CORREÇÃO CONCLUÍDA: % índices removidos ===', remove_count;
END $$;

-- =====================================================
-- VERIFICAÇÃO: Status após correções
-- =====================================================
SELECT 
    'STATUS APÓS CORREÇÕES' as categoria,
    'Índices duplicados restantes' as problema,
    COUNT(*) as quantidade
FROM (
    SELECT DISTINCT
        i1.tablename,
        i1.indexname
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
) subquery
UNION ALL
SELECT 
    'STATUS APÓS CORREÇÕES' as categoria,
    'Total de índices removidos' as problema,
    COUNT(*) as quantidade
FROM backup_indices_duplicatas
WHERE backup_tag = 'ANTES_CORRECAO_DUPLICATAS';

-- =====================================================
-- VERIFICAÇÃO: Índices restantes por tabela
-- =====================================================
SELECT 
    'ÍNDICES RESTANTES' as categoria,
    tablename as tabela,
    COUNT(*) as total_indices,
    STRING_AGG(indexname, ', ') as indices
FROM pg_indexes 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY total_indices DESC;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'CORREÇÃO DUPLICATAS CONCLUÍDA' as status,
    'Índices duplicados removidos com sucesso' as mensagem,
    'Teste a aplicação para verificar se tudo funciona' as proximo_passo;


















