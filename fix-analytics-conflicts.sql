-- Script para corrigir apenas os conflitos do sistema de Analytics
-- Execute este script no SQL Editor do Supabase
-- Este script remove apenas os elementos que causam conflito

-- ==============================================
-- CORREÇÃO DE CONFLITOS ESPECÍFICOS
-- ==============================================

-- Remover apenas os triggers que causam conflito
DROP TRIGGER IF EXISTS update_message_templates_updated_at ON message_templates;
DROP TRIGGER IF EXISTS trigger_campaign_analytics_insights ON bulk_campaigns;

-- Remover apenas as funções específicas do analytics
DROP FUNCTION IF EXISTS trigger_analytics_insights();
DROP FUNCTION IF EXISTS calculate_lead_quality_score(DECIMAL, INTEGER, BOOLEAN, BOOLEAN, VARCHAR);
DROP FUNCTION IF EXISTS calculate_conversion_probability(DECIMAL, VARCHAR, BOOLEAN);
DROP FUNCTION IF EXISTS generate_analytics_insights(UUID);

-- Remover views que podem ter problemas
DROP VIEW IF EXISTS campaign_metrics_summary;
DROP VIEW IF EXISTS category_performance;

-- Remover políticas RLS que causam conflito
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

-- ==============================================
-- MENSAGEM DE CONFIRMAÇÃO
-- ==============================================

SELECT 
  '🔧 CONFLITOS DO ANALYTICS CORRIGIDOS' as status,
  'Agora execute o script supabase-advanced-analytics-setup.sql para recriar o sistema de analytics.' as proximo_passo,
  'A função update_updated_at_column() foi preservada pois é usada por outras tabelas.' as observacao;


























