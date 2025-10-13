-- =====================================================
-- ANÁLISE DE IMPACTO DAS CORREÇÕES SUPABASE
-- =====================================================
-- Este script analisa o impacto das correções antes de aplicá-las

-- =====================================================
-- ANÁLISE 1: IMPACTO DAS POLÍTICAS CONSOLIDADAS
-- =====================================================

-- 1.1 Identificar tabelas que serão afetadas
SELECT 
  'TABELAS AFETADAS POR CONSOLIDAÇÃO' as categoria,
  tablename as tabela,
  COUNT(*) as politicas_atuais,
  'Será consolidada em 1 política' as acao,
  'IMPACTO: Baixo - Mesma funcionalidade' as impacto
FROM pg_policies 
WHERE schemaname = 'public' 
  AND permissive = 'PERMISSIVE'
GROUP BY tablename
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- 1.2 Verificar funcionalidades críticas
SELECT 
  'FUNCIONALIDADES CRÍTICAS' as categoria,
  tablename as tabela,
  policyname as politica,
  cmd as operacao,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Leitura de dados'
    WHEN cmd = 'INSERT' THEN 'Criação de registros'
    WHEN cmd = 'UPDATE' THEN 'Modificação de dados'
    WHEN cmd = 'DELETE' THEN 'Exclusão de registros'
    WHEN cmd = 'ALL' THEN 'Todas as operações'
    ELSE 'Operação específica'
  END as funcionalidade
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('blog_posts', 'campaign_leads', 'bulk_campaigns', 'analytics_events', 'system_logs')
ORDER BY tablename, cmd;

-- =====================================================
-- ANÁLISE 2: IMPACTO DA REMOÇÃO DE ÍNDICES DUPLICADOS
-- =====================================================

-- 2.1 Verificar índices duplicados
SELECT 
  'ÍNDICES DUPLICADOS IDENTIFICADOS' as categoria,
  schemaname as schema,
  tablename as tabela,
  indexname as indice,
  indexdef as definicao,
  'Será removido' as acao,
  'IMPACTO: Nenhum - Índice redundante' as impacto
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename = 'user_subscriptions'
  AND indexname IN ('unique_active_subscription_per_user', 'unique_active_subscription_per_user_idx')
ORDER BY indexname;

-- 2.2 Verificar se há dependências
SELECT 
  'DEPENDÊNCIAS DE ÍNDICES' as categoria,
  schemaname as schema,
  tablename as tabela,
  indexname as indice,
  'Verificar se há constraints dependentes' as verificacao
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename = 'user_subscriptions'
  AND indexname = 'unique_active_subscription_per_user_idx';

-- =====================================================
-- ANÁLISE 3: IMPACTO DAS VIEWS RECRIADAS
-- =====================================================

-- 3.1 Verificar views existentes
SELECT 
  'VIEWS EXISTENTES' as categoria,
  schemaname as schema,
  viewname as view,
  'Será recriada sem SECURITY DEFINER' as acao,
  'IMPACTO: Baixo - Mesma funcionalidade' as impacto
FROM pg_views 
WHERE schemaname = 'public'
  AND viewname IN ('category_performance', 'campaign_leads_view', 'user_profiles_complete', 'campaign_metrics_summary')
ORDER BY viewname;

-- 3.2 Verificar dependências das views
SELECT 
  'DEPENDÊNCIAS DE VIEWS' as categoria,
  'Verificar se há aplicações que dependem dessas views' as verificacao,
  'Testar queries após recriação' as recomendacao;

-- =====================================================
-- ANÁLISE 4: IMPACTO DO RLS HABILITADO
-- =====================================================

-- 4.1 Verificar tabelas sem RLS
SELECT 
  'TABELAS SEM RLS' as categoria,
  tablename as tabela,
  'RLS será habilitado' as acao,
  'IMPACTO: Alto - Pode afetar acesso' as impacto,
  'Criar políticas básicas' as recomendacao
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('subscription_changes', 'upgrade_pending', 'campaign_leads_backup', 'user_payment_subscriptions')
  AND rowsecurity = false
ORDER BY tablename;

-- 4.2 Verificar se há dados nessas tabelas
DO $$
DECLARE
    table_name text;
    record_count integer;
BEGIN
    FOR table_name IN SELECT unnest(ARRAY['subscription_changes', 'upgrade_pending', 'campaign_leads_backup', 'user_payment_subscriptions']) LOOP
        BEGIN
            EXECUTE format('SELECT COUNT(*) FROM public.%I', table_name) INTO record_count;
            RAISE NOTICE 'Tabela % tem % registros', table_name, record_count;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Tabela % não existe ou erro: %', table_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- =====================================================
-- ANÁLISE 5: RECOMENDAÇÕES DE TESTE
-- =====================================================

-- 5.1 Lista de testes recomendados
SELECT 
  'TESTES RECOMENDADOS' as categoria,
  'Teste 1' as teste,
  'Verificar acesso às tabelas com políticas consolidadas' as descricao
UNION ALL
SELECT 
  'TESTES RECOMENDADOS' as categoria,
  'Teste 2' as teste,
  'Testar performance das queries após consolidação' as descricao
UNION ALL
SELECT 
  'TESTES RECOMENDADOS' as categoria,
  'Teste 3' as teste,
  'Verificar se as views recriadas funcionam corretamente' as descricao
UNION ALL
SELECT 
  'TESTES RECOMENDADOS' as categoria,
  'Teste 4' as teste,
  'Testar acesso às tabelas com RLS habilitado' as descricao
UNION ALL
SELECT 
  'TESTES RECOMENDADOS' as categoria,
  'Teste 5' as teste,
  'Verificar se não há regressões nas funcionalidades' as descricao;

-- =====================================================
-- ANÁLISE 6: RISCOS IDENTIFICADOS
-- =====================================================

-- 6.1 Riscos de alta prioridade
SELECT 
  'RISCOS ALTA PRIORIDADE' as categoria,
  'RLS habilitado em tabelas públicas' as risco,
  'Pode bloquear acesso se políticas estiverem incorretas' as descricao,
  'Testar imediatamente após aplicação' as mitigacao
UNION ALL
SELECT 
  'RISCOS ALTA PRIORIDADE' as categoria,
  'Views recriadas' as risco,
  'Pode quebrar queries dependentes' as descricao,
  'Verificar aplicações que usam essas views' as mitigacao;

-- 6.2 Riscos de baixa prioridade
SELECT 
  'RISCOS BAIXA PRIORIDADE' as categoria,
  'Políticas consolidadas' as risco,
  'Mesma funcionalidade, baixo risco' as descricao,
  'Monitorar performance' as mitigacao
UNION ALL
SELECT 
  'RISCOS BAIXA PRIORIDADE' as categoria,
  'Índices duplicados removidos' as risco,
  'Nenhum impacto funcional' as descricao,
  'Nenhuma ação necessária' as mitigacao;

-- =====================================================
-- RESUMO DA ANÁLISE
-- =====================================================

-- Resumo geral
SELECT 
  'RESUMO DA ANÁLISE' as categoria,
  'Total de tabelas afetadas' as metrica_1,
  (SELECT COUNT(*) FROM (
    SELECT tablename 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND permissive = 'PERMISSIVE'
    GROUP BY tablename
    HAVING COUNT(*) > 1
  ) as affected_tables) as valor_1
UNION ALL
SELECT 
  'RESUMO DA ANÁLISE' as categoria,
  'Total de views recriadas' as metrica_2,
  4 as valor_2
UNION ALL
SELECT 
  'RESUMO DA ANÁLISE' as categoria,
  'Total de tabelas com RLS habilitado' as metrica_3,
  4 as valor_3
UNION ALL
SELECT 
  'RESUMO DA ANÁLISE' as categoria,
  'Total de índices duplicados removidos' as metrica_4,
  1 as valor_4;

-- Recomendação final
SELECT 
  'RECOMENDAÇÃO FINAL' as categoria,
  'Aplicar correções em ambiente de teste primeiro' as recomendacao_1,
  'Executar todos os testes recomendados' as recomendacao_2,
  'Monitorar performance após aplicação' as recomendacao_3,
  'Ter plano de rollback pronto' as recomendacao_4;
