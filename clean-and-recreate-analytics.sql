-- Script para limpar e recriar completamente o sistema de Analytics
-- Execute este script no SQL Editor do Supabase

-- ==============================================
-- LIMPEZA COMPLETA
-- ==============================================

-- Remover triggers
DROP TRIGGER IF EXISTS update_message_templates_updated_at ON message_templates;
DROP TRIGGER IF EXISTS trigger_campaign_analytics_insights ON bulk_campaigns;

-- Remover funções específicas do analytics (não remover update_updated_at_column pois é usada por outras tabelas)
DROP FUNCTION IF EXISTS trigger_analytics_insights();
DROP FUNCTION IF EXISTS calculate_lead_quality_score(DECIMAL, INTEGER, BOOLEAN, BOOLEAN, VARCHAR);
DROP FUNCTION IF EXISTS calculate_conversion_probability(DECIMAL, VARCHAR, BOOLEAN);
DROP FUNCTION IF EXISTS generate_analytics_insights(UUID);

-- Remover views
DROP VIEW IF EXISTS campaign_metrics_summary;
DROP VIEW IF EXISTS category_performance;

-- Remover políticas RLS
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

-- Remover índices
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

-- Remover tabelas (CUIDADO: Isso apagará todos os dados!)
-- Descomente apenas se quiser remover completamente os dados
-- DROP TABLE IF EXISTS campaign_performance_metrics CASCADE;
-- DROP TABLE IF EXISTS analytics_insights CASCADE;
-- DROP TABLE IF EXISTS lead_quality_scores CASCADE;
-- DROP TABLE IF EXISTS message_templates CASCADE;
-- DROP TABLE IF EXISTS sales_conversions CASCADE;
-- DROP TABLE IF EXISTS whatsapp_responses CASCADE;

-- ==============================================
-- MENSAGEM DE CONFIRMAÇÃO
-- ==============================================

SELECT 
  '🧹 LIMPEZA COMPLETA REALIZADA' as status,
  'Agora execute o script supabase-advanced-analytics-setup.sql para recriar tudo do zero.' as proximo_passo;
