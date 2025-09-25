-- =====================================================
-- CORRIGIR CONSTRAINT UNIQUE_ACTIVE_SUBSCRIPTION_PER_USER
-- =====================================================
-- Este script corrige o problema de constraint que impede reativação

-- 1. Verificar constraint atual
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname LIKE '%unique_active_subscription%';

-- 2. Remover constraint problemática se existir
DO $$
BEGIN
  -- Verificar se a constraint existe
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_active_subscription_per_user'
  ) THEN
    -- Remover constraint
    ALTER TABLE user_subscriptions 
    DROP CONSTRAINT IF EXISTS unique_active_subscription_per_user;
    
    RAISE NOTICE 'Constraint unique_active_subscription_per_user removida';
  ELSE
    RAISE NOTICE 'Constraint unique_active_subscription_per_user não encontrada';
  END IF;
END $$;

-- 3. Verificar se existe constraint similar
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'user_subscriptions'::regclass
  AND contype = 'u';

-- 4. Criar nova constraint mais específica (apenas para status = 'active')
ALTER TABLE user_subscriptions 
ADD CONSTRAINT unique_active_subscription_per_user 
UNIQUE (user_id) 
WHERE status = 'active';

-- 5. Verificar se a nova constraint foi criada
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'unique_active_subscription_per_user';

-- 6. Testar se a constraint funciona corretamente
-- (Isso deve falhar se tentarmos inserir duas assinaturas ativas para o mesmo usuário)
DO $$
DECLARE
  test_user_id UUID := '00000000-0000-0000-0000-000000000000';
  test_plan_id UUID;
BEGIN
  -- Buscar um plano para teste
  SELECT id INTO test_plan_id FROM subscription_plans LIMIT 1;
  
  IF test_plan_id IS NOT NULL THEN
    -- Tentar inserir duas assinaturas ativas para o mesmo usuário
    -- (Isso deve falhar devido à constraint)
    BEGIN
      INSERT INTO user_subscriptions (user_id, plan_id, status, billing_cycle, leads_remaining)
      VALUES (test_user_id, test_plan_id, 'active', 'monthly', 100);
      
      INSERT INTO user_subscriptions (user_id, plan_id, status, billing_cycle, leads_remaining)
      VALUES (test_user_id, test_plan_id, 'active', 'monthly', 100);
      
      RAISE NOTICE 'ERRO: Duas assinaturas ativas foram inseridas (constraint não funcionou)';
      
      -- Limpar dados de teste
      DELETE FROM user_subscriptions WHERE user_id = test_user_id;
      
    EXCEPTION
      WHEN unique_violation THEN
        RAISE NOTICE 'SUCESSO: Constraint funcionando corretamente - impediu inserção duplicada';
        -- Limpar dados de teste
        DELETE FROM user_subscriptions WHERE user_id = test_user_id;
    END;
  END IF;
END $$;

-- 7. Verificar assinaturas duplicadas existentes
SELECT 
  user_id,
  COUNT(*) as total_subscriptions,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions
FROM user_subscriptions 
GROUP BY user_id 
HAVING COUNT(CASE WHEN status = 'active' THEN 1 END) > 1;

-- 8. Se houver duplicatas, corrigir
UPDATE user_subscriptions 
SET status = 'cancelled', 
    cancelled_at = NOW(),
    cancel_reason = 'Correção automática - assinatura duplicada'
WHERE id IN (
  SELECT id FROM (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
    FROM user_subscriptions 
    WHERE status = 'active'
  ) t 
  WHERE rn > 1
);


