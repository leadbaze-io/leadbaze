-- =====================================================
-- TESTE DAS CORREÇÕES RLS PERFORMANCE
-- =====================================================
-- Este script testa se as correções de performance RLS funcionaram
-- Verifica se auth.uid() foi substituído por (select auth.uid())
-- =====================================================

-- =====================================================
-- TESTE 1: Verificar se as políticas foram corrigidas
-- =====================================================
SELECT 
    'Políticas com auth.uid() corrigido' as teste,
    COUNT(*) as total
FROM pg_policies 
WHERE schemaname = 'public'
AND (qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%');

-- =====================================================
-- TESTE 2: Verificar se ainda há auth.uid() não corrigido
-- =====================================================
SELECT 
    'Políticas com auth.uid() não corrigido' as teste,
    COUNT(*) as total
FROM pg_policies 
WHERE schemaname = 'public'
AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
AND (qual NOT LIKE '%(select auth.uid())%' AND with_check NOT LIKE '%(select auth.uid())%');

-- =====================================================
-- TESTE 3: Listar todas as políticas corrigidas
-- =====================================================
SELECT 
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    CASE 
        WHEN qual LIKE '%(select auth.uid())%' THEN 'USING corrigido'
        WHEN with_check LIKE '%(select auth.uid())%' THEN 'WITH CHECK corrigido'
        ELSE 'Não corrigido'
    END as status
FROM pg_policies 
WHERE schemaname = 'public'
AND (qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%')
ORDER BY tablename, policyname;

-- =====================================================
-- TESTE 4: Verificar se as tabelas principais têm políticas
-- =====================================================
SELECT 
    t.table_name as tabela,
    COUNT(p.policyname) as total_politicas,
    CASE 
        WHEN COUNT(p.policyname) > 0 THEN 'OK'
        ELSE 'SEM POLÍTICAS'
    END as status
FROM information_schema.tables t
LEFT JOIN pg_policies p ON t.table_name = p.tablename AND p.schemaname = 'public'
WHERE t.table_schema = 'public'
AND t.table_name IN (
    'lead_lists', 'whatsapp_templates', 'contact_attempts', 
    'user_preferences', 'whatsapp_instances', 'bulk_campaigns',
    'analytics_events', 'system_logs', 'user_tags', 'blog_posts',
    'campaign_leads', 'whatsapp_responses', 'sales_conversions',
    'message_templates', 'lead_quality_scores'
)
GROUP BY t.table_name
ORDER BY t.table_name;

-- =====================================================
-- TESTE 5: Verificar se RLS está habilitado nas tabelas
-- =====================================================
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_habilitado,
    CASE 
        WHEN rowsecurity THEN 'OK'
        ELSE 'RLS DESABILITADO'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
    'lead_lists', 'whatsapp_templates', 'contact_attempts', 
    'user_preferences', 'whatsapp_instances', 'bulk_campaigns',
    'analytics_events', 'system_logs', 'user_tags', 'blog_posts',
    'campaign_leads', 'whatsapp_responses', 'sales_conversions',
    'message_templates', 'lead_quality_scores'
)
ORDER BY tablename;

-- =====================================================
-- TESTE 6: Resumo das correções aplicadas
-- =====================================================
SELECT 
    'RESUMO DAS CORREÇÕES' as categoria,
    'Políticas corrigidas' as tipo,
    COUNT(*) as total
FROM pg_policies 
WHERE schemaname = 'public'
AND (qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%')

UNION ALL

SELECT 
    'RESUMO DAS CORREÇÕES' as categoria,
    'Tabelas com RLS habilitado' as tipo,
    COUNT(*) as total
FROM pg_tables 
WHERE schemaname = 'public'
AND rowsecurity = true
AND tablename IN (
    'lead_lists', 'whatsapp_templates', 'contact_attempts', 
    'user_preferences', 'whatsapp_instances', 'bulk_campaigns',
    'analytics_events', 'system_logs', 'user_tags', 'blog_posts',
    'campaign_leads', 'whatsapp_responses', 'sales_conversions',
    'message_templates', 'lead_quality_scores'
)

UNION ALL

SELECT 
    'RESUMO DAS CORREÇÕES' as categoria,
    'Backup criado' as tipo,
    COUNT(*) as total
FROM backup_policies_rls_performance;











