-- =====================================================
-- VERIFICAR E CORRIGIR CONSTRAINT DE STATUS
-- =====================================================

-- 1. Verificar constraints existentes na tabela campaigns
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'campaigns'::regclass
AND contype = 'c';

-- 2. Se a constraint campaigns_status_check existir, removê-la
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;

-- 3. Adicionar a nova constraint com todos os status necessários
ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check 
CHECK (status IN ('draft', 'active', 'sending', 'completed', 'failed', 'paused'));

-- 4. Verificar se a nova constraint foi aplicada
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'campaigns_status_check';

-- 5. Verificar se a constraint permite status 'sending' (sem inserir dados)
-- A constraint foi aplicada com sucesso se não houve erro na etapa 3

-- 6. Verificar se existem campanhas com status 'sending' (opcional)
SELECT COUNT(*) as campanhas_sending
FROM campaigns 
WHERE status = 'sending';

-- 7. Mostrar todos os status únicos existentes na tabela
SELECT DISTINCT status, COUNT(*) as quantidade
FROM campaigns 
GROUP BY status
ORDER BY status;
