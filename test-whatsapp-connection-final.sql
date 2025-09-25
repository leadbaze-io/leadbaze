-- Script final para testar a conexão WhatsApp após limpeza
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar status atual das instâncias
SELECT 
    user_id,
    COUNT(*) as total_instances,
    COUNT(CASE WHEN status = 'connected' THEN 1 END) as connected_instances,
    COUNT(CASE WHEN status = 'qrcode' THEN 1 END) as qrcode_instances,
    COUNT(CASE WHEN status = 'disconnected' THEN 1 END) as disconnected_instances
FROM public.whatsapp_instances 
GROUP BY user_id
ORDER BY total_instances DESC;

-- 2. Verificar instâncias específicas do usuário principal
SELECT 
    instance_name,
    status,
    created_at,
    last_connection_at,
    whatsapp_number,
    EXTRACT(EPOCH FROM (NOW() - created_at))/3600 as hours_since_created,
    EXTRACT(EPOCH FROM (NOW() - COALESCE(last_connection_at, created_at)))/3600 as hours_since_last_activity
FROM public.whatsapp_instances 
WHERE user_id = '7f90037e-5cff-4086-b6d7-4b48a796104b'
ORDER BY created_at DESC;

-- 3. Verificar se há instâncias órfãs restantes
SELECT 
    instance_name,
    status,
    created_at,
    CASE 
        WHEN status = 'qrcode' AND created_at < NOW() - INTERVAL '1 hour' THEN 'QR Code órfão'
        WHEN status = 'disconnected' AND COALESCE(last_connection_at, created_at) < NOW() - INTERVAL '24 hours' THEN 'Desconectada há muito tempo'
        ELSE 'OK'
    END as status_check
FROM public.whatsapp_instances 
WHERE user_id = '7f90037e-5cff-4086-b6d7-4b48a796104b'
ORDER BY created_at DESC;

-- 4. Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'whatsapp_instances' 
    AND table_schema = 'public'
ORDER BY ordinal_position;


















