-- CORRIGIR PROBLEMA DE CONSTRAINT UNIQUE_ACTIVE_SUBSCRIPTION

-- 1. VERIFICAR O PROBLEMA ATUAL
SELECT 
  'PROBLEMA IDENTIFICADO' as status,
  user_id,
  us.status,
  COUNT(*) as count
FROM user_subscriptions us
WHERE us.user_id = '5069fa1e-5de4-44f8-9f45-8ef95a57f0b0'
GROUP BY user_id, us.status
ORDER BY us.status;

-- 2. REMOVER A CONSTRAINT PROBLEMÁTICA
ALTER TABLE user_subscriptions 
DROP CONSTRAINT IF EXISTS unique_active_subscription;

-- 3. CRIAR UMA CONSTRAINT MAIS FLEXÍVEL
-- Permitir múltiplas assinaturas canceladas, mas apenas uma ativa por usuário
CREATE UNIQUE INDEX unique_active_subscription_per_user 
ON user_subscriptions (user_id) 
WHERE status = 'active';

-- 4. LIMPAR ASSINATURAS DUPLICADAS CANCELADAS
-- Manter apenas a mais recente de cada status
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, status 
      ORDER BY created_at DESC
    ) as rn
  FROM user_subscriptions 
  WHERE user_id = '5069fa1e-5de4-44f8-9f45-8ef95a57f0b0'
    AND status = 'cancelled'
)
DELETE FROM user_subscriptions 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 5. VERIFICAR SE O PROBLEMA FOI RESOLVIDO
SELECT 
  'APÓS CORREÇÃO' as status,
  us.user_id,
  us.status,
  COUNT(*) as count
FROM user_subscriptions us
WHERE us.user_id = '5069fa1e-5de4-44f8-9f45-8ef95a57f0b0'
GROUP BY us.user_id, us.status
ORDER BY us.status;

-- 6. TESTAR A FUNÇÃO DE CANCELAMENTO
SELECT cancel_user_subscription(
  '5069fa1e-5de4-44f8-9f45-8ef95a57f0b0'::UUID,
  'Teste após correção da constraint'::TEXT
) as function_result;
