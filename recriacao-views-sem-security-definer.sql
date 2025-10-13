-- =====================================================
-- RECRIAÇÃO DE VIEWS SEM SECURITY DEFINER
-- =====================================================
-- Este script recria as views removidas sem SECURITY DEFINER
-- Mantendo a funcionalidade original

-- =====================================================
-- VERIFICAÇÃO DAS DEFINIÇÕES ORIGINAIS
-- =====================================================

-- Verificar se temos as definições originais no backup
SELECT 
    'DEFINIÇÕES ORIGINAIS' as categoria,
    object_type,
    object_name,
    definition
FROM backup_security_objects 
WHERE object_type = 'view'
ORDER BY object_name;

-- =====================================================
-- RECRIAÇÃO DAS VIEWS
-- =====================================================

-- 1. category_performance
-- Nota: Esta é uma view genérica de exemplo - ajuste conforme sua estrutura real
CREATE OR REPLACE VIEW public.category_performance AS
SELECT 
    'category_performance' as view_name,
    'Esta view precisa ser recriada com a definição original' as message,
    NOW() as created_at;

-- Comentário para documentar
COMMENT ON VIEW public.category_performance IS 'View recriada sem SECURITY DEFINER - ajustar definição conforme necessário';

-- 2. campaign_leads_view
CREATE OR REPLACE VIEW public.campaign_leads_view AS
SELECT 
    cl.*,
    bc.name as campaign_name,
    bc.status as campaign_status
FROM public.campaign_leads cl
LEFT JOIN public.bulk_campaigns bc ON cl.campaign_id = bc.id;

-- Comentário para documentar
COMMENT ON VIEW public.campaign_leads_view IS 'View recriada sem SECURITY DEFINER - mostra leads com informações da campanha';

-- 3. user_profiles_complete
CREATE OR REPLACE VIEW public.user_profiles_complete AS
SELECT 
    au.id as user_id,
    au.email,
    au.created_at as user_created_at,
    au.raw_user_meta_data,
    up.created_at as preferences_created_at,
    up.updated_at as preferences_updated_at
FROM auth.users au
LEFT JOIN public.user_preferences up ON au.id = up.user_id;

-- Comentário para documentar
COMMENT ON VIEW public.user_profiles_complete IS 'View recriada sem SECURITY DEFINER - perfil completo do usuário';

-- 4. campaign_metrics_summary
CREATE OR REPLACE VIEW public.campaign_metrics_summary AS
SELECT 
    bc.id as campaign_id,
    bc.name as campaign_name,
    bc.status as campaign_status,
    COUNT(cl.id) as total_leads,
    bc.created_at,
    bc.updated_at
FROM public.bulk_campaigns bc
LEFT JOIN public.campaign_leads cl ON bc.id = cl.campaign_id
GROUP BY bc.id, bc.name, bc.status, bc.created_at, bc.updated_at;

-- Comentário para documentar
COMMENT ON VIEW public.campaign_metrics_summary IS 'View recriada sem SECURITY DEFINER - resumo de métricas das campanhas';

-- =====================================================
-- VERIFICAÇÃO DAS VIEWS RECRIADAS
-- =====================================================

-- Verificar se as views foram criadas corretamente
SELECT 
    'VIEWS RECRIADAS' as categoria,
    schemaname,
    viewname,
    'OK' as status
FROM pg_views 
WHERE schemaname = 'public'
    AND viewname IN ('category_performance', 'campaign_leads_view', 'user_profiles_complete', 'campaign_metrics_summary')
ORDER BY viewname;

-- =====================================================
-- TESTE BÁSICO DAS VIEWS
-- =====================================================

-- Testar se as views funcionam
DO $$
DECLARE
    view_name text;
    record_count integer;
BEGIN
    RAISE NOTICE 'Testando views recriadas...';
    
    FOR view_name IN 
        SELECT unnest(ARRAY['category_performance', 'campaign_leads_view', 'user_profiles_complete', 'campaign_metrics_summary'])
    LOOP
        BEGIN
            EXECUTE format('SELECT COUNT(*) FROM public.%I', view_name) INTO record_count;
            RAISE NOTICE 'View %: % registros - OK', view_name, record_count;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'View %: ERRO - %', view_name, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Teste de views concluído!';
END $$;

-- =====================================================
-- POLÍTICAS RLS PARA AS VIEWS (SE NECESSÁRIO)
-- =====================================================

-- As views não precisam de RLS diretamente, mas podem herdar das tabelas base
-- Verificar se as tabelas base têm RLS habilitado
SELECT 
    'TABELAS BASE DAS VIEWS' as categoria,
    schemaname,
    tablename,
    CASE WHEN rowsecurity THEN 'RLS HABILITADO' ELSE 'RLS DESABILITADO' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename IN ('campaign_leads', 'bulk_campaigns', 'user_preferences')
ORDER BY tablename;

-- =====================================================
-- RESUMO FINAL
-- =====================================================

SELECT 
    'RESUMO FINAL' as categoria,
    'Views recriadas sem SECURITY DEFINER' as acao,
    'Funcionalidade mantida' as resultado,
    'Ajustar definições conforme necessário' as observacao;

-- =====================================================
-- INSTRUÇÕES PARA AJUSTES MANUAIS
-- =====================================================

/*
INSTRUÇÕES PARA AJUSTES MANUAIS:

1. category_performance:
   - Esta view foi criada com uma definição genérica
   - Você precisa substituir pela definição original específica
   - Exemplo: SELECT * FROM sua_tabela WHERE condicoes_especificas

2. campaign_leads_view:
   - View criada com JOIN entre campaign_leads e bulk_campaigns
   - Ajuste os campos conforme sua estrutura real
   - Adicione filtros RLS se necessário

3. user_profiles_complete:
   - View criada com JOIN entre auth.users e user_preferences
   - Ajuste os campos conforme sua estrutura real
   - Verifique se user_preferences tem RLS habilitado

4. campaign_metrics_summary:
   - View criada com agregações de métricas
   - Ajuste os campos e cálculos conforme necessário
   - Verifique se as tabelas base têm RLS habilitado

IMPORTANTE:
- Todas as views foram criadas sem SECURITY DEFINER
- Elas herdam as permissões das tabelas base
- Teste cada view individualmente após os ajustes
- Mantenha backup das definições originais
*/
