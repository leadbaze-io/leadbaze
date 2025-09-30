-- =====================================================
-- CORREÇÃO DA CONSTRAINT DE STATUS DA TABELA CAMPAIGNS
-- =====================================================
-- Este script corrige a constraint para aceitar o status 'sending'

-- 1. Remover a constraint antiga
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;

-- 2. Adicionar a nova constraint com todos os status necessários
ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check 
CHECK (status IN ('draft', 'active', 'sending', 'completed', 'failed', 'paused'));

-- 3. Verificar se a constraint foi aplicada corretamente
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'campaigns_status_check';

-- 4. Verificar a estrutura atual da tabela
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'campaigns' 
AND column_name = 'status';

-- 5. Testar inserção com status 'sending' (opcional - descomente para testar)
-- INSERT INTO campaigns (user_id, name, message, status) 
-- VALUES (auth.uid(), 'Teste Status', 'Mensagem teste', 'sending');

-- 6. Verificar se a inserção funcionou (opcional - descomente para testar)
-- SELECT id, name, status FROM campaigns WHERE name = 'Teste Status';

-- 7. Limpar teste (opcional - descomente para testar)
-- DELETE FROM campaigns WHERE name = 'Teste Status';
