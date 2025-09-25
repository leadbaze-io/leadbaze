-- Verificar estrutura da tabela campaign_lists
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'campaign_lists'
ORDER BY ordinal_position;


















