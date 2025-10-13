-- ============================================================================
-- PLANO DE INDEXAÇÃO PREVENTIVA PARA SUPABASE - FASE INICIAL
-- Baseado na análise: lead_lists(26), whatsapp_instances(13), outras(0)
-- ============================================================================

-- ANÁLISE ATUAL:
-- ✅ lead_lists: 26 registros (crescendo)
-- ✅ whatsapp_instances: 13 registros (consultas frequentes)
-- ⚠️ contact_attempts: 0 registros (será muito consultada)
-- ⚠️ user_preferences: 0 registros (consultas por usuário)
-- ⚠️ whatsapp_templates: 0 registros (consultas por usuário)

-- ESTRATÉGIA: Implementar índices preventivos ANTES do crescimento dos dados

-- ============================================================================
-- 1. ÍNDICES CRÍTICOS PARA PERFORMANCE FUTURA
-- ============================================================================

-- 1.1 LEAD_LISTS - Tabela principal (26 registros, mas crescerá rapidamente)
-- ============================================================================

-- Índice composto para consultas mais comuns: user_id + status + created_at
-- (Usado em: listagem de listas do usuário, filtros por status, ordenação por data)
CREATE INDEX IF NOT EXISTS idx_lead_lists_user_status_created 
ON public.lead_lists(user_id, status, created_at DESC);

-- Índice para busca por nome (consultas de filtro e busca)
CREATE INDEX IF NOT EXISTS idx_lead_lists_name_search 
ON public.lead_lists USING gin(to_tsvector('portuguese', name));

-- Índice para tags (campo JSONB) - consultas por tags
CREATE INDEX IF NOT EXISTS idx_lead_lists_tags_gin 
ON public.lead_lists USING gin(tags);

-- Índice para total_leads (consultas de ordenação por quantidade)
CREATE INDEX IF NOT EXISTS idx_lead_lists_total_leads 
ON public.lead_lists(total_leads DESC);

-- Índice para updated_at (consultas de "última modificação")
CREATE INDEX IF NOT EXISTS idx_lead_lists_updated_at 
ON public.lead_lists(updated_at DESC);

-- 1.2 CONTACT_ATTEMPTS - Tabela de tentativas (0 registros, mas será muito consultada)
-- ============================================================================

-- Índice composto principal: user_id + list_id + status
-- (Usado em: consultas de tentativas por lista, filtros por status)
CREATE INDEX IF NOT EXISTS idx_contact_attempts_user_list_status 
ON public.contact_attempts(user_id, list_id, status);

-- Índice para consultas por data (relatórios e analytics)
CREATE INDEX IF NOT EXISTS idx_contact_attempts_created_at 
ON public.contact_attempts(created_at DESC);

-- Índice para consultas por método de contato (whatsapp, phone, email)
CREATE INDEX IF NOT EXISTS idx_contact_attempts_method 
ON public.contact_attempts(method);

-- Índice para consultas por lead_id específico
CREATE INDEX IF NOT EXISTS idx_contact_attempts_lead_id 
ON public.contact_attempts(lead_id);

-- Índice composto para analytics: status + created_at
CREATE INDEX IF NOT EXISTS idx_contact_attempts_status_created 
ON public.contact_attempts(status, created_at DESC);

-- Índice para template_id (consultas por template usado)
CREATE INDEX IF NOT EXISTS idx_contact_attempts_template_id 
ON public.contact_attempts(template_id);

-- 1.3 WHATSAPP_INSTANCES - Instâncias do WhatsApp (13 registros, consultas frequentes)
-- ============================================================================

-- Índice composto: user_id + status
-- (Usado em: consultas de instâncias conectadas por usuário)
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_user_status 
ON public.whatsapp_instances(user_id, status);

-- Índice para instance_name (consultas por nome único)
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_name 
ON public.whatsapp_instances(instance_name);

-- Índice para last_connection_at (consultas de status de conexão)
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_last_connection 
ON public.whatsapp_instances(last_connection_at DESC);

-- Índice para whatsapp_number (consultas por número)
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_whatsapp_number 
ON public.whatsapp_instances(whatsapp_number);

-- 1.4 USER_PREFERENCES - Preferências do usuário (0 registros, mas consultas por usuário)
-- ============================================================================

-- Índice para user_id (já é UNIQUE, mas garantindo)
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id 
ON public.user_preferences(user_id);

-- Índice para whatsapp_number (consultas por número do usuário)
CREATE INDEX IF NOT EXISTS idx_user_preferences_whatsapp_number 
ON public.user_preferences(whatsapp_number);

-- 1.5 WHATSAPP_TEMPLATES - Templates de mensagem (0 registros, mas consultas por usuário)
-- ============================================================================

-- Índice composto: user_id + created_at
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_user_created 
ON public.whatsapp_templates(user_id, created_at DESC);

-- Índice para busca por nome do template
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_name_search 
ON public.whatsapp_templates USING gin(to_tsvector('portuguese', name));

-- Índice para variables (campo JSONB) - consultas por variáveis do template
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_variables_gin 
ON public.whatsapp_templates USING gin(variables);

-- ============================================================================
-- 2. VERIFICAR ÍNDICES CRIADOS
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
-- 3. ANÁLISE DE PERFORMANCE DAS CONSULTAS MAIS COMUNS
-- ============================================================================

-- 3.1 Testar performance de consultas em lead_lists
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM public.lead_lists 
WHERE user_id = (SELECT id FROM auth.users LIMIT 1) 
  AND status = 'active' 
ORDER BY created_at DESC;

-- 3.2 Testar performance de consultas em whatsapp_instances
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM public.whatsapp_instances 
WHERE user_id = (SELECT id FROM auth.users LIMIT 1) 
  AND status = 'connected';

-- 3.3 Testar performance de busca por nome em lead_lists
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM public.lead_lists 
WHERE to_tsvector('portuguese', name) @@ plainto_tsquery('portuguese', 'restaurante');

-- ============================================================================
-- 4. CONFIGURAÇÕES ADICIONAIS PARA PERFORMANCE
-- ============================================================================

-- 4.1 Atualizar estatísticas das tabelas
ANALYZE public.lead_lists;
ANALYZE public.contact_attempts;
ANALYZE public.whatsapp_instances;
ANALYZE public.user_preferences;
ANALYZE public.whatsapp_templates;

-- ============================================================================
-- 5. SISTEMA DE MONITORAMENTO DE CRESCIMENTO
-- ============================================================================

-- 5.1 View para monitorar crescimento das tabelas
CREATE OR REPLACE VIEW table_growth_monitor AS
SELECT 
  'lead_lists' as table_name,
  COUNT(*) as current_records,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(created_at) as last_record,
  MIN(created_at) as first_record,
  CASE 
    WHEN COUNT(*) > 1000 THEN 'ALTO VOLUME - MONITORAR'
    WHEN COUNT(*) > 100 THEN 'MÉDIO VOLUME - CRESCENDO'
    ELSE 'BAIXO VOLUME - OK'
  END as status
FROM public.lead_lists
UNION ALL
SELECT 
  'contact_attempts' as table_name,
  COUNT(*) as current_records,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(created_at) as last_record,
  MIN(created_at) as first_record,
  CASE 
    WHEN COUNT(*) > 10000 THEN 'ALTO VOLUME - MONITORAR'
    WHEN COUNT(*) > 1000 THEN 'MÉDIO VOLUME - CRESCENDO'
    ELSE 'BAIXO VOLUME - OK'
  END as status
FROM public.contact_attempts
UNION ALL
SELECT 
  'whatsapp_instances' as table_name,
  COUNT(*) as current_records,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(created_at) as last_record,
  MIN(created_at) as first_record,
  CASE 
    WHEN COUNT(*) > 100 THEN 'ALTO VOLUME - MONITORAR'
    WHEN COUNT(*) > 50 THEN 'MÉDIO VOLUME - CRESCENDO'
    ELSE 'BAIXO VOLUME - OK'
  END as status
FROM public.whatsapp_instances
UNION ALL
SELECT 
  'user_preferences' as table_name,
  COUNT(*) as current_records,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(created_at) as last_record,
  MIN(created_at) as first_record,
  CASE 
    WHEN COUNT(*) > 1000 THEN 'ALTO VOLUME - MONITORAR'
    WHEN COUNT(*) > 100 THEN 'MÉDIO VOLUME - CRESCENDO'
    ELSE 'BAIXO VOLUME - OK'
  END as status
FROM public.user_preferences
UNION ALL
SELECT 
  'whatsapp_templates' as table_name,
  COUNT(*) as current_records,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(created_at) as last_record,
  MIN(created_at) as first_record,
  CASE 
    WHEN COUNT(*) > 1000 THEN 'ALTO VOLUME - MONITORAR'
    WHEN COUNT(*) > 100 THEN 'MÉDIO VOLUME - CRESCENDO'
    ELSE 'BAIXO VOLUME - OK'
  END as status
FROM public.whatsapp_templates;

-- 5.2 Query para verificar uso dos índices
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
-- 6. FUNÇÃO PARA LIMPEZA AUTOMÁTICA (PREPARAÇÃO FUTURA)
-- ============================================================================

-- 6.1 Função para limpeza de dados antigos (quando necessário)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Remove contact_attempts com mais de 1 ano (quando tiver muitos dados)
  DELETE FROM public.contact_attempts 
  WHERE created_at < NOW() - INTERVAL '1 year'
  AND status IN ('failed', 'delivered');
  
  -- Remove logs antigos (quando existirem)
  -- DELETE FROM public.system_logs 
  -- WHERE created_at < NOW() - INTERVAL '30 days' 
  -- AND level != 'error';
  
  RAISE NOTICE 'Limpeza de dados antigos concluída';
END;
$$ language 'plpgsql';

-- ============================================================================
-- 7. CONSULTAS DE MONITORAMENTO RECOMENDADAS
-- ============================================================================

-- 7.1 Verificar crescimento das tabelas
SELECT * FROM table_growth_monitor ORDER BY current_records DESC;

-- 7.2 Verificar performance dos índices
SELECT 
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  CASE 
    WHEN idx_scan = 0 THEN 'ÍNDICE NÃO UTILIZADO'
    WHEN idx_scan < 10 THEN 'BAIXO USO'
    WHEN idx_scan < 100 THEN 'MÉDIO USO'
    ELSE 'ALTO USO'
  END as status_uso
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- ============================================================================
-- RESUMO DAS OTIMIZAÇÕES IMPLEMENTADAS:
-- ============================================================================
-- 
-- ✅ ÍNDICES PREVENTIVOS: Criados antes do crescimento dos dados
-- ✅ ÍNDICES COMPOSTOS: Para consultas que filtram por múltiplos campos
-- ✅ ÍNDICES GIN: Para campos JSONB e busca textual
-- ✅ ÍNDICES DE DATA: Para consultas temporais e ordenação
-- ✅ MONITORAMENTO: Sistema para acompanhar crescimento e performance
-- ✅ LIMPEZA AUTOMÁTICA: Preparação para quando os dados crescerem
-- 
-- BENEFÍCIOS:
-- - Consultas mais rápidas mesmo com crescimento dos dados
-- - Melhor performance em filtros e ordenações
-- - Suporte eficiente para busca textual e JSONB
-- - Monitoramento proativo de performance
-- - Preparação para limpeza automática de dados antigos
-- 
-- PRÓXIMOS PASSOS:
-- 1. Execute este script no Supabase
-- 2. Monitore o crescimento das tabelas usando a view table_growth_monitor
-- 3. Ajuste índices conforme necessário
-- 4. Implemente limpeza automática quando os dados crescerem
-- 5. Monitore o uso dos índices para otimizações futuras
-- ============================================================================




