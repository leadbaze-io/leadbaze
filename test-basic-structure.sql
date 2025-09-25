-- =====================================================
-- TESTE BÁSICO DA ESTRUTURA DO BANCO
-- =====================================================

-- 1. VERIFICAR SE AS TABELAS EXISTEM
-- =====================================================

SELECT 
    'Tabelas encontradas:' as status,
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'subscription_plans',
    'user_subscriptions', 
    'leads_usage_history'
)
ORDER BY table_name;

-- 2. VERIFICAR SE OS PLANOS EXISTEM
-- =====================================================

SELECT 
    'Planos encontrados:' as status,
    id,
    name,
    display_name,
    price_monthly,
    leads_limit,
    is_active
FROM subscription_plans
ORDER BY price_monthly;

-- 3. VERIFICAR SE AS FUNÇÕES EXISTEM
-- =====================================================

SELECT 
    'Funções encontradas:' as status,
    proname as function_name
FROM pg_proc 
WHERE proname IN (
    'get_user_subscription_status',
    'consume_leads',
    'get_leads_usage_history'
)
ORDER BY proname;

-- 4. VERIFICAR ASSINATURAS EXISTENTES
-- =====================================================

SELECT 
    'Assinaturas encontradas:' as status,
    us.id,
    us.user_id,
    us.status,
    us.leads_used,
    sp.display_name as plan_name,
    sp.leads_limit,
    (sp.leads_limit - us.leads_used) as leads_remaining
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
ORDER BY us.created_at DESC
LIMIT 5;

-- 5. VERIFICAR HISTÓRICO DE USO
-- =====================================================

SELECT 
    'Histórico encontrado:' as status,
    COUNT(*) as total_records,
    SUM(leads_generated) as total_leads_generated
FROM leads_usage_history;











