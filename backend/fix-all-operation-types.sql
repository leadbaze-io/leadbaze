-- =====================================================
-- CORRIGIR TODOS OS OPERATION_TYPES PROBLEMÁTICOS
-- =====================================================

-- 1. Verificar constraint atual
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname LIKE '%operation_type%';

-- 2. Verificar todos os valores únicos na tabela
SELECT DISTINCT operation_type, COUNT(*) as count
FROM leads_usage_history 
GROUP BY operation_type
ORDER BY operation_type;

-- 3. Identificar registros problemáticos
SELECT operation_type, COUNT(*) as count
FROM leads_usage_history 
WHERE operation_type NOT IN (
  'generated',
  'refund', 
  'bonus',
  'subscription_created',
  'subscription_cancelled',
  'subscription_reactivated',
  'subscription_paused',
  'subscription_expired',
  'subscription_downgraded',
  'subscription_upgraded'
)
GROUP BY operation_type;

-- 4. Remover constraint temporariamente
ALTER TABLE leads_usage_history 
DROP CONSTRAINT IF EXISTS leads_usage_history_operation_type_check;

-- 5. Atualizar todos os registros problemáticos
UPDATE leads_usage_history 
SET operation_type = 'generated'
WHERE operation_type NOT IN (
  'generated',
  'refund', 
  'bonus',
  'subscription_created',
  'subscription_cancelled',
  'subscription_reactivated',
  'subscription_paused',
  'subscription_expired',
  'subscription_downgraded',
  'subscription_upgraded'
);

-- 6. Verificar se ainda há registros problemáticos
SELECT operation_type, COUNT(*) as count
FROM leads_usage_history 
WHERE operation_type NOT IN (
  'generated',
  'refund', 
  'bonus',
  'subscription_created',
  'subscription_cancelled',
  'subscription_reactivated',
  'subscription_paused',
  'subscription_expired',
  'subscription_downgraded',
  'subscription_upgraded'
)
GROUP BY operation_type;

-- 7. Recriar constraint
ALTER TABLE leads_usage_history 
ADD CONSTRAINT leads_usage_history_operation_type_check 
CHECK (operation_type IN (
  'generated',
  'refund', 
  'bonus',
  'subscription_created',
  'subscription_cancelled',
  'subscription_reactivated',
  'subscription_paused',
  'subscription_expired',
  'subscription_downgraded',
  'subscription_upgraded'
));

-- 8. Verificar se foi criada
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'leads_usage_history_operation_type_check';

-- 9. Testar inserção
INSERT INTO leads_usage_history (
  user_id,
  subscription_id,
  leads_generated,
  operation_type,
  operation_reason,
  remaining_leads
) VALUES (
  '5069fa1e-5de4-44f8-9f45-8ef95a57f0b0'::UUID,
  (SELECT id FROM user_subscriptions WHERE user_id = '5069fa1e-5de4-44f8-9f45-8ef95a57f0b0'::UUID ORDER BY created_at DESC LIMIT 1),
  0,
  'subscription_cancelled',
  'Teste final de constraint',
  100
);

-- 10. Limpar teste
DELETE FROM leads_usage_history 
WHERE operation_reason = 'Teste final de constraint';

-- 11. Verificar valores finais
SELECT DISTINCT operation_type, COUNT(*) as count
FROM leads_usage_history 
GROUP BY operation_type
ORDER BY operation_type;

-- 12. Confirmar sucesso
SELECT 'Constraint corrigida com sucesso!' as status;


