-- Script para corrigir políticas RLS duplicadas
-- Execute este script no SQL Editor do Supabase

-- ==============================================
-- REMOVER POLÍTICAS EXISTENTES (SE EXISTIREM)
-- ==============================================

-- whatsapp_responses
DROP POLICY IF EXISTS "Users can view own responses" ON whatsapp_responses;
DROP POLICY IF EXISTS "Users can insert own responses" ON whatsapp_responses;

-- sales_conversions
DROP POLICY IF EXISTS "Users can view own conversions" ON sales_conversions;
DROP POLICY IF EXISTS "Users can insert own conversions" ON sales_conversions;

-- message_templates
DROP POLICY IF EXISTS "Users can manage own templates" ON message_templates;

-- lead_quality_scores
DROP POLICY IF EXISTS "Users can view own quality scores" ON lead_quality_scores;
DROP POLICY IF EXISTS "Users can insert own quality scores" ON lead_quality_scores;

-- analytics_insights
DROP POLICY IF EXISTS "Users can view own insights" ON analytics_insights;
DROP POLICY IF EXISTS "Users can update own insights" ON analytics_insights;

-- campaign_performance_metrics
DROP POLICY IF EXISTS "Users can view own metrics" ON campaign_performance_metrics;
DROP POLICY IF EXISTS "Users can insert own metrics" ON campaign_performance_metrics;

-- ==============================================
-- RECRIAR POLÍTICAS RLS
-- ==============================================

-- whatsapp_responses
CREATE POLICY "Users can view own responses" ON whatsapp_responses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own responses" ON whatsapp_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- sales_conversions
CREATE POLICY "Users can view own conversions" ON sales_conversions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversions" ON sales_conversions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- message_templates
CREATE POLICY "Users can manage own templates" ON message_templates
  FOR ALL USING (auth.uid() = user_id);

-- lead_quality_scores
CREATE POLICY "Users can view own quality scores" ON lead_quality_scores
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quality scores" ON lead_quality_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- analytics_insights
CREATE POLICY "Users can view own insights" ON analytics_insights
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON analytics_insights
  FOR UPDATE USING (auth.uid() = user_id);

-- campaign_performance_metrics
CREATE POLICY "Users can view own metrics" ON campaign_performance_metrics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own metrics" ON campaign_performance_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==============================================
-- VERIFICAÇÃO
-- ==============================================

-- Verificar se as políticas foram criadas corretamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
  'whatsapp_responses', 
  'sales_conversions', 
  'message_templates', 
  'lead_quality_scores', 
  'analytics_insights', 
  'campaign_performance_metrics'
)
ORDER BY tablename, policyname;


























