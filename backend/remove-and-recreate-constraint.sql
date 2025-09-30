-- =====================================================
-- REMOVER E RECRIAR CONSTRAINT COMPLETAMENTE
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

-- 3. Remover constraint completamente
ALTER TABLE leads_usage_history 
DROP CONSTRAINT IF EXISTS leads_usage_history_operation_type_check;

-- 4. Verificar se foi removida
SELECT EXISTS (
  SELECT 1 FROM pg_constraint 
  WHERE conname = 'leads_usage_history_operation_type_check'
) as constraint_exists_after_drop;

-- 5. Recriar constraint com todos os valores necessários
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

-- 6. Verificar se foi criada
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'leads_usage_history_operation_type_check';

-- 7. Testar inserção com 'generated'
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
  'generated',
  'Teste de constraint com generated',
  100
);

-- 8. Testar inserção com 'subscription_cancelled'
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
  'Teste de constraint com subscription_cancelled',
  100
);

-- 9. Limpar os testes
DELETE FROM leads_usage_history 
WHERE operation_reason LIKE 'Teste de constraint%';

-- 10. Verificar se funcionou
SELECT 'Constraint recriada com sucesso!' as status;


