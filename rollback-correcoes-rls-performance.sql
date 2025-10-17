-- =====================================================
-- ROLLBACK DAS CORREÇÕES RLS PERFORMANCE
-- =====================================================
-- Este script reverte as correções de performance RLS
-- Restaura auth.uid() original (sem select)
-- 
-- ⚠️  ATENÇÃO: Execute apenas se necessário
-- =====================================================

-- =====================================================
-- ROLLBACK 1: Restaurar políticas com user_id
-- =====================================================
DO $$
DECLARE
    tbl_name text;
BEGIN
    -- Lista de tabelas que foram corrigidas
    FOR tbl_name IN SELECT unnest(ARRAY[
        'lead_lists',
        'whatsapp_templates', 
        'contact_attempts',
        'user_preferences',
        'whatsapp_instances',
        'bulk_campaigns',
        'analytics_events',
        'system_logs',
        'user_tags',
        'whatsapp_responses',
        'sales_conversions',
        'message_templates',
        'lead_quality_scores'
    ]) LOOP
        
        -- Verificar se a tabela existe
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl_name) THEN
            
            -- Restaurar políticas de visualização
            EXECUTE format('DROP POLICY IF EXISTS "Users can view own %s" ON public.%I', tbl_name, tbl_name);
            EXECUTE format('CREATE POLICY "Users can view own %s" ON public.%I FOR SELECT USING (user_id = auth.uid())', tbl_name, tbl_name);
            
            -- Restaurar políticas de inserção
            EXECUTE format('DROP POLICY IF EXISTS "Users can insert own %s" ON public.%I', tbl_name, tbl_name);
            EXECUTE format('CREATE POLICY "Users can insert own %s" ON public.%I FOR INSERT WITH CHECK (user_id = auth.uid())', tbl_name, tbl_name);
            
            -- Restaurar políticas de atualização
            EXECUTE format('DROP POLICY IF EXISTS "Users can update own %s" ON public.%I', tbl_name, tbl_name);
            EXECUTE format('CREATE POLICY "Users can update own %s" ON public.%I FOR UPDATE USING (user_id = auth.uid())', tbl_name, tbl_name);
            
            -- Restaurar políticas de exclusão
            EXECUTE format('DROP POLICY IF EXISTS "Users can delete own %s" ON public.%I', tbl_name, tbl_name);
            EXECUTE format('CREATE POLICY "Users can delete own %s" ON public.%I FOR DELETE USING (user_id = auth.uid())', tbl_name, tbl_name);
            
            -- Restaurar políticas de gerenciamento geral
            EXECUTE format('DROP POLICY IF EXISTS "Users can manage own %s" ON public.%I', tbl_name, tbl_name);
            EXECUTE format('CREATE POLICY "Users can manage own %s" ON public.%I FOR ALL USING (user_id = auth.uid())', tbl_name, tbl_name);
            
            RAISE NOTICE 'Políticas RLS restauradas para tabela: %', tbl_name;
            
        ELSE
            RAISE NOTICE 'Tabela % não existe - pulando', tbl_name;
        END IF;
        
    END LOOP;
END $$;

-- =====================================================
-- ROLLBACK 2: Restaurar blog_posts
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'blog_posts') THEN
        
        -- Restaurar política de admin para blog_posts
        EXECUTE 'DROP POLICY IF EXISTS "Admins podem gerenciar todos os posts" ON public.blog_posts';
        EXECUTE 'CREATE POLICY "Admins podem gerenciar todos os posts" ON public.blog_posts FOR ALL USING (author_id = auth.uid())';
        
        RAISE NOTICE 'Política RLS restaurada para blog_posts';
        
    ELSE
        RAISE NOTICE 'Tabela blog_posts não existe - pulando';
    END IF;
END $$;

-- =====================================================
-- ROLLBACK 3: Restaurar campaign_leads
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_leads') THEN
        
        -- Restaurar políticas de campaign_leads
        EXECUTE 'DROP POLICY IF EXISTS "Users can view leads from own campaigns" ON public.campaign_leads';
        EXECUTE 'CREATE POLICY "Users can view leads from own campaigns" ON public.campaign_leads FOR SELECT USING (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = auth.uid()))';
        
        EXECUTE 'DROP POLICY IF EXISTS "Users can insert leads in own campaigns" ON public.campaign_leads';
        EXECUTE 'CREATE POLICY "Users can insert leads in own campaigns" ON public.campaign_leads FOR INSERT WITH CHECK (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = auth.uid()))';
        
        EXECUTE 'DROP POLICY IF EXISTS "Users can update leads in own campaigns" ON public.campaign_leads';
        EXECUTE 'CREATE POLICY "Users can update leads in own campaigns" ON public.campaign_leads FOR UPDATE USING (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = auth.uid()))';
        
        EXECUTE 'DROP POLICY IF EXISTS "Users can delete leads from own campaigns" ON public.campaign_leads';
        EXECUTE 'CREATE POLICY "Users can delete leads from own campaigns" ON public.campaign_leads FOR DELETE USING (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = auth.uid()))';
        
        RAISE NOTICE 'Políticas RLS restauradas para campaign_leads';
        
    ELSE
        RAISE NOTICE 'Tabela campaign_leads não existe - pulando';
    END IF;
END $$;

-- =====================================================
-- VERIFICAÇÃO DO ROLLBACK
-- =====================================================
-- Mostrar quantas políticas foram restauradas
SELECT 
    'Políticas RLS restauradas' as status,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public'
AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
AND (qual NOT LIKE '%(select auth.uid())%' AND with_check NOT LIKE '%(select auth.uid())%');

-- Mostrar quantas políticas ainda estão corrigidas
SELECT 
    'Políticas RLS ainda corrigidas' as status,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public'
AND (qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%');

-- =====================================================
-- LIMPEZA (opcional)
-- =====================================================
-- Descomente as linhas abaixo se quiser remover o backup
-- DROP TABLE IF EXISTS backup_policies_rls_performance;











