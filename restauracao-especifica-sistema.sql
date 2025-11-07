-- =====================================================
-- RESTAURAÇÃO ESPECÍFICA BASEADA NO DIAGNÓSTICO
-- =====================================================
-- Este script restaura apenas o que está realmente quebrado
-- Execute o diagnóstico primeiro para identificar os problemas
-- =====================================================

-- =====================================================
-- RESTAURAÇÃO 1: Habilitar RLS apenas nas tabelas que precisam
-- =====================================================
DO $$
DECLARE
    tbl_name text;
BEGIN
    -- Lista de tabelas que devem ter RLS habilitado
    FOR tbl_name IN SELECT unnest(ARRAY[
        'lead_lists', 'whatsapp_templates', 'contact_attempts', 
        'user_preferences', 'whatsapp_instances', 'bulk_campaigns',
        'analytics_events', 'system_logs', 'user_tags', 'blog_posts',
        'campaign_leads', 'whatsapp_responses', 'sales_conversions',
        'message_templates', 'lead_quality_scores'
    ]) LOOP
        
        -- Verificar se a tabela existe e se RLS está desabilitado
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl_name) THEN
            IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl_name AND rowsecurity = false) THEN
                BEGIN
                    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl_name);
                    RAISE NOTICE 'RLS habilitado para: %', tbl_name;
                EXCEPTION
                    WHEN OTHERS THEN
                        RAISE NOTICE 'Erro ao habilitar RLS para %: %', tbl_name, SQLERRM;
                END;
            ELSE
                RAISE NOTICE 'RLS já habilitado para: %', tbl_name;
            END IF;
        ELSE
            RAISE NOTICE 'Tabela % não existe - pulando', tbl_name;
        END IF;
        
    END LOOP;
END $$;

-- =====================================================
-- RESTAURAÇÃO 2: Criar políticas apenas para tabelas sem políticas
-- =====================================================
DO $$
DECLARE
    tbl_name text;
BEGIN
    -- Lista de tabelas que devem ter políticas
    FOR tbl_name IN SELECT unnest(ARRAY[
        'lead_lists', 'whatsapp_templates', 'contact_attempts', 
        'user_preferences', 'whatsapp_instances', 'bulk_campaigns',
        'analytics_events', 'system_logs', 'user_tags', 'blog_posts',
        'campaign_leads', 'whatsapp_responses', 'sales_conversions',
        'message_templates', 'lead_quality_scores'
    ]) LOOP
        
        -- Verificar se a tabela existe e se não tem políticas
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl_name) THEN
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = tbl_name) THEN
                
                -- Criar política baseada no tipo de tabela
                IF tbl_name = 'blog_posts' THEN
                    -- blog_posts usa author_id
                    BEGIN
                        EXECUTE format('CREATE POLICY "Users can manage own %s" ON public.%I FOR ALL USING (author_id = auth.uid())', tbl_name, tbl_name);
                        RAISE NOTICE 'Política criada para % (author_id)', tbl_name;
                    EXCEPTION
                        WHEN OTHERS THEN
                            RAISE NOTICE 'Erro ao criar política para %: %', tbl_name, SQLERRM;
                    END;
                ELSIF tbl_name = 'campaign_leads' THEN
                    -- campaign_leads usa campaign_id
                    BEGIN
                        EXECUTE format('CREATE POLICY "Users can manage own %s" ON public.%I FOR ALL USING (campaign_id IN (SELECT id FROM bulk_campaigns WHERE user_id = auth.uid()))', tbl_name, tbl_name);
                        RAISE NOTICE 'Política criada para % (campaign_id)', tbl_name;
                    EXCEPTION
                        WHEN OTHERS THEN
                            RAISE NOTICE 'Erro ao criar política para %: %', tbl_name, SQLERRM;
                    END;
                ELSE
                    -- Outras tabelas usam user_id
                    BEGIN
                        EXECUTE format('CREATE POLICY "Users can manage own %s" ON public.%I FOR ALL USING (user_id = auth.uid())', tbl_name, tbl_name);
                        RAISE NOTICE 'Política criada para % (user_id)', tbl_name;
                    EXCEPTION
                        WHEN OTHERS THEN
                            RAISE NOTICE 'Erro ao criar política para %: %', tbl_name, SQLERRM;
                    END;
                END IF;
                
            ELSE
                RAISE NOTICE 'Políticas já existem para: %', tbl_name;
            END IF;
        ELSE
            RAISE NOTICE 'Tabela % não existe - pulando', tbl_name;
        END IF;
        
    END LOOP;
END $$;

-- =====================================================
-- RESTAURAÇÃO 3: Criar índices apenas para tabelas que precisam
-- =====================================================
DO $$
DECLARE
    tbl_name text;
BEGIN
    -- Lista de tabelas que devem ter índices
    FOR tbl_name IN SELECT unnest(ARRAY[
        'lead_lists', 'bulk_campaigns', 'analytics_events'
    ]) LOOP
        
        -- Verificar se a tabela existe
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl_name) THEN
            
            -- Criar índices específicos para cada tabela
            IF tbl_name = 'lead_lists' THEN
                BEGIN
                    CREATE INDEX IF NOT EXISTS idx_lead_lists_user_id ON public.lead_lists(user_id);
                    CREATE INDEX IF NOT EXISTS idx_lead_lists_created_at ON public.lead_lists(created_at DESC);
                    CREATE INDEX IF NOT EXISTS idx_lead_lists_status ON public.lead_lists(status);
                    CREATE INDEX IF NOT EXISTS idx_lead_lists_name ON public.lead_lists(name);
                    RAISE NOTICE 'Índices criados para lead_lists';
                EXCEPTION
                    WHEN OTHERS THEN
                        RAISE NOTICE 'Erro ao criar índices para lead_lists: %', SQLERRM;
                END;
            ELSIF tbl_name = 'bulk_campaigns' THEN
                BEGIN
                    CREATE INDEX IF NOT EXISTS idx_bulk_campaigns_user_id ON public.bulk_campaigns(user_id);
                    CREATE INDEX IF NOT EXISTS idx_bulk_campaigns_created_at ON public.bulk_campaigns(created_at DESC);
                    CREATE INDEX IF NOT EXISTS idx_bulk_campaigns_status ON public.bulk_campaigns(status);
                    RAISE NOTICE 'Índices criados para bulk_campaigns';
                EXCEPTION
                    WHEN OTHERS THEN
                        RAISE NOTICE 'Erro ao criar índices para bulk_campaigns: %', SQLERRM;
                END;
            ELSIF tbl_name = 'analytics_events' THEN
                BEGIN
                    CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
                    CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
                    CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
                    RAISE NOTICE 'Índices criados para analytics_events';
                EXCEPTION
                    WHEN OTHERS THEN
                        RAISE NOTICE 'Erro ao criar índices para analytics_events: %', SQLERRM;
                END;
            END IF;
            
        ELSE
            RAISE NOTICE 'Tabela % não existe - pulando', tbl_name;
        END IF;
        
    END LOOP;
END $$;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
-- Mostrar quantas tabelas têm RLS habilitado
SELECT 
    'RESTAURAÇÃO ESPECÍFICA CONCLUÍDA' as status,
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
);

-- Mostrar quantas políticas foram criadas
SELECT 
    'RESTAURAÇÃO ESPECÍFICA CONCLUÍDA' as status,
    'Políticas criadas' as tipo,
    COUNT(*) as total
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
    'lead_lists', 'whatsapp_templates', 'contact_attempts', 
    'user_preferences', 'whatsapp_instances', 'bulk_campaigns',
    'analytics_events', 'system_logs', 'user_tags', 'blog_posts',
    'campaign_leads', 'whatsapp_responses', 'sales_conversions',
    'message_templates', 'lead_quality_scores'
);

-- Mostrar quantos índices foram criados
SELECT 
    'RESTAURAÇÃO ESPECÍFICA CONCLUÍDA' as status,
    'Índices criados' as tipo,
    COUNT(*) as total
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
AND tablename IN (
    'lead_lists', 'bulk_campaigns', 'analytics_events'
);

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT 
    'RESTAURAÇÃO ESPECÍFICA CONCLUÍDA' as status,
    'Apenas o necessário foi restaurado' as mensagem,
    'Teste o sistema agora' as proximo_passo;




















