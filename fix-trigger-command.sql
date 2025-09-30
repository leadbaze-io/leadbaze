-- COMANDO CORRIGIDO PARA CRIAR TRIGGER UPDATED_AT
-- Execute este script no SQL Editor do Supabase

-- Criar ou substituir a função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Remover o trigger existente (se existir) e criar novamente
DROP TRIGGER IF EXISTS update_lead_lists_updated_at ON lead_lists;

CREATE TRIGGER update_lead_lists_updated_at 
  BEFORE UPDATE ON lead_lists 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verificar se o trigger foi criado corretamente
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'update_lead_lists_updated_at';











































