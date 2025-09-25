-- Script para limpar APENAS os elementos do sistema de Analytics
-- Execute este script no SQL Editor do Supabase
-- Este script NÃO afeta outras funcionalidades do sistema

-- ==============================================
-- LIMPEZA ESPECÍFICA DO ANALYTICS
-- ==============================================

-- Remover apenas os triggers específicos do analytics
DROP TRIGGER IF EXISTS update_message_templates_updated_at ON message_templates;
DROP TRIGGER IF EXISTS trigger_campaign_analytics_insights ON bulk_campaigns;

-- Remover apenas as funções específicas do analytics
DROP FUNCTION IF EXISTS trigger_analytics_insights();
DROP FUNCTION IF EXISTS calculate_lead_quality_score(DECIMAL, INTEGER, BOOLEAN, BOOLEAN, VARCHAR);
DROP FUNCTION IF EXISTS calculate_conversion_probability(DECIMAL, VARCHAR, BOOLEAN);
DROP FUNCTION IF EXISTS generate_analytics_insights(UUID);

-- Remover views do analytics
DROP VIEW IF EXISTS campaign_metrics_summary;
DROP VIEW IF EXISTS category_performance;

-- Remover políticas RLS específicas do analytics
DROP POLICY IF EXISTS "Users can view own responses" ON whatsapp_responses;
DROP POLICY IF EXISTS "Users can insert own responses" ON whatsapp_responses;
DROP POLICY IF EXISTS "Users can view own conversions" ON sales_conversions;
DROP POLICY IF EXISTS "Users can insert own conversions" ON sales_conversions;
DROP POLICY IF EXISTS "Users can manage own templates" ON message_templates;
DROP POLICY IF EXISTS "Users can view own quality scores" ON lead_quality_scores;
DROP POLICY IF EXISTS "Users can insert own quality scores" ON lead_quality_scores;
DROP POLICY IF EXISTS "Users can view own insights" ON analytics_insights;
DROP POLICY IF EXISTS "Users can update own insights" ON analytics_insights;
DROP POLICY IF EXISTS "Users can view own metrics" ON campaign_performance_metrics;
DROP POLICY IF EXISTS "Users can insert own metrics" ON campaign_performance_metrics;

-- Remover índices específicos do analytics
DROP INDEX IF EXISTS idx_whatsapp_responses_campaign_id;
DROP INDEX IF EXISTS idx_whatsapp_responses_user_id;
DROP INDEX IF EXISTS idx_whatsapp_responses_created_at;
DROP INDEX IF EXISTS idx_whatsapp_responses_response_type;
DROP INDEX IF EXISTS idx_sales_conversions_campaign_id;
DROP INDEX IF EXISTS idx_sales_conversions_user_id;
DROP INDEX IF EXISTS idx_sales_conversions_sale_date;
DROP INDEX IF EXISTS idx_message_templates_user_id;
DROP INDEX IF EXISTS idx_message_templates_performance_score;
DROP INDEX IF EXISTS idx_lead_quality_scores_user_id;
DROP INDEX IF EXISTS idx_lead_quality_scores_quality_score;
DROP INDEX IF EXISTS idx_lead_quality_scores_list_id;
DROP INDEX IF EXISTS idx_analytics_insights_user_id;
DROP INDEX IF EXISTS idx_analytics_insights_created_at;
DROP INDEX IF EXISTS idx_analytics_insights_is_read;
DROP INDEX IF EXISTS idx_analytics_insights_insight_type;
DROP INDEX IF EXISTS idx_campaign_performance_metrics_campaign_id;
DROP INDEX IF EXISTS idx_campaign_performance_metrics_user_id;
DROP INDEX IF EXISTS idx_campaign_performance_metrics_metric_type;

-- ==============================================
-- OPÇÃO: REMOVER TABELAS (DESCOMENTE SE NECESSÁRIO)
-- ==============================================

-- CUIDADO: Descomente apenas se quiser remover completamente os dados do analytics
-- Isso apagará TODOS os dados das tabelas de analytics!

-- DROP TABLE IF EXISTS campaign_performance_metrics CASCADE;
-- DROP TABLE IF EXISTS analytics_insights CASCADE;
-- DROP TABLE IF EXISTS lead_quality_scores CASCADE;
-- DROP TABLE IF EXISTS message_templates CASCADE;
-- DROP TABLE IF EXISTS sales_conversions CASCADE;
-- DROP TABLE IF EXISTS whatsapp_responses CASCADE;

-- ==============================================
-- VERIFICAÇÃO
-- ==============================================

-- Verificar se as tabelas ainda existem
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      'whatsapp_responses', 
      'sales_conversions', 
      'message_templates', 
      'lead_quality_scores', 
      'analytics_insights', 
      'campaign_performance_metrics'
    ) THEN '✅ Tabela mantida'
    ELSE '❌ Tabela removida'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'whatsapp_responses', 
  'sales_conversions', 
  'message_templates', 
  'lead_quality_scores', 
  'analytics_insights', 
  'campaign_performance_metrics'
)
ORDER BY table_name;

-- ==============================================
-- MENSAGEM DE CONFIRMAÇÃO
-- ==============================================

SELECT 
  '🧹 LIMPEZA DO ANALYTICS REALIZADA' as status,
  'Agora execute o script supabase-advanced-analytics-setup.sql para recriar o sistema de analytics.' as proximo_passo,
  'Outras funcionalidades do sistema foram preservadas.' as observacao;


























