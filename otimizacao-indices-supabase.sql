-- ============================================================================
-- SCRIPT DE INDEXAÇÃO PREVENTIVA PARA SUPABASE
-- Execute este script no SQL Editor do Supabase para otimizar performance
-- ============================================================================

-- ANÁLISE DOS RESULTADOS:
-- - lead_lists: 26 registros (crescendo)
-- - contact_attempts: 0 registros (será muito consultada)
-- - whatsapp_instances: 13 registros (consultas frequentes)
-- 
-- RECOMENDAÇÃO: Implementar índices preventivos ANTES do crescimento dos dados

-- ============================================================================
-- 1. VERIFICAR ÍNDICES EXISTENTES
-- ============================================================================

-- Listar todos os índices atuais
SELECT 
  'ÍNDICES ATUAIS' as categoria,
  schemaname as schema,
  tablename as tabela,
  indexname as indice,
  indexdef as definicao
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================================================
-- 2. ÍNDICES CRÍTICOS PARA PERFORMANCE
-- ============================================================================

-- 2.1 LEAD_LISTS - Tabela principal (26 registros, mas crescerá rapidamente)
-- ============================================================================

-- Índice composto para consultas mais comuns: user_id + status + created_at
CREATE INDEX IF NOT EXISTS idx_lead_lists_user_status_created 
ON public.lead_lists(user_id, status, created_at DESC);

-- Índice para busca por nome (consultas de filtro)
CREATE INDEX IF NOT EXISTS idx_lead_lists_name_search 
ON public.lead_lists USING gin(to_tsvector('portuguese', name));

-- Índice para tags (campo JSONB)
CREATE INDEX IF NOT EXISTS idx_lead_lists_tags_gin 
ON public.lead_lists USING gin(tags);

-- Índice para total_leads (consultas de ordenação)
CREATE INDEX IF NOT EXISTS idx_lead_lists_total_leads 
ON public.lead_lists(total_leads DESC);

-- 2.2 CONTACT_ATTEMPTS - Tabela de tentativas (0 registros, mas será muito consultada)
-- ============================================================================

-- Índice composto principal: user_id + list_id + status
CREATE INDEX IF NOT EXISTS idx_contact_attempts_user_list_status 
ON public.contact_attempts(user_id, list_id, status);

-- Índice para consultas por data (relatórios e analytics)
CREATE INDEX IF NOT EXISTS idx_contact_attempts_created_at 
ON public.contact_attempts(created_at DESC);

-- Índice para consultas por método de contato
CREATE INDEX IF NOT EXISTS idx_contact_attempts_method 
ON public.contact_attempts(method);

-- Índice para consultas por lead_id específico
CREATE INDEX IF NOT EXISTS idx_contact_attempts_lead_id 
ON public.contact_attempts(lead_id);

-- Índice composto para analytics: status + created_at
CREATE INDEX IF NOT EXISTS idx_contact_attempts_status_created 
ON public.contact_attempts(status, created_at DESC);

-- 2.3 WHATSAPP_INSTANCES - Instâncias do WhatsApp (13 registros, consultas frequentes)
-- ============================================================================

-- Índice composto: user_id + status
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_user_status 
ON public.whatsapp_instances(user_id, status);

-- Índice para instance_name (consultas por nome)
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_name 
ON public.whatsapp_instances(instance_name);

-- Índice para last_connection_at (consultas de status de conexão)
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_last_connection 
ON public.whatsapp_instances(last_connection_at DESC);

-- 2.4 USER_PREFERENCES - Preferências do usuário
-- ============================================================================

-- Índice já existe (user_id é UNIQUE), mas vamos garantir
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id 
ON public.user_preferences(user_id);

-- 2.5 WHATSAPP_TEMPLATES - Templates de mensagem
-- ============================================================================

-- Índice composto: user_id + created_at
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_user_created 
ON public.whatsapp_templates(user_id, created_at DESC);

-- Índice para busca por nome do template
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_name_search 
ON public.whatsapp_templates USING gin(to_tsvector('portuguese', name));

-- ============================================================================
-- 3. ÍNDICES PARA TABELAS V2 (se existirem)
-- ============================================================================

-- 3.1 ANALYTICS_EVENTS - Eventos de analytics (crescerá rapidamente)
-- ============================================================================

-- Índice composto principal: user_id + event_type + created_at
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_type_created 
ON public.analytics_events(user_id, event_type, created_at DESC);

-- Índice para consultas por tipo de evento
CREATE INDEX IF NOT EXISTS idx_analytics_events_type 
ON public.analytics_events(event_type);

-- Índice para consultas por data (relatórios)
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at 
ON public.analytics_events(created_at DESC);

-- Índice GIN para event_data (campo JSONB)
CREATE INDEX IF NOT EXISTS idx_analytics_events_data_gin 
ON public.analytics_events USING gin(event_data);

-- 3.2 SYSTEM_LOGS - Logs do sistema
-- ============================================================================

-- Índice composto: user_id + level + created_at
CREATE INDEX IF NOT EXISTS idx_system_logs_user_level_created 
ON public.system_logs(user_id, level, created_at DESC);

-- Índice para consultas por nível de log
CREATE INDEX IF NOT EXISTS idx_system_logs_level 
ON public.system_logs(level);

-- Índice para consultas por data (limpeza automática)
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at 
ON public.system_logs(created_at DESC);

-- 3.3 USER_TAGS - Tags personalizadas
-- ============================================================================

-- Índice composto: user_id + category
CREATE INDEX IF NOT EXISTS idx_user_tags_user_category 
ON public.user_tags(user_id, category);

-- Índice para consultas por categoria
CREATE INDEX IF NOT EXISTS idx_user_tags_category 
ON public.user_tags(category);

-- ============================================================================
-- 4. ÍNDICES PARA TABELAS DE CAMPANHAS (se existirem)
-- ============================================================================

-- 4.1 BULK_CAMPAIGNS - Campanhas em massa
-- ============================================================================

-- Índice composto: user_id + status + created_at
CREATE INDEX IF NOT EXISTS idx_bulk_campaigns_user_status_created 
ON public.bulk_campaigns(user_id, status, created_at DESC);

-- Índice para consultas por status
CREATE INDEX IF NOT EXISTS idx_bulk_campaigns_status 
ON public.bulk_campaigns(status);

-- 4.2 CAMPAIGN_LEADS - Leads das campanhas
-- ============================================================================

-- Índice composto: campaign_id + status
CREATE INDEX IF NOT EXISTS idx_campaign_leads_campaign_status 
ON public.campaign_leads(campaign_id, status);

-- Índice para consultas por lead_id
CREATE INDEX IF NOT EXISTS idx_campaign_leads_lead_id 
ON public.campaign_leads(lead_id);

-- Índice para consultas por data
CREATE INDEX IF NOT EXISTS idx_campaign_leads_created_at 
ON public.campaign_leads(created_at DESC);

-- ============================================================================
-- 5. VERIFICAR ÍNDICES CRIADOS
-- ============================================================================

-- Listar todos os índices após a criação
SELECT 
  'ÍNDICES CRIADOS' as categoria,
  schemaname as schema,
  tablename as tabela,
  indexname as indice,
  indexdef as definicao
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================================================
-- 6. ANÁLISE DE PERFORMANCE DAS CONSULTAS MAIS COMUNS
-- ============================================================================

-- 6.1 Testar performance de consultas em lead_lists
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM public.lead_lists 
WHERE user_id = (SELECT id FROM auth.users LIMIT 1) 
  AND status = 'active' 
ORDER BY created_at DESC;

-- 6.2 Testar performance de consultas em contact_attempts
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM public.contact_attempts 
WHERE user_id = (SELECT id FROM auth.users LIMIT 1) 
  AND status = 'pending' 
ORDER BY created_at DESC;

-- 6.3 Testar performance de consultas em whatsapp_instances
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM public.whatsapp_instances 
WHERE user_id = (SELECT id FROM auth.users LIMIT 1) 
  AND status = 'connected';

-- ============================================================================
-- 7. CONFIGURAÇÕES ADICIONAIS PARA PERFORMANCE
-- ============================================================================

-- 7.1 Atualizar estatísticas das tabelas
ANALYZE public.lead_lists;
ANALYZE public.contact_attempts;
ANALYZE public.whatsapp_instances;
ANALYZE public.user_preferences;
ANALYZE public.whatsapp_templates;

-- 7.2 Configurações para tabelas que crescem rapidamente
-- (Execute apenas se as tabelas existirem)
-- ANALYZE public.analytics_events;
-- ANALYZE public.system_logs;
-- ANALYZE public.bulk_campaigns;
-- ANALYZE public.campaign_leads;

-- ============================================================================
-- 8. MONITORAMENTO CONTÍNUO
-- ============================================================================

-- 8.1 Query para monitorar crescimento das tabelas
CREATE OR REPLACE VIEW table_growth_monitor AS
SELECT 
  'lead_lists' as table_name,
  COUNT(*) as current_records,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(created_at) as last_record,
  MIN(created_at) as first_record
FROM public.lead_lists
UNION ALL
SELECT 
  'contact_attempts' as table_name,
  COUNT(*) as current_records,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(created_at) as last_record,
  MIN(created_at) as first_record
FROM public.contact_attempts
UNION ALL
SELECT 
  'whatsapp_instances' as table_name,
  COUNT(*) as current_records,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(created_at) as last_record,
  MIN(created_at) as first_record
FROM public.whatsapp_instances;

-- 8.2 Query para verificar uso dos índices
SELECT 
  'MONITORAMENTO DE ÍNDICES' as categoria,
  schemaname as schema,
  tablename as tabela,
  indexname as indice,
  idx_scan as scans_executados,
  idx_tup_read as tuplas_lidas,
  idx_tup_fetch as tuplas_retornadas
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- ============================================================================
-- RESUMO DAS OTIMIZAÇÕES IMPLEMENTADAS:
-- ============================================================================
-- 
-- 1. ÍNDICES COMPOSTOS: Para consultas que filtram por múltiplos campos
-- 2. ÍNDICES GIN: Para campos JSONB e busca textual
-- 3. ÍNDICES DE DATA: Para consultas temporais e ordenação
-- 4. ÍNDICES PREVENTIVOS: Antes do crescimento dos dados
-- 5. MONITORAMENTO: Views para acompanhar crescimento e performance
-- 
-- BENEFÍCIOS:
-- - Consultas mais rápidas mesmo com crescimento dos dados
-- - Melhor performance em filtros e ordenações
-- - Suporte eficiente para busca textual e JSONB
-- - Monitoramento proativo de performance
-- 
-- PRÓXIMOS PASSOS:
-- 1. Execute este script no Supabase
-- 2. Monitore o crescimento das tabelas
-- 3. Ajuste índices conforme necessário
-- 4. Implemente limpeza automática de dados antigos
-- ============================================================================




