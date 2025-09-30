-- Script para criar a tabela de campanhas em massa no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de campanhas em massa
CREATE TABLE IF NOT EXISTS bulk_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message TEXT DEFAULT '',
  selected_lists TEXT[] DEFAULT '{}',
  ignored_lists TEXT[] DEFAULT '{}',
  total_leads INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'failed')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  success_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_bulk_campaigns_user_id ON bulk_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_bulk_campaigns_status ON bulk_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_bulk_campaigns_created_at ON bulk_campaigns(created_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE bulk_campaigns ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
-- Usuários podem ver apenas suas próprias campanhas
CREATE POLICY "Users can view own campaigns" ON bulk_campaigns
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem criar campanhas para si mesmos
CREATE POLICY "Users can insert own campaigns" ON bulk_campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias campanhas
CREATE POLICY "Users can update own campaigns" ON bulk_campaigns
  FOR UPDATE USING (auth.uid() = user_id);

-- Usuários podem deletar suas próprias campanhas
CREATE POLICY "Users can delete own campaigns" ON bulk_campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_bulk_campaigns_updated_at
  BEFORE UPDATE ON bulk_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE bulk_campaigns IS 'Tabela para armazenar campanhas de disparo em massa de WhatsApp';
COMMENT ON COLUMN bulk_campaigns.id IS 'ID único da campanha';
COMMENT ON COLUMN bulk_campaigns.user_id IS 'ID do usuário que criou a campanha';
COMMENT ON COLUMN bulk_campaigns.name IS 'Nome da campanha';
COMMENT ON COLUMN bulk_campaigns.message IS 'Mensagem a ser enviada';
COMMENT ON COLUMN bulk_campaigns.selected_lists IS 'Array com IDs das listas de leads selecionadas';
COMMENT ON COLUMN bulk_campaigns.ignored_lists IS 'Array com IDs das listas de leads ignoradas (duplicadas)';
COMMENT ON COLUMN bulk_campaigns.total_leads IS 'Total de leads na campanha';
COMMENT ON COLUMN bulk_campaigns.status IS 'Status da campanha: draft, scheduled, sending, completed, failed';
COMMENT ON COLUMN bulk_campaigns.scheduled_at IS 'Data/hora agendada para envio';
COMMENT ON COLUMN bulk_campaigns.sent_at IS 'Data/hora em que foi enviada';
COMMENT ON COLUMN bulk_campaigns.completed_at IS 'Data/hora em que foi concluída';
COMMENT ON COLUMN bulk_campaigns.success_count IS 'Número de mensagens enviadas com sucesso';
COMMENT ON COLUMN bulk_campaigns.failed_count IS 'Número de mensagens que falharam';

-- Verificar se a tabela foi criada corretamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'bulk_campaigns'
ORDER BY ordinal_position; 