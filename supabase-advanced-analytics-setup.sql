-- Script para criar tabelas avançadas de analytics e tracking
-- Execute este script no SQL Editor do Supabase

-- ==============================================
-- TABELA: whatsapp_responses (Tracking de Respostas)
-- ==============================================
CREATE TABLE IF NOT EXISTS whatsapp_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES bulk_campaigns(id) ON DELETE CASCADE NOT NULL,
  lead_phone VARCHAR(20) NOT NULL,
  lead_name VARCHAR(255),
  response_type VARCHAR(20) NOT NULL CHECK (response_type IN ('positive', 'negative', 'neutral', 'question', 'unsubscribe')),
  response_text TEXT,
  response_time INTEGER, -- segundos para responder
  message_id VARCHAR(255), -- ID da mensagem original
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints para evitar duplicatas
  UNIQUE(campaign_id, lead_phone, message_id)
);

-- ==============================================
-- TABELA: sales_conversions (Tracking de Vendas)
-- ==============================================
CREATE TABLE IF NOT EXISTS sales_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES bulk_campaigns(id) ON DELETE CASCADE NOT NULL,
  lead_phone VARCHAR(20) NOT NULL,
  lead_name VARCHAR(255),
  sale_value DECIMAL(10,2) NOT NULL,
  sale_currency VARCHAR(3) DEFAULT 'BRL',
  sale_date TIMESTAMP WITH TIME ZONE NOT NULL,
  product_service VARCHAR(255),
  conversion_source VARCHAR(50) DEFAULT 'whatsapp', -- whatsapp, phone, email, etc
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ==============================================
-- TABELA: message_templates (Templates de Mensagem)
-- ==============================================
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  category VARCHAR(50) DEFAULT 'general', -- general, promotion, follow_up, etc
  performance_score DECIMAL(5,2) DEFAULT 0.0, -- 0-100
  total_sent INTEGER DEFAULT 0,
  total_responses INTEGER DEFAULT 0,
  response_rate DECIMAL(5,2) DEFAULT 0.0,
  conversion_rate DECIMAL(5,2) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ==============================================
-- TABELA: lead_quality_scores (Score de Qualidade dos Leads)
-- ==============================================
CREATE TABLE IF NOT EXISTS lead_quality_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id VARCHAR(255) NOT NULL, -- ID do lead dentro do JSON
  list_id UUID REFERENCES lead_lists(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quality_score DECIMAL(5,2) NOT NULL, -- 0-100
  conversion_probability DECIMAL(5,2) DEFAULT 0.0, -- 0-100
  factors JSONB NOT NULL DEFAULT '{}', -- fatores que influenciaram o score
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  UNIQUE(lead_id, list_id, user_id)
);

-- ==============================================
-- TABELA: analytics_insights (Sistema de Alertas e Insights)
-- ==============================================
CREATE TABLE IF NOT EXISTS analytics_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  insight_type VARCHAR(50) NOT NULL, -- performance_alert, trend_analysis, recommendation
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  data JSONB DEFAULT '{}', -- dados específicos do insight
  is_read BOOLEAN DEFAULT false,
  is_actionable BOOLEAN DEFAULT true,
  action_url VARCHAR(500), -- URL para ação recomendada
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ==============================================
-- TABELA: campaign_performance_metrics (Métricas Detalhadas)
-- ==============================================
CREATE TABLE IF NOT EXISTS campaign_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES bulk_campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- delivery_rate, response_rate, conversion_rate, etc
  metric_value DECIMAL(10,4) NOT NULL,
  metric_period VARCHAR(20) DEFAULT 'total', -- total, hourly, daily, weekly
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  additional_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ==============================================
-- ÍNDICES PARA PERFORMANCE
-- ==============================================

-- whatsapp_responses
CREATE INDEX IF NOT EXISTS idx_whatsapp_responses_campaign_id ON whatsapp_responses(campaign_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_responses_user_id ON whatsapp_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_responses_created_at ON whatsapp_responses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_responses_response_type ON whatsapp_responses(response_type);

-- sales_conversions
CREATE INDEX IF NOT EXISTS idx_sales_conversions_campaign_id ON sales_conversions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_sales_conversions_user_id ON sales_conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_conversions_sale_date ON sales_conversions(sale_date DESC);

-- message_templates
CREATE INDEX IF NOT EXISTS idx_message_templates_user_id ON message_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_performance_score ON message_templates(performance_score DESC);

-- lead_quality_scores
CREATE INDEX IF NOT EXISTS idx_lead_quality_scores_user_id ON lead_quality_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_quality_scores_quality_score ON lead_quality_scores(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_lead_quality_scores_list_id ON lead_quality_scores(list_id);

-- analytics_insights
CREATE INDEX IF NOT EXISTS idx_analytics_insights_user_id ON analytics_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_insights_created_at ON analytics_insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_insights_is_read ON analytics_insights(is_read);
CREATE INDEX IF NOT EXISTS idx_analytics_insights_insight_type ON analytics_insights(insight_type);

-- campaign_performance_metrics
CREATE INDEX IF NOT EXISTS idx_campaign_performance_metrics_campaign_id ON campaign_performance_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_performance_metrics_user_id ON campaign_performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_performance_metrics_metric_type ON campaign_performance_metrics(metric_type);

-- ==============================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================

-- whatsapp_responses
ALTER TABLE whatsapp_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own responses" ON whatsapp_responses;
DROP POLICY IF EXISTS "Users can insert own responses" ON whatsapp_responses;
CREATE POLICY "Users can view own responses" ON whatsapp_responses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own responses" ON whatsapp_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- sales_conversions
ALTER TABLE sales_conversions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own conversions" ON sales_conversions;
DROP POLICY IF EXISTS "Users can insert own conversions" ON sales_conversions;
CREATE POLICY "Users can view own conversions" ON sales_conversions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversions" ON sales_conversions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- message_templates
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own templates" ON message_templates;
CREATE POLICY "Users can manage own templates" ON message_templates
  FOR ALL USING (auth.uid() = user_id);

-- lead_quality_scores
ALTER TABLE lead_quality_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own quality scores" ON lead_quality_scores;
DROP POLICY IF EXISTS "Users can insert own quality scores" ON lead_quality_scores;
CREATE POLICY "Users can view own quality scores" ON lead_quality_scores
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quality scores" ON lead_quality_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- analytics_insights
ALTER TABLE analytics_insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own insights" ON analytics_insights;
DROP POLICY IF EXISTS "Users can update own insights" ON analytics_insights;
CREATE POLICY "Users can view own insights" ON analytics_insights
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON analytics_insights
  FOR UPDATE USING (auth.uid() = user_id);

-- campaign_performance_metrics
ALTER TABLE campaign_performance_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own metrics" ON campaign_performance_metrics;
DROP POLICY IF EXISTS "Users can insert own metrics" ON campaign_performance_metrics;
CREATE POLICY "Users can view own metrics" ON campaign_performance_metrics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own metrics" ON campaign_performance_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==============================================
-- FUNÇÕES PARA CÁLCULOS AUTOMÁTICOS
-- ==============================================

-- Função para calcular score de qualidade do lead
CREATE OR REPLACE FUNCTION calculate_lead_quality_score(
  p_rating DECIMAL,
  p_reviews_count INTEGER,
  p_has_website BOOLEAN,
  p_has_phone BOOLEAN,
  p_business_type VARCHAR
) RETURNS DECIMAL AS $$
DECLARE
  score DECIMAL := 0;
BEGIN
  -- Rating (0-40 pontos)
  IF p_rating IS NOT NULL THEN
    score := score + (p_rating * 8); -- 5.0 = 40 pontos
  END IF;
  
  -- Reviews count (0-20 pontos)
  IF p_reviews_count IS NOT NULL THEN
    IF p_reviews_count >= 100 THEN
      score := score + 20;
    ELSIF p_reviews_count >= 50 THEN
      score := score + 15;
    ELSIF p_reviews_count >= 20 THEN
      score := score + 10;
    ELSIF p_reviews_count >= 5 THEN
      score := score + 5;
    END IF;
  END IF;
  
  -- Website (0-15 pontos)
  IF p_has_website THEN
    score := score + 15;
  END IF;
  
  -- Phone (0-15 pontos)
  IF p_has_phone THEN
    score := score + 15;
  END IF;
  
  -- Business type bonus (0-10 pontos)
  IF p_business_type IN ('Restaurante', 'Clínica', 'Loja', 'Escritório') THEN
    score := score + 10;
  ELSIF p_business_type IS NOT NULL THEN
    score := score + 5;
  END IF;
  
  RETURN LEAST(score, 100); -- Máximo 100 pontos
END;
$$ LANGUAGE plpgsql;

-- Função para calcular probabilidade de conversão
CREATE OR REPLACE FUNCTION calculate_conversion_probability(
  p_quality_score DECIMAL,
  p_business_type VARCHAR,
  p_has_phone BOOLEAN
) RETURNS DECIMAL AS $$
DECLARE
  probability DECIMAL := 0;
BEGIN
  -- Base probability from quality score (0-60%)
  probability := (p_quality_score * 0.6);
  
  -- Business type multiplier
  IF p_business_type IN ('Restaurante', 'Clínica') THEN
    probability := probability * 1.2;
  ELSIF p_business_type IN ('Loja', 'Escritório') THEN
    probability := probability * 1.1;
  END IF;
  
  -- Phone bonus
  IF p_has_phone THEN
    probability := probability * 1.15;
  END IF;
  
  RETURN LEAST(probability, 100); -- Máximo 100%
END;
$$ LANGUAGE plpgsql;

-- Função para gerar insights automáticos
CREATE OR REPLACE FUNCTION generate_analytics_insights(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  insight_record RECORD;
  total_campaigns INTEGER;
  avg_conversion_rate DECIMAL;
  best_performing_category VARCHAR;
  worst_performing_category VARCHAR;
BEGIN
  -- Limpar insights antigos (mais de 30 dias)
  DELETE FROM analytics_insights 
  WHERE user_id = p_user_id 
  AND created_at < NOW() - INTERVAL '30 days';
  
  -- Insight: Performance geral
  SELECT COUNT(*) INTO total_campaigns
  FROM bulk_campaigns 
  WHERE user_id = p_user_id 
  AND created_at > NOW() - INTERVAL '30 days';
  
  IF total_campaigns > 0 THEN
    SELECT AVG(
      CASE 
        WHEN (success_count + failed_count) > 0 
        THEN (success_count::DECIMAL / (success_count + failed_count)) * 100 
        ELSE 0 
      END
    ) INTO avg_conversion_rate
    FROM bulk_campaigns 
    WHERE user_id = p_user_id 
    AND created_at > NOW() - INTERVAL '30 days';
    
    IF avg_conversion_rate < 70 THEN
      INSERT INTO analytics_insights (user_id, insight_type, title, description, severity, is_actionable)
      VALUES (
        p_user_id,
        'performance_alert',
        'Taxa de Entrega Baixa',
        'Sua taxa de entrega está em ' || ROUND(avg_conversion_rate, 1) || '%. Considere verificar a qualidade dos números de telefone.',
        'warning',
        true
      );
    END IF;
  END IF;
  
  -- Insight: Categoria com melhor performance
  SELECT business_type INTO best_performing_category
  FROM (
    SELECT 
      lead_data->>'business_type' as business_type,
      COUNT(*) as count
    FROM lead_lists ll,
    LATERAL jsonb_array_elements(ll.leads) as lead_data
    WHERE ll.user_id = p_user_id
    AND lead_data->>'business_type' IS NOT NULL
    GROUP BY lead_data->>'business_type'
    ORDER BY count DESC
    LIMIT 1
  ) subq;
  
  IF best_performing_category IS NOT NULL THEN
    INSERT INTO analytics_insights (user_id, insight_type, title, description, severity, is_actionable)
    VALUES (
      p_user_id,
      'trend_analysis',
      'Categoria em Destaque',
      'Seus leads de "' || best_performing_category || '" representam a maior parte do seu banco. Considere focar nesta categoria.',
      'info',
      true
    );
  END IF;
  
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- ==============================================

-- Trigger para atualizar updated_at em message_templates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_message_templates_updated_at ON message_templates;
CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON message_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para gerar insights quando campanha é concluída
CREATE OR REPLACE FUNCTION trigger_analytics_insights()
RETURNS TRIGGER AS $$
BEGIN
  -- Gerar insights quando campanha é marcada como concluída
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    PERFORM generate_analytics_insights(NEW.user_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_campaign_analytics_insights ON bulk_campaigns;
CREATE TRIGGER trigger_campaign_analytics_insights
  AFTER UPDATE ON bulk_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION trigger_analytics_insights();

-- ==============================================
-- VIEWS PARA CONSULTAS OTIMIZADAS
-- ==============================================

-- View para métricas consolidadas de campanhas
CREATE OR REPLACE VIEW campaign_metrics_summary AS
SELECT 
  bc.id as campaign_id,
  bc.user_id,
  bc.name as campaign_name,
  bc.created_at,
  bc.status,
  bc.success_count,
  bc.failed_count,
  (bc.success_count + bc.failed_count) as total_attempts,
  CASE 
    WHEN (bc.success_count + bc.failed_count) > 0 
    THEN ROUND((bc.success_count::DECIMAL / (bc.success_count + bc.failed_count)) * 100, 2)
    ELSE 0 
  END as delivery_rate,
  COUNT(wr.id) as total_responses,
  COUNT(CASE WHEN wr.response_type = 'positive' THEN 1 END) as positive_responses,
  COUNT(CASE WHEN wr.response_type = 'negative' THEN 1 END) as negative_responses,
  CASE 
    WHEN bc.success_count > 0 
    THEN ROUND((COUNT(wr.id)::DECIMAL / bc.success_count) * 100, 2)
    ELSE 0 
  END as response_rate,
  COALESCE(SUM(sc.sale_value), 0) as total_sales,
  COUNT(sc.id) as total_conversions,
  CASE 
    WHEN bc.success_count > 0 
    THEN ROUND((COUNT(sc.id)::DECIMAL / bc.success_count) * 100, 2)
    ELSE 0 
  END as conversion_rate
FROM bulk_campaigns bc
LEFT JOIN whatsapp_responses wr ON bc.id = wr.campaign_id
LEFT JOIN sales_conversions sc ON bc.id = sc.campaign_id
GROUP BY bc.id, bc.user_id, bc.name, bc.created_at, bc.status, bc.success_count, bc.failed_count;

-- View para performance por categoria
CREATE OR REPLACE VIEW category_performance AS
SELECT 
  ll.user_id,
  lead_data->>'business_type' as category,
  COUNT(*) as total_leads,
  AVG((lead_data->>'rating')::DECIMAL) as avg_rating,
  COUNT(CASE WHEN lead_data->>'website' IS NOT NULL THEN 1 END) as leads_with_website,
  COUNT(CASE WHEN lead_data->>'phone' IS NOT NULL THEN 1 END) as leads_with_phone
FROM lead_lists ll,
LATERAL jsonb_array_elements(ll.leads) as lead_data
WHERE lead_data->>'business_type' IS NOT NULL
GROUP BY ll.user_id, lead_data->>'business_type';

-- ==============================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ==============================================

COMMENT ON TABLE whatsapp_responses IS 'Tracking de respostas recebidas via WhatsApp';
COMMENT ON TABLE sales_conversions IS 'Tracking de vendas geradas pelas campanhas';
COMMENT ON TABLE message_templates IS 'Templates de mensagem com métricas de performance';
COMMENT ON TABLE lead_quality_scores IS 'Scores de qualidade calculados para cada lead';
COMMENT ON TABLE analytics_insights IS 'Sistema de insights e alertas automáticos';
COMMENT ON TABLE campaign_performance_metrics IS 'Métricas detalhadas de performance das campanhas';

COMMENT ON FUNCTION calculate_lead_quality_score IS 'Calcula score de qualidade (0-100) baseado em rating, reviews, website, telefone e tipo de negócio';
COMMENT ON FUNCTION calculate_conversion_probability IS 'Calcula probabilidade de conversão baseada no score de qualidade e outros fatores';
COMMENT ON FUNCTION generate_analytics_insights IS 'Gera insights automáticos baseados na performance do usuário';
