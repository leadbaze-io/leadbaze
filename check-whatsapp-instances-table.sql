-- Verificar se a tabela whatsapp_instances existe e sua estrutura
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'whatsapp_instances' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se existem registros na tabela
SELECT COUNT(*) as total_instances FROM public.whatsapp_instances;

-- Verificar instâncias por status
SELECT 
    status,
    COUNT(*) as count
FROM public.whatsapp_instances 
GROUP BY status;

-- Verificar instâncias do usuário atual (se logado)
SELECT 
    instance_name,
    status,
    whatsapp_number,
    last_connection_at,
    created_at
FROM public.whatsapp_instances 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;


















