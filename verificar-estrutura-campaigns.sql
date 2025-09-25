-- =====================================================
-- VERIFICAÇÃO DA ESTRUTURA DA TABELA CAMPAIGNS
-- =====================================================

-- 1. Verificar todas as colunas da tabela campaigns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'campaigns'
ORDER BY ordinal_position;

-- 2. Verificar se as colunas necessárias existem
SELECT 
    CASE 
        WHEN column_name = 'success_count' THEN '✅ success_count existe'
        WHEN column_name = 'failed_count' THEN '✅ failed_count existe'
        WHEN column_name = 'completed_at' THEN '✅ completed_at existe'
        WHEN column_name = 'total_leads' THEN '✅ total_leads existe'
        WHEN column_name = 'sent_at' THEN '✅ sent_at existe'
        ELSE NULL
    END as status_coluna
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'campaigns'
AND column_name IN ('success_count', 'failed_count', 'completed_at', 'total_leads', 'sent_at');

-- 3. Verificar dados de exemplo na tabela campaigns
SELECT 
    id,
    name,
    status,
    message,
    created_at,
    updated_at
FROM campaigns 
LIMIT 3;

-- 4. Verificar se existem colunas que começam com 'success' ou 'failed'
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'campaigns'
AND (column_name LIKE '%success%' OR column_name LIKE '%failed%' OR column_name LIKE '%complete%' OR column_name LIKE '%total%');


















