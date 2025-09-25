-- Script de verificação completa do setup de Analytics
-- Execute este script no SQL Editor do Supabase para verificar se tudo está funcionando

-- ==============================================
-- VERIFICAÇÃO DE TABELAS
-- ==============================================

-- Verificar se todas as tabelas foram criadas
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
    ) THEN '✅ Criada'
    ELSE '❌ Não encontrada'
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
-- VERIFICAÇÃO DE FUNÇÕES
-- ==============================================

-- Verificar se as funções foram criadas
SELECT 
  routine_name,
  CASE 
    WHEN routine_name IN (
      'calculate_lead_quality_score',
      'calculate_conversion_probability',
      'generate_analytics_insights'
    ) THEN '✅ Criada'
    ELSE '❌ Não encontrada'
  END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'calculate_lead_quality_score',
  'calculate_conversion_probability',
  'generate_analytics_insights'
)
ORDER BY routine_name;

-- ==============================================
-- VERIFICAÇÃO DE VIEWS
-- ==============================================

-- Verificar se as views foram criadas
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      'campaign_metrics_summary',
      'category_performance'
    ) THEN '✅ Criada'
    ELSE '❌ Não encontrada'
  END as status
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN (
  'campaign_metrics_summary',
  'category_performance'
)
ORDER BY table_name;

-- ==============================================
-- TESTE DAS FUNÇÕES
-- ==============================================

-- Testar função de cálculo de score de qualidade
SELECT 
  'Teste calculate_lead_quality_score' as teste,
  calculate_lead_quality_score(4.5, 89, true, true, 'Restaurante') as resultado;

-- Testar função de probabilidade de conversão
SELECT 
  'Teste calculate_conversion_probability' as teste,
  calculate_conversion_probability(85.5, 'Restaurante', true) as resultado;

-- ==============================================
-- TESTE DAS VIEWS
-- ==============================================

-- Testar view campaign_metrics_summary
SELECT 
  'Teste campaign_metrics_summary' as teste,
  COUNT(*) as total_campaigns
FROM campaign_metrics_summary;

-- Testar view category_performance
SELECT 
  'Teste category_performance' as teste,
  COUNT(*) as total_categories
FROM category_performance;

-- ==============================================
-- VERIFICAÇÃO DE PERMISSÕES RLS
-- ==============================================

-- Verificar se RLS está habilitado nas tabelas
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ Habilitado'
    ELSE '❌ Desabilitado'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'whatsapp_responses', 
  'sales_conversions', 
  'message_templates', 
  'lead_quality_scores', 
  'analytics_insights', 
  'campaign_performance_metrics'
)
ORDER BY tablename;

-- ==============================================
-- VERIFICAÇÃO DE ÍNDICES
-- ==============================================

-- Verificar se os índices foram criados
SELECT 
  indexname,
  tablename,
  CASE 
    WHEN indexname LIKE 'idx_%' THEN '✅ Criado'
    ELSE '❌ Não encontrado'
  END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
AND tablename IN (
  'whatsapp_responses', 
  'sales_conversions', 
  'message_templates', 
  'lead_quality_scores', 
  'analytics_insights', 
  'campaign_performance_metrics'
)
ORDER BY tablename, indexname;

-- ==============================================
-- RESUMO FINAL
-- ==============================================

SELECT 
  '🎉 VERIFICAÇÃO COMPLETA' as status,
  'Execute este script para verificar se o setup de Analytics está funcionando corretamente.' as descricao;


























