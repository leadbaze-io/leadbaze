-- =====================================================
-- VERIFICAR FUNÇÕES RPC EXISTENTES
-- =====================================================

-- Verificar se as funções RPC existem
SELECT 
    proname as function_name,
    proargnames as parameter_names,
    proargtypes::regtype[] as parameter_types,
    prorettype::regtype as return_type
FROM pg_proc 
WHERE proname IN (
    'get_user_subscription_status',
    'consume_leads',
    'get_leads_usage_history'
)
ORDER BY proname;

-- Verificar se as tabelas existem
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'subscription_plans',
    'user_subscriptions', 
    'leads_usage_history'
)
ORDER BY table_name;

-- Verificar estrutura das tabelas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN (
    'subscription_plans',
    'user_subscriptions', 
    'leads_usage_history'
)
ORDER BY table_name, ordinal_position;











