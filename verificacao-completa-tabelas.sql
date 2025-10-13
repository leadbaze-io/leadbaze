-- ============================================================================
-- SCRIPT COMPLETO PARA VERIFICAR TODAS AS TABELAS E VOLUME DE DADOS
-- Execute este script no SQL Editor do Supabase para análise completa
-- ============================================================================

-- 1. LISTAR TODAS AS TABELAS DO BANCO (INCLUINDO AS QUE PODEM TER MAIS DADOS)
-- ============================================================================
SELECT 
  'TODAS AS TABELAS' as categoria,
  table_name as nome_tabela,
  table_type as tipo,
  'Verificando volume...' as status
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. VERIFICAR VOLUME DE DADOS EM TODAS AS TABELAS
-- ============================================================================

-- 2.1 Contagem de registros em TODAS as tabelas principais
SELECT 
  'VOLUME COMPLETO' as categoria,
  'lead_lists' as tabela,
  COUNT(*)::text as registros,
  'Tabela principal de leads' as descricao
FROM lead_lists
UNION ALL
SELECT 
  'VOLUME COMPLETO' as categoria,
  'contact_attempts' as tabela,
  COUNT(*)::text as registros,
  'Tentativas de contato' as descricao
FROM contact_attempts
UNION ALL
SELECT 
  'VOLUME COMPLETO' as categoria,
  'whatsapp_instances' as tabela,
  COUNT(*)::text as registros,
  'Instâncias WhatsApp' as descricao
FROM whatsapp_instances
UNION ALL
SELECT 
  'VOLUME COMPLETO' as categoria,
  'user_preferences' as tabela,
  COUNT(*)::text as registros,
  'Preferências usuário' as descricao
FROM user_preferences
UNION ALL
SELECT 
  'VOLUME COMPLETO' as categoria,
  'whatsapp_templates' as tabela,
  COUNT(*)::text as registros,
  'Templates WhatsApp' as descricao
FROM whatsapp_templates
UNION ALL
SELECT 
  'VOLUME COMPLETO' as categoria,
  'analytics_events' as tabela,
  COUNT(*)::text as registros,
  'Eventos de analytics' as descricao
FROM analytics_events
UNION ALL
SELECT 
  'VOLUME COMPLETO' as categoria,
  'system_logs' as tabela,
  COUNT(*)::text as registros,
  'Logs do sistema' as descricao
FROM system_logs
UNION ALL
SELECT 
  'VOLUME COMPLETO' as categoria,
  'user_tags' as tabela,
  COUNT(*)::text as registros,
  'Tags personalizadas' as descricao
FROM user_tags
UNION ALL
SELECT 
  'VOLUME COMPLETO' as categoria,
  'bulk_campaigns' as tabela,
  COUNT(*)::text as registros,
  'Campanhas em massa' as descricao
FROM bulk_campaigns
UNION ALL
SELECT 
  'VOLUME COMPLETO' as categoria,
  'campaign_leads' as tabela,
  COUNT(*)::text as registros,
  'Leads das campanhas' as descricao
FROM campaign_leads
UNION ALL
SELECT 
  'VOLUME COMPLETO' as categoria,
  'blog_posts' as tabela,
  COUNT(*)::text as registros,
  'Posts do blog' as descricao
FROM blog_posts
UNION ALL
SELECT 
  'VOLUME COMPLETO' as categoria,
  'blog_stats' as tabela,
  COUNT(*)::text as registros,
  'Estatísticas do blog' as descricao
FROM blog_stats
UNION ALL
SELECT 
  'VOLUME COMPLETO' as categoria,
  'payment_plans' as tabela,
  COUNT(*)::text as registros,
  'Planos de pagamento' as descricao
FROM payment_plans
UNION ALL
SELECT 
  'VOLUME COMPLETO' as categoria,
  'subscriptions' as tabela,
  COUNT(*)::text as registros,
  'Assinaturas' as descricao
FROM subscriptions
UNION ALL
SELECT 
  'VOLUME COMPLETO' as categoria,
  'webhooks' as tabela,
  COUNT(*)::text as registros,
  'Webhooks' as descricao
FROM webhooks
UNION ALL
SELECT 
  'VOLUME COMPLETO' as categoria,
  'support_tickets' as tabela,
  COUNT(*)::text as registros,
  'Tickets de suporte' as descricao
FROM support_tickets
UNION ALL
SELECT 
  'VOLUME COMPLETO' as categoria,
  'lead_packages' as tabela,
  COUNT(*)::text as registros,
  'Pacotes de leads' as descricao
FROM lead_packages
ORDER BY registros::integer DESC;

-- 3. VERIFICAR TABELAS QUE PODEM TER MAIS DADOS (COM TRATAMENTO DE ERRO)
-- ============================================================================

-- 3.1 Verificar se existem outras tabelas que não listei
SELECT 
  'TABELAS ADICIONAIS' as categoria,
  table_name as tabela,
  'Existe' as status,
  'Verificar volume manualmente' as observacao
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name NOT IN (
    'lead_lists', 'contact_attempts', 'whatsapp_instances', 
    'user_preferences', 'whatsapp_templates', 'analytics_events',
    'system_logs', 'user_tags', 'bulk_campaigns', 'campaign_leads',
    'blog_posts', 'blog_stats', 'payment_plans', 'subscriptions',
    'webhooks', 'support_tickets', 'lead_packages'
  )
ORDER BY table_name;

-- 4. ANÁLISE DETALHADA DAS TABELAS COM MAIS REGISTROS
-- ============================================================================

-- 4.1 Se analytics_events tiver muitos registros, analisar por tipo
SELECT 
  'ANÁLISE ANALYTICS' as categoria,
  event_type as tipo_evento,
  COUNT(*)::text as registros,
  MIN(created_at) as primeiro_registro,
  MAX(created_at) as ultimo_registro
FROM analytics_events
GROUP BY event_type
ORDER BY COUNT(*) DESC;

-- 4.2 Se system_logs tiver muitos registros, analisar por nível
SELECT 
  'ANÁLISE LOGS' as categoria,
  level as nivel_log,
  COUNT(*)::text as registros,
  MIN(created_at) as primeiro_registro,
  MAX(created_at) as ultimo_registro
FROM system_logs
GROUP BY level
ORDER BY COUNT(*) DESC;

-- 4.3 Se campaign_leads tiver muitos registros, analisar por status
SELECT 
  'ANÁLISE CAMPAIGN LEADS' as categoria,
  status as status_campanha,
  COUNT(*)::text as registros,
  MIN(created_at) as primeiro_registro,
  MAX(created_at) as ultimo_registro
FROM campaign_leads
GROUP BY status
ORDER BY COUNT(*) DESC;

-- 5. VERIFICAR TABELAS DE AUDITORIA E HISTÓRICO
-- ============================================================================

-- 5.1 Verificar se existem tabelas de auditoria
SELECT 
  'TABELAS AUDITORIA' as categoria,
  table_name as tabela,
  'Possível tabela de auditoria' as tipo
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND (table_name LIKE '%audit%' 
       OR table_name LIKE '%history%' 
       OR table_name LIKE '%log%'
       OR table_name LIKE '%backup%'
       OR table_name LIKE '%archive%')
ORDER BY table_name;

-- 6. VERIFICAR TABELAS TEMPORÁRIAS OU DE CACHE
-- ============================================================================

-- 6.1 Verificar tabelas que podem ser temporárias
SELECT 
  'TABELAS TEMPORÁRIAS' as categoria,
  table_name as tabela,
  'Possível tabela temporária' as tipo
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND (table_name LIKE '%temp%' 
       OR table_name LIKE '%cache%'
       OR table_name LIKE '%session%'
       OR table_name LIKE '%queue%')
ORDER BY table_name;

-- 7. RESUMO FINAL COM TODAS AS TABELAS E VOLUMES
-- ============================================================================

-- 7.1 Query dinâmica para contar registros em todas as tabelas
DO $$
DECLARE
    rec RECORD;
    sql_text TEXT;
BEGIN
    FOR rec IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
    LOOP
        sql_text := 'SELECT ''' || rec.table_name || ''' as tabela, COUNT(*) as registros FROM ' || rec.table_name;
        EXECUTE sql_text;
    END LOOP;
END $$;

-- 8. VERIFICAR TABELAS COM MAIS DE 100 REGISTROS (POTENCIAIS GARGALOS)
-- ============================================================================

-- Esta query será executada dinamicamente para identificar tabelas grandes
-- Execute manualmente para cada tabela que aparecer com muitos registros:

-- Exemplo para analytics_events (se tiver muitos registros):
-- SELECT 
--   'TABELA GRANDE' as categoria,
--   'analytics_events' as tabela,
--   COUNT(*)::text as registros,
--   'NECESSITA ÍNDICES URGENTES' as recomendacao
-- FROM analytics_events;

-- Exemplo para system_logs (se tiver muitos registros):
-- SELECT 
--   'TABELA GRANDE' as categoria,
--   'system_logs' as tabela,
--   COUNT(*)::text as registros,
--   'NECESSITA LIMPEZA AUTOMÁTICA' as recomendacao
-- FROM system_logs;

-- ============================================================================
-- INSTRUÇÕES PARA EXECUÇÃO:
-- ============================================================================
-- 1. Execute este script completo
-- 2. Identifique as tabelas com mais registros
-- 3. Para tabelas com muitos registros, execute as queries específicas
-- 4. Foque nas tabelas que aparecem no topo da lista de volume
-- 5. Crie índices específicos para essas tabelas grandes
-- ============================================================================




