-- Script para verificar o status atual da instância WhatsApp
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar status atual da instância específica
SELECT 
    instance_name,
    status,
    whatsapp_number,
    last_connection_at,
    created_at,
    updated_at,
    EXTRACT(EPOCH FROM (NOW() - updated_at))/60 as minutes_since_update,
    EXTRACT(EPOCH FROM (NOW() - COALESCE(last_connection_at, created_at)))/60 as minutes_since_last_activity
FROM public.whatsapp_instances 
WHERE instance_name = 'creaty12345gmailcom_1757520131352_4wf836'
ORDER BY updated_at DESC;

-- 2. Verificar todas as instâncias do usuário
SELECT 
    instance_name,
    status,
    whatsapp_number,
    last_connection_at,
    created_at,
    updated_at,
    EXTRACT(EPOCH FROM (NOW() - updated_at))/60 as minutes_since_update
FROM public.whatsapp_instances 
WHERE user_id = '7f90037e-5cff-4086-b6d7-4b48a796104b'
ORDER BY updated_at DESC;

-- 3. Verificar se há instâncias com status inconsistente
SELECT 
    instance_name,
    status,
    whatsapp_number,
    last_connection_at,
    updated_at,
    CASE 
        WHEN status = 'connected' AND (whatsapp_number IS NULL OR last_connection_at IS NULL) THEN 'INCONSISTENTE - Connected sem dados'
        WHEN status = 'disconnected' AND last_connection_at IS NOT NULL THEN 'INCONSISTENTE - Disconnected com dados'
        ELSE 'OK'
    END as status_check
FROM public.whatsapp_instances 
WHERE user_id = '7f90037e-5cff-4086-b6d7-4b48a796104b'
ORDER BY updated_at DESC;


















