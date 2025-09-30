-- Verificar estrutura da tabela campaigns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'campaigns' 
ORDER BY ordinal_position;