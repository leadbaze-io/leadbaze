-- Verificar estrutura da tabela campaign_unique_leads
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'campaign_unique_leads' 
ORDER BY ordinal_position;


















