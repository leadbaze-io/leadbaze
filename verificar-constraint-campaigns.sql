-- Verificar constraints da tabela campaigns
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'campaigns'::regclass
AND conname LIKE '%status%';

-- Verificar valores permitidos para status
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'campaigns' 
AND column_name = 'status';

-- Verificar se há enum ou check constraint para status
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%status%' OR t.typname LIKE '%campaign%';


















