-- Script para verificar as tabelas existentes no Supabase
-- Execute este script primeiro para ver a estrutura atual

-- Verificar todas as tabelas existentes
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar estrutura da tabela lead_lists se existir
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'lead_lists' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela leads se existir
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'leads' 
AND table_schema = 'public'
ORDER BY ordinal_position;
