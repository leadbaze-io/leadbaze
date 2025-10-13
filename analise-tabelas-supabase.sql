-- ============================================================================
-- SCRIPT DE ANÁLISE COMPLETA DAS TABELAS DO SUPABASE
-- Execute este script no SQL Editor do Supabase para análise completa
-- ============================================================================

-- 1. LISTAR TODAS AS TABELAS DO BANCO
-- ============================================================================
SELECT 
  'TABELAS EXISTENTES' as categoria,
  table_name as nome,
  table_type as tipo,
  'N/A' as colunas,
  'N/A' as registros
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. ANÁLISE DETALHADA DE CADA TABELA PRINCIPAL
-- ============================================================================

-- 2.1 LEAD_LISTS - Tabela principal de listas de leads
SELECT 
  'LEAD_LISTS - ESTRUTURA' as categoria,
  column_name as campo,
  data_type as tipo,
  is_nullable as nullable,
  column_default as padrao
FROM information_schema.columns 
WHERE table_name = 'lead_lists'
ORDER BY ordinal_position;

-- 2.2 CONTACT_ATTEMPTS - Tentativas de contato
SELECT 
  'CONTACT_ATTEMPTS - ESTRUTURA' as categoria,
  column_name as campo,
  data_type as tipo,
  is_nullable as nullable,
  column_default as padrao
FROM information_schema.columns 
WHERE table_name = 'contact_attempts'
ORDER BY ordinal_position;

-- 2.3 WHATSAPP_INSTANCES - Instâncias do WhatsApp
SELECT 
  'WHATSAPP_INSTANCES - ESTRUTURA' as categoria,
  column_name as campo,
  data_type as tipo,
  is_nullable as nullable,
  column_default as padrao
FROM information_schema.columns 
WHERE table_name = 'whatsapp_instances'
ORDER BY ordinal_position;

-- 2.4 USER_PREFERENCES - Preferências do usuário
SELECT 
  'USER_PREFERENCES - ESTRUTURA' as categoria,
  column_name as campo,
  data_type as tipo,
  is_nullable as nullable,
  column_default as padrao
FROM information_schema.columns 
WHERE table_name = 'user_preferences'
ORDER BY ordinal_position;

-- 2.5 WHATSAPP_TEMPLATES - Templates de mensagem
SELECT 
  'WHATSAPP_TEMPLATES - ESTRUTURA' as categoria,
  column_name as campo,
  data_type as tipo,
  is_nullable as nullable,
  column_default as padrao
FROM information_schema.columns 
WHERE table_name = 'whatsapp_templates'
ORDER BY ordinal_position;

-- 3. VERIFICAR TABELAS ADICIONAIS (V2)
-- ============================================================================

-- 3.1 ANALYTICS_EVENTS - Eventos de analytics
SELECT 
  'ANALYTICS_EVENTS - ESTRUTURA' as categoria,
  column_name as campo,
  data_type as tipo,
  is_nullable as nullable,
  column_default as padrao
FROM information_schema.columns 
WHERE table_name = 'analytics_events'
ORDER BY ordinal_position;

-- 3.2 SYSTEM_LOGS - Logs do sistema
SELECT 
  'SYSTEM_LOGS - ESTRUTURA' as categoria,
  column_name as campo,
  data_type as tipo,
  is_nullable as nullable,
  column_default as padrao
FROM information_schema.columns 
WHERE table_name = 'system_logs'
ORDER BY ordinal_position;

-- 3.3 USER_TAGS - Tags personalizadas
SELECT 
  'USER_TAGS - ESTRUTURA' as categoria,
  column_name as campo,
  data_type as tipo,
  is_nullable as nullable,
  column_default as padrao
FROM information_schema.columns 
WHERE table_name = 'user_tags'
ORDER BY ordinal_position;

-- 4. VERIFICAR TABELAS DE CAMPANHAS (se existirem)
-- ============================================================================

-- 4.1 BULK_CAMPAIGNS - Campanhas em massa
SELECT 
  'BULK_CAMPAIGNS - ESTRUTURA' as categoria,
  column_name as campo,
  data_type as tipo,
  is_nullable as nullable,
  column_default as padrao
FROM information_schema.columns 
WHERE table_name = 'bulk_campaigns'
ORDER BY ordinal_position;

-- 4.2 CAMPAIGN_LEADS - Leads das campanhas
SELECT 
  'CAMPAIGN_LEADS - ESTRUTURA' as categoria,
  column_name as campo,
  data_type as tipo,
  is_nullable as nullable,
  column_default as padrao
FROM information_schema.columns 
WHERE table_name = 'campaign_leads'
ORDER BY ordinal_position;

-- 5. ANÁLISE DE VOLUME DE DADOS
-- ============================================================================

-- 5.1 Contagem de registros por tabela
SELECT 
  'VOLUME DE DADOS' as categoria,
  'lead_lists' as tabela,
  COUNT(*)::text as registros,
  'N/A' as campo_extra,
  'N/A' as campo_extra2
FROM lead_lists
UNION ALL
SELECT 
  'VOLUME DE DADOS' as categoria,
  'contact_attempts' as tabela,
  COUNT(*)::text as registros,
  'N/A' as campo_extra,
  'N/A' as campo_extra2
FROM contact_attempts
UNION ALL
SELECT 
  'VOLUME DE DADOS' as categoria,
  'whatsapp_instances' as tabela,
  COUNT(*)::text as registros,
  'N/A' as campo_extra,
  'N/A' as campo_extra2
FROM whatsapp_instances
UNION ALL
SELECT 
  'VOLUME DE DADOS' as categoria,
  'user_preferences' as tabela,
  COUNT(*)::text as registros,
  'N/A' as campo_extra,
  'N/A' as campo_extra2
FROM user_preferences
UNION ALL
SELECT 
  'VOLUME DE DADOS' as categoria,
  'whatsapp_templates' as tabela,
  COUNT(*)::text as registros,
  'N/A' as campo_extra,
  'N/A' as campo_extra2
FROM whatsapp_templates;

-- 6. ANÁLISE DE ÍNDICES EXISTENTES
-- ============================================================================

-- 6.1 Listar todos os índices
SELECT 
  'ÍNDICES EXISTENTES' as categoria,
  schemaname as schema,
  tablename as tabela,
  indexname as indice,
  indexdef as definicao
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 7. ANÁLISE DE PERFORMANCE - QUERIES MAIS COMUNS
-- ============================================================================

-- 7.1 Análise de consultas por user_id (mais comum)
SELECT 
  'ANÁLISE PERFORMANCE' as categoria,
  'lead_lists por user_id' as consulta,
  COUNT(*)::text as registros,
  'user_id' as campo_indexado,
  CASE 
    WHEN COUNT(*) > 1000 THEN 'ALTO VOLUME - NECESSITA ÍNDICE'
    WHEN COUNT(*) > 100 THEN 'MÉDIO VOLUME - MONITORAR'
    ELSE 'BAIXO VOLUME - OK'
  END as recomendacao
FROM lead_lists
GROUP BY user_id
ORDER BY COUNT(*) DESC
LIMIT 5;

-- 7.2 Análise de contact_attempts por status
SELECT 
  'ANÁLISE PERFORMANCE' as categoria,
  'contact_attempts por status' as consulta,
  COUNT(*)::text as registros,
  status as campo_indexado,
  CASE 
    WHEN COUNT(*) > 5000 THEN 'ALTO VOLUME - NECESSITA ÍNDICE'
    WHEN COUNT(*) > 500 THEN 'MÉDIO VOLUME - MONITORAR'
    ELSE 'BAIXO VOLUME - OK'
  END as recomendacao
FROM contact_attempts
GROUP BY status
ORDER BY COUNT(*) DESC;

-- 8. VERIFICAR CONSTRAINTS E FOREIGN KEYS
-- ============================================================================

-- 8.1 Constraints existentes
SELECT 
  'CONSTRAINTS' as categoria,
  tc.table_name as tabela,
  tc.constraint_name as constraint,
  tc.constraint_type as tipo,
  kcu.column_name as coluna
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- 9. ANÁLISE DE JSONB (campos que podem precisar de índices GIN)
-- ============================================================================

-- 9.1 Campos JSONB nas tabelas
SELECT 
  'CAMPOS JSONB' as categoria,
  table_name as tabela,
  column_name as campo,
  data_type as tipo,
  'POTENCIAL ÍNDICE GIN' as recomendacao
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND data_type = 'jsonb'
ORDER BY table_name, column_name;

-- 10. RESUMO FINAL PARA ANÁLISE DE INDEXAÇÃO
-- ============================================================================

-- 10.1 Tabelas que mais precisam de atenção
SELECT 
  'RESUMO FINAL' as categoria,
  'Tabelas com mais registros' as tipo_analise,
  'lead_lists' as tabela,
  COUNT(*)::text as registros,
  'Verificar índices em user_id, created_at, status' as recomendacao
FROM lead_lists
UNION ALL
SELECT 
  'RESUMO FINAL' as categoria,
  'Tabelas com mais registros' as tipo_analise,
  'contact_attempts' as tabela,
  COUNT(*)::text as registros,
  'Verificar índices em user_id, list_id, status, created_at' as recomendacao
FROM contact_attempts
UNION ALL
SELECT 
  'RESUMO FINAL' as categoria,
  'Tabelas com mais registros' as tipo_analise,
  'whatsapp_instances' as tabela,
  COUNT(*)::text as registros,
  'Verificar índices em user_id, status, instance_name' as recomendacao
FROM whatsapp_instances;

-- ============================================================================
-- INSTRUÇÕES PARA ANÁLISE:
-- ============================================================================
-- 1. Execute este script completo no SQL Editor do Supabase
-- 2. Analise os resultados de cada seção
-- 3. Foque nas tabelas com maior volume de dados
-- 4. Verifique se os índices existentes cobrem as consultas mais comuns
-- 5. Identifique campos JSONB que podem precisar de índices GIN
-- 6. Monitore tabelas que crescem rapidamente (contact_attempts, analytics_events)
-- ============================================================================




