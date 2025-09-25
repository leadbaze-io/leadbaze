-- =====================================================
-- CORRIGIR CONSTRAINT DE OPERATION_TYPE
-- =====================================================

-- 1. Verificar constraint atual
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname LIKE '%operation_type%';

-- 2. Verificar valores únicos na tabela
SELECT DISTINCT operation_type 
FROM leads_usage_history 
ORDER BY operation_type;

-- 3. Atualizar constraint para incluir 'subscription_cancelled'
ALTER TABLE leads_usage_history 
DROP CONSTRAINT IF EXISTS leads_usage_history_operation_type_check;

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

-- 4. Verificar se a constraint foi aplicada
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'leads_usage_history_operation_type_check';

-- 5. Testar inserção com o novo valor
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
  'Teste de constraint',
  100
);

-- 6. Limpar o teste
DELETE FROM leads_usage_history 
WHERE operation_reason = 'Teste de constraint';

-- 7. Verificar se funcionou
SELECT 'Constraint atualizada com sucesso!' as status;


