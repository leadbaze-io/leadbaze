-- Verificar estrutura da tabela bulk_campaigns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'bulk_campaigns' 
AND column_name = 'message'
ORDER BY ordinal_position;

-- Verificar se há triggers na tabela bulk_campaigns
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'bulk_campaigns';

-- Verificar políticas RLS na tabela bulk_campaigns
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'bulk_campaigns';

-- Verificar dados de exemplo na tabela
SELECT 
    id,
    name,
    message,
    created_at,
    updated_at
FROM bulk_campaigns 
ORDER BY updated_at DESC 
LIMIT 5;
