-- Script para limpar instâncias WhatsApp órfãs e otimizar o sistema
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar instâncias órfãs (qrcode há mais de 1 hora)
SELECT 
    instance_name,
    status,
    created_at,
    EXTRACT(EPOCH FROM (NOW() - created_at))/3600 as hours_old
FROM public.whatsapp_instances 
WHERE status = 'qrcode' 
    AND created_at < NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- 2. Deletar instâncias órfãs (qrcode há mais de 1 hora)
DELETE FROM public.whatsapp_instances 
WHERE status = 'qrcode' 
    AND created_at < NOW() - INTERVAL '1 hour';

-- 3. Verificar instâncias desconectadas há mais de 24 horas
SELECT 
    instance_name,
    status,
    last_connection_at,
    created_at,
    EXTRACT(EPOCH FROM (NOW() - COALESCE(last_connection_at, created_at)))/3600 as hours_since_last_activity
FROM public.whatsapp_instances 
WHERE status = 'disconnected' 
    AND COALESCE(last_connection_at, created_at) < NOW() - INTERVAL '24 hours'
ORDER BY COALESCE(last_connection_at, created_at) DESC;

-- 4. Deletar instâncias desconectadas há mais de 24 horas
DELETE FROM public.whatsapp_instances 
WHERE status = 'disconnected' 
    AND COALESCE(last_connection_at, created_at) < NOW() - INTERVAL '24 hours';

-- 5. Verificar status final
SELECT 
    status,
    COUNT(*) as count
FROM public.whatsapp_instances 
GROUP BY status
ORDER BY status;

-- 6. Verificar instâncias ativas por usuário
SELECT 
    user_id,
    COUNT(*) as total_instances,
    COUNT(CASE WHEN status = 'connected' THEN 1 END) as connected_instances,
    COUNT(CASE WHEN status = 'qrcode' THEN 1 END) as qrcode_instances,
    COUNT(CASE WHEN status = 'disconnected' THEN 1 END) as disconnected_instances
FROM public.whatsapp_instances 
GROUP BY user_id
ORDER BY total_instances DESC;


















