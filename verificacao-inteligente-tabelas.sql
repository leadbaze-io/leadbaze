-- ============================================================================
-- SCRIPT INTELIGENTE PARA VERIFICAR TODAS AS TABELAS EXISTENTES
-- Execute este script no SQL Editor do Supabase para análise completa
-- ============================================================================

-- 1. PRIMEIRO: LISTAR TODAS AS TABELAS QUE REALMENTE EXISTEM
-- ============================================================================
SELECT 
  'TABELAS EXISTENTES' as categoria,
  table_name as nome_tabela,
  table_type as tipo,
  'Verificando volume...' as status
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. VERIFICAR VOLUME DE DADOS APENAS NAS TABELAS QUE EXISTEM
-- ============================================================================

-- 2.1 lead_lists (sempre existe)
SELECT 
  'VOLUME DE DADOS' as categoria,
  'lead_lists' as tabela,
  COUNT(*)::text as registros,
  'Tabela principal de leads' as descricao
FROM lead_lists;

-- 2.2 contact_attempts (sempre existe)
SELECT 
  'VOLUME DE DADOS' as categoria,
  'contact_attempts' as tabela,
  COUNT(*)::text as registros,
  'Tentativas de contato' as descricao
FROM contact_attempts;

-- 2.3 whatsapp_instances (sempre existe)
SELECT 
  'VOLUME DE DADOS' as categoria,
  'whatsapp_instances' as tabela,
  COUNT(*)::text as registros,
  'Instâncias WhatsApp' as descricao
FROM whatsapp_instances;

-- 2.4 user_preferences (sempre existe)
SELECT 
  'VOLUME DE DADOS' as categoria,
  'user_preferences' as tabela,
  COUNT(*)::text as registros,
  'Preferências usuário' as descricao
FROM user_preferences;

-- 2.5 whatsapp_templates (sempre existe)
SELECT 
  'VOLUME DE DADOS' as categoria,
  'whatsapp_templates' as tabela,
  COUNT(*)::text as registros,
  'Templates WhatsApp' as descricao
FROM whatsapp_templates;

-- 3. VERIFICAR TABELAS V2 (podem não existir)
-- ============================================================================

-- 3.1 analytics_events (pode não existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_events' AND table_schema = 'public') THEN
        RAISE NOTICE 'Tabela analytics_events existe';
    ELSE
        RAISE NOTICE 'Tabela analytics_events NÃO existe';
    END IF;
END $$;

-- Se analytics_events existir, contar registros
-- (Execute apenas se a tabela existir)
-- SELECT 
--   'VOLUME DE DADOS' as categoria,
--   'analytics_events' as tabela,
--   COUNT(*)::text as registros,
--   'Eventos de analytics' as descricao
-- FROM analytics_events;

-- 3.2 system_logs (pode não existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_logs' AND table_schema = 'public') THEN
        RAISE NOTICE 'Tabela system_logs existe';
    ELSE
        RAISE NOTICE 'Tabela system_logs NÃO existe';
    END IF;
END $$;

-- 3.3 user_tags (pode não existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_tags' AND table_schema = 'public') THEN
        RAISE NOTICE 'Tabela user_tags existe';
    ELSE
        RAISE NOTICE 'Tabela user_tags NÃO existe';
    END IF;
END $$;

-- 4. VERIFICAR TABELAS DE CAMPANHAS (podem não existir)
-- ============================================================================

-- 4.1 bulk_campaigns
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bulk_campaigns' AND table_schema = 'public') THEN
        RAISE NOTICE 'Tabela bulk_campaigns existe';
    ELSE
        RAISE NOTICE 'Tabela bulk_campaigns NÃO existe';
    END IF;
END $$;

-- 4.2 campaign_leads
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaign_leads' AND table_schema = 'public') THEN
        RAISE NOTICE 'Tabela campaign_leads existe';
    ELSE
        RAISE NOTICE 'Tabela campaign_leads NÃO existe';
    END IF;
END $$;

-- 5. VERIFICAR OUTRAS TABELAS POSSÍVEIS
-- ============================================================================

-- 5.1 blog_posts
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blog_posts' AND table_schema = 'public') THEN
        RAISE NOTICE 'Tabela blog_posts existe';
    ELSE
        RAISE NOTICE 'Tabela blog_posts NÃO existe';
    END IF;
END $$;

-- 5.2 blog_stats
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blog_stats' AND table_schema = 'public') THEN
        RAISE NOTICE 'Tabela blog_stats existe';
    ELSE
        RAISE NOTICE 'Tabela blog_stats NÃO existe';
    END IF;
END $$;

-- 5.3 payment_plans
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_plans' AND table_schema = 'public') THEN
        RAISE NOTICE 'Tabela payment_plans existe';
    ELSE
        RAISE NOTICE 'Tabela payment_plans NÃO existe';
    END IF;
END $$;

-- 5.4 webhooks
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'webhooks' AND table_schema = 'public') THEN
        RAISE NOTICE 'Tabela webhooks existe';
    ELSE
        RAISE NOTICE 'Tabela webhooks NÃO existe';
    END IF;
END $$;

-- 5.5 support_tickets
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'support_tickets' AND table_schema = 'public') THEN
        RAISE NOTICE 'Tabela support_tickets existe';
    ELSE
        RAISE NOTICE 'Tabela support_tickets NÃO existe';
    END IF;
END $$;

-- 5.6 lead_packages
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lead_packages' AND table_schema = 'public') THEN
        RAISE NOTICE 'Tabela lead_packages existe';
    ELSE
        RAISE NOTICE 'Tabela lead_packages NÃO existe';
    END IF;
END $$;

-- 6. SCRIPT DINÂMICO PARA CONTAR REGISTROS EM TODAS AS TABELAS EXISTENTES
-- ============================================================================

-- Este bloco vai contar registros em TODAS as tabelas que existem
DO $$
DECLARE
    rec RECORD;
    sql_text TEXT;
    result_count INTEGER;
BEGIN
    RAISE NOTICE '=== CONTAGEM DE REGISTROS EM TODAS AS TABELAS ===';
    
    FOR rec IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
    LOOP
        BEGIN
            sql_text := 'SELECT COUNT(*) FROM ' || rec.table_name;
            EXECUTE sql_text INTO result_count;
            RAISE NOTICE 'Tabela: % | Registros: %', rec.table_name, result_count;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Erro ao contar registros na tabela %: %', rec.table_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- 7. ANÁLISE DETALHADA DAS TABELAS COM MAIS REGISTROS
-- ============================================================================

-- 7.1 Análise de lead_lists por usuário
SELECT 
  'ANÁLISE LEAD_LISTS' as categoria,
  'Registros por usuário' as tipo,
  COUNT(*)::text as registros,
  user_id::text as usuario
FROM lead_lists
GROUP BY user_id
ORDER BY COUNT(*) DESC
LIMIT 10;

-- 7.2 Análise de contact_attempts por status (se tiver dados)
SELECT 
  'ANÁLISE CONTACT_ATTEMPTS' as categoria,
  'Registros por status' as tipo,
  COUNT(*)::text as registros,
  status as status_contato
FROM contact_attempts
GROUP BY status
ORDER BY COUNT(*) DESC;

-- 7.3 Análise de whatsapp_instances por status
SELECT 
  'ANÁLISE WHATSAPP_INSTANCES' as categoria,
  'Registros por status' as tipo,
  COUNT(*)::text as registros,
  status as status_conexao
FROM whatsapp_instances
GROUP BY status
ORDER BY COUNT(*) DESC;

-- 8. VERIFICAR ÍNDICES EXISTENTES
-- ============================================================================

-- 8.1 Listar todos os índices
SELECT 
  'ÍNDICES EXISTENTES' as categoria,
  schemaname as schema,
  tablename as tabela,
  indexname as indice,
  indexdef as definicao
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 9. RESUMO FINAL
-- ============================================================================

-- 9.1 Tabelas ordenadas por volume (apenas as que existem)
SELECT * FROM (
  SELECT 
    'RESUMO FINAL' as categoria,
    'lead_lists' as tabela,
    COUNT(*) as registros,
    CASE 
      WHEN COUNT(*) > 1000 THEN 'ALTO VOLUME - NECESSITA ÍNDICES URGENTES'
      WHEN COUNT(*) > 100 THEN 'MÉDIO VOLUME - MONITORAR CRESCIMENTO'
      ELSE 'BAIXO VOLUME - OK POR ENQUANTO'
    END as recomendacao
  FROM lead_lists
  UNION ALL
  SELECT 
    'RESUMO FINAL' as categoria,
    'contact_attempts' as tabela,
    COUNT(*) as registros,
    CASE 
      WHEN COUNT(*) > 1000 THEN 'ALTO VOLUME - NECESSITA ÍNDICES URGENTES'
      WHEN COUNT(*) > 100 THEN 'MÉDIO VOLUME - MONITORAR CRESCIMENTO'
      ELSE 'BAIXO VOLUME - OK POR ENQUANTO'
    END as recomendacao
  FROM contact_attempts
  UNION ALL
  SELECT 
    'RESUMO FINAL' as categoria,
    'whatsapp_instances' as tabela,
    COUNT(*) as registros,
    CASE 
      WHEN COUNT(*) > 1000 THEN 'ALTO VOLUME - NECESSITA ÍNDICES URGENTES'
      WHEN COUNT(*) > 100 THEN 'MÉDIO VOLUME - MONITORAR CRESCIMENTO'
      ELSE 'BAIXO VOLUME - OK POR ENQUANTO'
    END as recomendacao
  FROM whatsapp_instances
  UNION ALL
  SELECT 
    'RESUMO FINAL' as categoria,
    'user_preferences' as tabela,
    COUNT(*) as registros,
    CASE 
      WHEN COUNT(*) > 1000 THEN 'ALTO VOLUME - NECESSITA ÍNDICES URGENTES'
      WHEN COUNT(*) > 100 THEN 'MÉDIO VOLUME - MONITORAR CRESCIMENTO'
      ELSE 'BAIXO VOLUME - OK POR ENQUANTO'
    END as recomendacao
  FROM user_preferences
  UNION ALL
  SELECT 
    'RESUMO FINAL' as categoria,
    'whatsapp_templates' as tabela,
    COUNT(*) as registros,
    CASE 
      WHEN COUNT(*) > 1000 THEN 'ALTO VOLUME - NECESSITA ÍNDICES URGENTES'
      WHEN COUNT(*) > 100 THEN 'MÉDIO VOLUME - MONITORAR CRESCIMENTO'
      ELSE 'BAIXO VOLUME - OK POR ENQUANTO'
    END as recomendacao
  FROM whatsapp_templates
) as resumo
ORDER BY registros DESC;

-- ============================================================================
-- INSTRUÇÕES:
-- ============================================================================
-- 1. Execute este script completo
-- 2. Observe as mensagens NOTICE que mostram quais tabelas existem
-- 3. Analise o resumo final para identificar tabelas com mais registros
-- 4. Para tabelas que existem mas não estão no resumo, execute manualmente:
--    SELECT COUNT(*) FROM nome_da_tabela;
-- ============================================================================
