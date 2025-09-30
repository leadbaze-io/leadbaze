-- ============================================================================
-- LEADBAZE V2.0 - MIGRAÇÃO DO BANCO DE DADOS
-- Execute este script no SQL Editor do seu projeto Supabase
-- ============================================================================

-- 1. ATUALIZAÇÕES NA TABELA LEAD_LISTS EXISTENTE
-- ============================================================================
ALTER TABLE lead_lists ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
ALTER TABLE lead_lists ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE lead_lists ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE lead_lists ADD COLUMN IF NOT EXISTS description TEXT;

-- Constraint para status
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'check_status' AND table_name = 'lead_lists'
  ) THEN
    ALTER TABLE lead_lists ADD CONSTRAINT check_status 
    CHECK (status IN ('active', 'archived', 'processing'));
  END IF;
END $$;

-- 2. NOVA TABELA PARA ANALYTICS
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. NOVA TABELA PARA LOGS DO SISTEMA
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  level TEXT CHECK (level IN ('debug', 'info', 'warn', 'error')),
  message TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  session_id TEXT,
  url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. NOVA TABELA PARA TAGS PERSONALIZADAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  category TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- 5. ÍNDICES PARA PERFORMANCE
-- ============================================================================
-- Índices para analytics_events
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- Índices para lead_lists
CREATE INDEX IF NOT EXISTS idx_lead_lists_updated_at ON lead_lists(updated_at);
CREATE INDEX IF NOT EXISTS idx_lead_lists_tags ON lead_lists USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_lead_lists_status ON lead_lists(status);

-- Índices para system_logs
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);

-- Índices para user_tags
CREATE INDEX IF NOT EXISTS idx_user_tags_user_id ON user_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tags_category ON user_tags(category);

-- 6. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tags ENABLE ROW LEVEL SECURITY;

-- 7. POLÍTICAS DE SEGURANÇA
-- ============================================================================

-- Políticas para analytics_events
DROP POLICY IF EXISTS "Users can view own analytics" ON analytics_events;
CREATE POLICY "Users can view own analytics" ON analytics_events
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own analytics" ON analytics_events;
CREATE POLICY "Users can insert own analytics" ON analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para system_logs
DROP POLICY IF EXISTS "Users can view own logs" ON system_logs;
CREATE POLICY "Users can view own logs" ON system_logs
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert own logs" ON system_logs;
CREATE POLICY "Users can insert own logs" ON system_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Políticas para user_tags
DROP POLICY IF EXISTS "Users can manage own tags" ON user_tags;
CREATE POLICY "Users can manage own tags" ON user_tags
  FOR ALL USING (auth.uid() = user_id);

-- 8. TRIGGERS PARA ATUALIZAÇÕES AUTOMÁTICAS
-- ============================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para lead_lists
DROP TRIGGER IF EXISTS update_lead_lists_updated_at ON lead_lists;
CREATE TRIGGER update_lead_lists_updated_at 
  BEFORE UPDATE ON lead_lists 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. FUNÇÃO PARA LIMPEZA AUTOMÁTICA DE LOGS ANTIGOS
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
  -- Remove logs de analytics com mais de 90 dias
  DELETE FROM analytics_events 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Remove logs de sistema com mais de 30 dias (exceto errors)
  DELETE FROM system_logs 
  WHERE created_at < NOW() - INTERVAL '30 days' 
  AND level != 'error';
  
  -- Remove logs de erro com mais de 180 dias
  DELETE FROM system_logs 
  WHERE created_at < NOW() - INTERVAL '180 days' 
  AND level = 'error';
END;
$$ language 'plpgsql';

-- 10. INSERIR TAGS PADRÃO PARA USUÁRIOS EXISTENTES (OPCIONAL)
-- ============================================================================
INSERT INTO user_tags (user_id, name, color, category)
SELECT 
  id as user_id,
  'Alta Prioridade' as name,
  '#EF4444' as color,
  'Status' as category
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_tags WHERE name = 'Alta Prioridade')
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO user_tags (user_id, name, color, category)
SELECT 
  id as user_id,
  'São Paulo' as name,
  '#3B82F6' as color,
  'Localização' as category
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_tags WHERE name = 'São Paulo')
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO user_tags (user_id, name, color, category)
SELECT 
  id as user_id,
  'Restaurante' as name,
  '#F59E0B' as color,
  'Tipo de Negócio' as category
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_tags WHERE name = 'Restaurante')
ON CONFLICT (user_id, name) DO NOTHING;

-- 11. CRIAR VIEWS PARA ANALYTICS (OPCIONAL)
-- ============================================================================
CREATE OR REPLACE VIEW user_analytics_summary AS
SELECT 
  u.id as user_id,
  u.email,
  COUNT(DISTINCT ll.id) as total_lists,
  COALESCE(SUM(ll.total_leads), 0) as total_leads,
  COUNT(DISTINCT ae.id) as total_events,
  MAX(ll.created_at) as last_list_created,
  MAX(ae.created_at) as last_activity
FROM auth.users u
LEFT JOIN lead_lists ll ON u.id = ll.user_id
LEFT JOIN analytics_events ae ON u.id = ae.user_id
GROUP BY u.id, u.email;

-- Habilitar RLS na view
ALTER VIEW user_analytics_summary SET (security_invoker = on);

-- 12. CONFIGURAÇÕES FINAIS
-- ============================================================================

-- Atualizar estatísticas para melhor performance
ANALYZE lead_lists;
ANALYZE analytics_events;
ANALYZE system_logs;
ANALYZE user_tags;

-- ============================================================================
-- MIGRAÇÃO CONCLUÍDA!
-- ============================================================================

-- Para verificar se tudo foi criado corretamente, execute:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('analytics_events', 'system_logs', 'user_tags');

-- Para verificar as novas colunas em lead_lists:
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'lead_lists' 
-- AND column_name IN ('tags', 'status', 'updated_at', 'description');











































