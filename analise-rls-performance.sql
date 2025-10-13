-- ============================================================================
-- ANÁLISE DE ROW LEVEL SECURITY (RLS) E IMPACTO NA PERFORMANCE
-- Execute este script no SQL Editor do Supabase para análise completa de RLS
-- ============================================================================

-- 1. VERIFICAR STATUS DO RLS EM TODAS AS TABELAS
-- ============================================================================
SELECT 
  'STATUS RLS' as categoria,
  schemaname as schema,
  tablename as tabela,
  rowsecurity as rls_habilitado,
  CASE 
    WHEN rowsecurity THEN 'RLS ATIVO - POLÍTICAS APLICADAS'
    ELSE 'RLS DESABILITADO - SEM POLÍTICAS'
  END as status_rls
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. VERIFICAR POLÍTICAS RLS EXISTENTES
-- ============================================================================
SELECT 
  'POLÍTICAS RLS' as categoria,
  schemaname as schema,
  tablename as tabela,
  policyname as politica,
  permissive as tipo,
  roles as roles_aplicaveis,
  cmd as comando,
  qual as condicao_select,
  with_check as condicao_insert_update
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. ANÁLISE DE IMPACTO NA PERFORMANCE
-- ============================================================================

-- 3.1 Tabelas com RLS desabilitado (potencial problema de segurança)
SELECT 
  'RLS DESABILITADO' as categoria,
  tablename as tabela,
  'ATENÇÃO: SEM PROTEÇÃO RLS' as status,
  'Verificar se deve habilitar RLS' as recomendacao
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = false
ORDER BY tablename;

-- 3.2 Tabelas com RLS habilitado mas sem políticas
SELECT 
  'RLS SEM POLÍTICAS' as categoria,
  t.tablename as tabela,
  'RLS ATIVO MAS SEM POLÍTICAS' as status,
  'Criar políticas ou desabilitar RLS' as recomendacao
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public' 
  AND t.rowsecurity = true
  AND p.tablename IS NULL
ORDER BY t.tablename;

-- 4. VERIFICAR POLÍTICAS POR TABELA PRINCIPAL
-- ============================================================================

-- 4.1 Políticas para lead_lists
SELECT 
  'POLÍTICAS LEAD_LISTS' as categoria,
  policyname as politica,
  cmd as comando,
  qual as condicao,
  'Verificar performance' as observacao
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'lead_lists'
ORDER BY policyname;

-- 4.2 Políticas para contact_attempts
SELECT 
  'POLÍTICAS CONTACT_ATTEMPTS' as categoria,
  policyname as politica,
  cmd as comando,
  qual as condicao,
  'Verificar performance' as observacao
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'contact_attempts'
ORDER BY policyname;

-- 4.3 Políticas para whatsapp_instances
SELECT 
  'POLÍTICAS WHATSAPP_INSTANCES' as categoria,
  policyname as politica,
  cmd as comando,
  qual as condicao,
  'Verificar performance' as observacao
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'whatsapp_instances'
ORDER BY policyname;

-- 5. ANÁLISE DE PERFORMANCE COM RLS
-- ============================================================================

-- 5.1 Testar performance de consulta com RLS
EXPLAIN (ANALYZE, BUFFERS) 
SELECT COUNT(*) FROM public.lead_lists 
WHERE user_id = auth.uid();

-- 5.2 Verificar se RLS está impactando performance
SELECT 
  'IMPACTO RLS' as categoria,
  'lead_lists' as tabela,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lead_lists' AND schemaname = 'public') 
    THEN 'RLS ATIVO - PODE IMPACTAR PERFORMANCE'
    ELSE 'RLS DESABILITADO - SEM IMPACTO'
  END as status_performance
FROM pg_tables 
WHERE tablename = 'lead_lists' AND schemaname = 'public';

-- 6. RECOMENDAÇÕES DE OTIMIZAÇÃO PARA RLS
-- ============================================================================

-- 6.1 Verificar se políticas RLS estão otimizadas
SELECT 
  'OTIMIZAÇÃO RLS' as categoria,
  tablename as tabela,
  policyname as politica,
  CASE 
    WHEN qual LIKE '%auth.uid()%' THEN 'POLÍTICA OTIMIZADA - USA auth.uid()'
    WHEN qual LIKE '%user_id%' THEN 'POLÍTICA PODE SER OTIMIZADA'
    ELSE 'VERIFICAR POLÍTICA'
  END as status_otimizacao,
  qual as condicao_atual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 7. SCRIPT PARA HABILITAR RLS (SE NECESSÁRIO)
-- ============================================================================

-- 7.1 Habilitar RLS em tabelas que não têm
-- (Execute apenas se necessário)
-- ALTER TABLE public.lead_lists ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.contact_attempts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- 7.2 Criar políticas RLS otimizadas (se não existirem)
-- (Execute apenas se necessário)

-- Política para lead_lists
-- CREATE POLICY "Users can manage own lead_lists" ON public.lead_lists
--     FOR ALL USING (auth.uid() = user_id);

-- Política para contact_attempts
-- CREATE POLICY "Users can manage own contact_attempts" ON public.contact_attempts
--     FOR ALL USING (auth.uid() = user_id);

-- Política para whatsapp_instances
-- CREATE POLICY "Users can manage own whatsapp_instances" ON public.whatsapp_instances
--     FOR ALL USING (auth.uid() = user_id);

-- Política para user_preferences
-- CREATE POLICY "Users can manage own user_preferences" ON public.user_preferences
--     FOR ALL USING (auth.uid() = user_id);

-- Política para whatsapp_templates
-- CREATE POLICY "Users can manage own whatsapp_templates" ON public.whatsapp_templates
--     FOR ALL USING (auth.uid() = user_id);

-- 8. VERIFICAR IMPACTO DOS ÍNDICES COM RLS
-- ============================================================================

-- 8.1 Verificar se índices estão sendo usados com RLS
SELECT 
  'ÍNDICES COM RLS' as categoria,
  schemaname as schema,
  relname as tabela,
  indexrelname as indice,
  idx_scan as scans_executados,
  CASE 
    WHEN idx_scan = 0 THEN 'ÍNDICE NÃO UTILIZADO'
    WHEN idx_scan < 10 THEN 'BAIXO USO'
    WHEN idx_scan < 100 THEN 'MÉDIO USO'
    ELSE 'ALTO USO'
  END as status_uso
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY relname, idx_scan DESC;

-- 9. RESUMO FINAL - RLS E PERFORMANCE
-- ============================================================================

-- 9.1 Resumo do status RLS
SELECT 
  'RESUMO RLS' as categoria,
  COUNT(*) as total_tabelas,
  COUNT(CASE WHEN rowsecurity THEN 1 END) as tabelas_com_rls,
  COUNT(CASE WHEN NOT rowsecurity THEN 1 END) as tabelas_sem_rls
FROM pg_tables 
WHERE schemaname = 'public';

-- 9.2 Resumo de políticas
SELECT 
  'RESUMO POLÍTICAS' as categoria,
  COUNT(*) as total_politicas,
  COUNT(DISTINCT tablename) as tabelas_com_politicas
FROM pg_policies 
WHERE schemaname = 'public';

-- ============================================================================
-- RECOMENDAÇÕES BASEADAS NA ANÁLISE DE RLS:
-- ============================================================================
-- 
-- 1. TABELAS SEM RLS:
--    - Verificar se é intencional
--    - Considerar habilitar RLS para segurança
--    - Criar políticas otimizadas
-- 
-- 2. TABELAS COM RLS SEM POLÍTICAS:
--    - Criar políticas ou desabilitar RLS
--    - Políticas vazias bloqueiam todas as consultas
-- 
-- 3. POLÍTICAS OTIMIZADAS:
--    - Usar auth.uid() = user_id para melhor performance
--    - Evitar funções complexas nas políticas
--    - Testar performance das políticas
-- 
-- 4. ÍNDICES COM RLS:
--    - RLS pode impactar uso dos índices
--    - Monitorar performance das consultas
--    - Ajustar políticas se necessário
-- 
-- 5. SEGURANÇA:
--    - RLS desabilitado = risco de segurança
--    - RLS sem políticas = bloqueia tudo
--    - Políticas mal escritas = vulnerabilidades
-- ============================================================================
