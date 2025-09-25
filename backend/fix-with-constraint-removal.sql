-- =====================================================
-- CORREÇÃO COM REMOÇÃO TEMPORÁRIA DA CONSTRAINT
-- =====================================================

-- 1. PRIMEIRO: Verificar qual assinatura está ativa atualmente
SELECT 
    'ANTES DA CORREÇÃO' as status,
    us.id,
    us.user_id,
    us.status,
    us.recurring_status,
    us.plan_id,
    sp.display_name as plan_name,
    sp.price_monthly,
    us.leads_remaining,
    us.updated_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = '84d176eb-4f23-4a18-ac6e-6a867ca90967'
    AND us.status = 'active'
ORDER BY us.updated_at DESC;

-- 2. REMOVER TEMPORARIAMENTE A CONSTRAINT
ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS unique_active_subscription_per_user;

-- 3. CANCELAR TODAS as assinaturas ativas
UPDATE user_subscriptions 
SET 
    status = 'cancelled',
    recurring_status = 'cancelled',
    cancel_reason = 'Cancelado para correção - ativando plano pago',
    cancelled_at = NOW(),
    updated_at = NOW()
WHERE user_id = '84d176eb-4f23-4a18-ac6e-6a867ca90967' 
    AND status = 'active';

-- 4. ATIVAR a assinatura PENDENTE do Plano Scale
UPDATE user_subscriptions 
SET 
    status = 'active',
    recurring_status = 'active',
    updated_at = NOW()
WHERE user_id = '84d176eb-4f23-4a18-ac6e-6a867ca90967' 
    AND id = 'b6356761-de55-41a2-837f-d71c400c8d73' -- Plano Scale pendente
    AND status = 'pending';

-- 5. CANCELAR todas as outras assinaturas pendentes duplicadas
UPDATE user_subscriptions 
SET 
    status = 'cancelled',
    recurring_status = 'cancelled',
    cancel_reason = 'Cancelado automaticamente - assinatura duplicada',
    cancelled_at = NOW(),
    updated_at = NOW()
WHERE user_id = '84d176eb-4f23-4a18-ac6e-6a867ca90967' 
    AND status = 'pending'
    AND id != 'b6356761-de55-41a2-837f-d71c400c8d73';

-- 6. RECRIAR A CONSTRAINT
ALTER TABLE user_subscriptions 
ADD CONSTRAINT unique_active_subscription_per_user 
UNIQUE (user_id) 
WHERE status = 'active';

-- 7. VERIFICAR RESULTADO FINAL
SELECT 
    'APÓS CORREÇÃO COMPLETA' as status,
    us.id,
    us.user_id,
    us.status,
    us.recurring_status,
    us.plan_id,
    sp.display_name as plan_name,
    sp.price_monthly,
    us.leads_used,
    us.leads_remaining,
    us.updated_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = '84d176eb-4f23-4a18-ac6e-6a867ca90967'
    AND us.status = 'active'
ORDER BY us.updated_at DESC;

-- 8. TESTAR A FUNÇÃO
SELECT 
    'FUNÇÃO TESTE FINAL' as status,
    get_user_subscription_with_free_trial('84d176eb-4f23-4a18-ac6e-6a867ca90967') as result;

