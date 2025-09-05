-- Verificar o schema atual da tabela blog_posts
-- Execute este script para ver quais colunas existem

-- 1. Verificar colunas da tabela blog_posts
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'blog_posts' 
ORDER BY ordinal_position;

-- 2. Verificar se existe coluna 'status'
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'blog_posts' AND column_name = 'status'
        ) 
        THEN 'EXISTE' 
        ELSE 'NÃO EXISTE' 
    END as status_column_exists;

-- 3. Verificar a função atual process_n8n_blog_queue
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'process_n8n_blog_queue';

-- 4. Verificar se há alguma referência à coluna status na função
SELECT 
    CASE 
        WHEN routine_definition LIKE '%status%' 
        THEN 'FUNÇÃO CONTÉM REFERÊNCIA A STATUS' 
        ELSE 'FUNÇÃO NÃO CONTÉM REFERÊNCIA A STATUS' 
    END as function_status_check
FROM information_schema.routines 
WHERE routine_name = 'process_n8n_blog_queue';

