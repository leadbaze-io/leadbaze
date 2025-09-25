-- =====================================================
-- TESTE COMPLETO DO SISTEMA DE CONTROLE DE LEADS
-- =====================================================

-- 1. VERIFICAR ESTRUTURA DO BANCO DE DADOS
-- =====================================================

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

-- Verificar estrutura da tabela subscription_plans
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'subscription_plans' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela user_subscriptions
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela leads_usage_history
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'leads_usage_history' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR FUNÇÕES RPC
-- =====================================================

-- Verificar se as funções RPC existem
SELECT 
    proname as function_name,
    proargnames as parameter_names,
    proargtypes::regtype[] as parameter_types
FROM pg_proc 
WHERE proname IN (
    'get_user_subscription_status',
    'consume_leads',
    'get_leads_usage_history'
)
ORDER BY proname;

-- 3. VERIFICAR DADOS EXISTENTES
-- =====================================================

-- Verificar planos disponíveis
SELECT 
    id,
    name,
    display_name,
    price_monthly,
    leads_limit,
    features,
    is_active,
    created_at
FROM subscription_plans
ORDER BY price_monthly;

-- Verificar assinaturas ativas
SELECT 
    us.id,
    us.user_id,
    us.plan_id,
    sp.display_name as plan_name,
    sp.leads_limit,
    us.leads_used,
    us.status,
    us.current_period_start,
    us.current_period_end,
    us.created_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status = 'active'
ORDER BY us.created_at DESC;

-- Verificar histórico de uso de leads
SELECT 
    luh.id,
    luh.user_id,
    luh.leads_generated,
    luh.operation_type,
    luh.operation_reason,
    luh.remaining_leads,
    luh.created_at
FROM leads_usage_history luh
ORDER BY luh.created_at DESC
LIMIT 10;

-- 4. TESTAR FUNÇÕES RPC
-- =====================================================

-- Testar get_user_subscription_status para um usuário específico
-- Substitua 'USER_ID_AQUI' pelo ID real do usuário
SELECT * FROM get_user_subscription_status('USER_ID_AQUI');

-- Testar consume_leads (simular consumo de 5 leads)
-- Substitua 'USER_ID_AQUI' pelo ID real do usuário
SELECT * FROM consume_leads('USER_ID_AQUI', 5, 'teste_sistema');

-- Testar get_leads_usage_history
-- Substitua 'USER_ID_AQUI' pelo ID real do usuário
SELECT * FROM get_leads_usage_history('USER_ID_AQUI', 30);

-- 5. VERIFICAR POLÍTICAS RLS
-- =====================================================

-- Verificar políticas RLS das tabelas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN (
    'subscription_plans',
    'user_subscriptions',
    'leads_usage_history'
)
ORDER BY tablename, policyname;

-- 6. ESTATÍSTICAS DO SISTEMA
-- =====================================================

-- Contar total de planos
SELECT 
    COUNT(*) as total_plans,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_plans
FROM subscription_plans;

-- Contar total de assinaturas
SELECT 
    COUNT(*) as total_subscriptions,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
    COUNT(CASE WHEN status = 'canceled' THEN 1 END) as canceled_subscriptions
FROM user_subscriptions;

-- Contar total de consumo de leads
SELECT 
    COUNT(*) as total_consumption_records,
    SUM(leads_generated) as total_leads_generated
FROM leads_usage_history;

-- 7. VERIFICAR USUÁRIOS COM ASSINATURA
-- =====================================================

-- Listar usuários com assinatura ativa
SELECT 
    au.email,
    sp.display_name as plan_name,
    sp.leads_limit,
    us.leads_used,
    (sp.leads_limit - us.leads_used) as remaining_leads,
    us.current_period_end
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
JOIN auth.users au ON us.user_id = au.id
WHERE us.status = 'active'
ORDER BY us.created_at DESC;
