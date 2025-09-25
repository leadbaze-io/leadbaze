-- =====================================================
-- VERIFICAR E CORRIGIR CONSTRAINTS PROBLEMÁTICAS
-- =====================================================

-- 1. Verificar todas as constraints da tabela user_subscriptions
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'user_subscriptions'::regclass
ORDER BY conname;

-- 2. Verificar se existe constraint com nome similar
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname ILIKE '%unique_active_subscription%';

-- 3. Verificar índices únicos
SELECT 
  indexname as index_name,
  indexdef as index_definition
FROM pg_indexes 
WHERE tablename = 'user_subscriptions'
  AND indexdef LIKE '%UNIQUE%';

-- 4. Remover constraint problemática se existir
DO $$
BEGIN
  -- Verificar se existe constraint com nome similar
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname ILIKE '%unique_active_subscription%'
  ) THEN
    -- Listar constraints para remoção
    FOR constraint_name IN 
      SELECT conname FROM pg_constraint 
      WHERE conname ILIKE '%unique_active_subscription%'
    LOOP
      EXECUTE 'ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS ' || constraint_name;
      RAISE NOTICE 'Constraint % removida', constraint_name;
    END LOOP;
  ELSE
    RAISE NOTICE 'Nenhuma constraint problemática encontrada';
  END IF;
END $$;

-- 5. Verificar se ainda existem constraints problemáticas
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'user_subscriptions'::regclass
  AND conname ILIKE '%unique_active_subscription%';

-- 6. Verificar assinaturas ativas duplicadas
SELECT 
  user_id,
  COUNT(*) as total_subscriptions,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
  array_agg(id) as subscription_ids
FROM user_subscriptions 
GROUP BY user_id 
HAVING COUNT(CASE WHEN status = 'active' THEN 1 END) > 1;

-- 7. Se houver duplicatas, corrigir
WITH duplicate_active AS (
  SELECT user_id, COUNT(*) as count
  FROM user_subscriptions 
  WHERE status = 'active'
  GROUP BY user_id 
  HAVING COUNT(*) > 1
)
UPDATE user_subscriptions 
SET 
  status = 'cancelled',
  cancelled_at = NOW(),
  cancel_reason = 'Correção automática - assinatura duplicada',
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
    FROM user_subscriptions 
    WHERE status = 'active'
      AND user_id IN (SELECT user_id FROM duplicate_active)
  ) t 
  WHERE rn > 1
);


