-- CORREÇÃO: Criar função get_n8n_blog_stats() que está faltando
-- Esta função é necessária para o endpoint /api/blog/automation/stats

-- 1. Verificar se a função existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'get_n8n_blog_stats'
        ) 
        THEN 'FUNÇÃO EXISTE' 
        ELSE 'FUNÇÃO NÃO EXISTE - CRIANDO...' 
    END as function_check;

-- 2. Criar a função se não existir
CREATE OR REPLACE FUNCTION get_n8n_blog_stats()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_queue', COUNT(*),
        'pending', COUNT(*) FILTER (WHERE processed = FALSE AND error_message IS NULL),
        'processed', COUNT(*) FILTER (WHERE processed = TRUE),
        'errors', COUNT(*) FILTER (WHERE error_message IS NOT NULL),
        'today_added', COUNT(*) FILTER (WHERE date = CURRENT_DATE),
        'this_week', COUNT(*) FILTER (WHERE date >= CURRENT_DATE - INTERVAL '7 days'),
        'last_processed', MAX(processed_at)
    )
    INTO result
    FROM n8n_blog_queue;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 3. Verificar se foi criada corretamente
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'get_n8n_blog_stats';

-- 4. Testar a função
SELECT get_n8n_blog_stats();

-- 5. Comentário
COMMENT ON FUNCTION get_n8n_blog_stats() IS 'Retorna estatísticas da fila de processamento N8N para o endpoint /api/blog/automation/stats';

