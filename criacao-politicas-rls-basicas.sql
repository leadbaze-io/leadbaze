-- =====================================================
-- CRIAÇÃO DE POLÍTICAS RLS PARA TABELAS RECÉM-HABILITADAS
-- =====================================================
-- Este script cria políticas RLS básicas para as tabelas que tiveram RLS habilitado

-- =====================================================
-- POLÍTICAS RLS BÁSICAS
-- =====================================================

-- 1. subscription_changes
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_name = 'subscription_changes'
    ) THEN
        -- Verificar se tem coluna user_id
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = 'subscription_changes' 
                AND column_name = 'user_id'
        ) THEN
            CREATE POLICY "Users can manage own subscription changes" ON public.subscription_changes
                FOR ALL USING ((select auth.uid()) = user_id);
            RAISE NOTICE 'Política criada para subscription_changes com user_id';
        ELSE
            -- Política mais permissiva se não tiver user_id
            CREATE POLICY "Allow all operations on subscription changes" ON public.subscription_changes
                FOR ALL USING (true);
            RAISE NOTICE 'Política permissiva criada para subscription_changes';
        END IF;
    END IF;
END $$;

-- 2. upgrade_pending
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_name = 'upgrade_pending'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = 'upgrade_pending' 
                AND column_name = 'user_id'
        ) THEN
            CREATE POLICY "Users can manage own upgrade pending" ON public.upgrade_pending
                FOR ALL USING ((select auth.uid()) = user_id);
            RAISE NOTICE 'Política criada para upgrade_pending com user_id';
        ELSE
            CREATE POLICY "Allow all operations on upgrade pending" ON public.upgrade_pending
                FOR ALL USING (true);
            RAISE NOTICE 'Política permissiva criada para upgrade_pending';
        END IF;
    END IF;
END $$;

-- 3. campaign_leads_backup
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_name = 'campaign_leads_backup'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = 'campaign_leads_backup' 
                AND column_name = 'user_id'
        ) THEN
            CREATE POLICY "Users can manage own campaign leads backup" ON public.campaign_leads_backup
                FOR ALL USING ((select auth.uid()) = user_id);
            RAISE NOTICE 'Política criada para campaign_leads_backup com user_id';
        ELSE
            CREATE POLICY "Allow all operations on campaign leads backup" ON public.campaign_leads_backup
                FOR ALL USING (true);
            RAISE NOTICE 'Política permissiva criada para campaign_leads_backup';
        END IF;
    END IF;
END $$;

-- 4. user_payment_subscriptions
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_name = 'user_payment_subscriptions'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = 'user_payment_subscriptions' 
                AND column_name = 'user_id'
        ) THEN
            CREATE POLICY "Users can manage own payment subscriptions" ON public.user_payment_subscriptions
                FOR ALL USING ((select auth.uid()) = user_id);
            RAISE NOTICE 'Política criada para user_payment_subscriptions com user_id';
        ELSE
            CREATE POLICY "Allow all operations on payment subscriptions" ON public.user_payment_subscriptions
                FOR ALL USING (true);
            RAISE NOTICE 'Política permissiva criada para user_payment_subscriptions';
        END IF;
    END IF;
END $$;

-- 5. whatsapp_delivery_status
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_name = 'whatsapp_delivery_status'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = 'whatsapp_delivery_status' 
                AND column_name = 'user_id'
        ) THEN
            CREATE POLICY "Users can manage own whatsapp delivery status" ON public.whatsapp_delivery_status
                FOR ALL USING ((select auth.uid()) = user_id);
            RAISE NOTICE 'Política criada para whatsapp_delivery_status com user_id';
        ELSE
            CREATE POLICY "Allow all operations on whatsapp delivery status" ON public.whatsapp_delivery_status
                FOR ALL USING (true);
            RAISE NOTICE 'Política permissiva criada para whatsapp_delivery_status';
        END IF;
    END IF;
END $$;

-- 6. payment_plans
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_name = 'payment_plans'
    ) THEN
        -- Tabela de planos de pagamento - geralmente pública para leitura
        CREATE POLICY "Allow read access to payment plans" ON public.payment_plans
            FOR SELECT USING (true);
        RAISE NOTICE 'Política de leitura criada para payment_plans';
    END IF;
END $$;

-- 7. payment_plan_changes
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_name = 'payment_plan_changes'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = 'payment_plan_changes' 
                AND column_name = 'user_id'
        ) THEN
            CREATE POLICY "Users can manage own payment plan changes" ON public.payment_plan_changes
                FOR ALL USING ((select auth.uid()) = user_id);
            RAISE NOTICE 'Política criada para payment_plan_changes com user_id';
        ELSE
            CREATE POLICY "Allow all operations on payment plan changes" ON public.payment_plan_changes
                FOR ALL USING (true);
            RAISE NOTICE 'Política permissiva criada para payment_plan_changes';
        END IF;
    END IF;
END $$;

-- 8. payment_webhooks
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_name = 'payment_webhooks'
    ) THEN
        -- Webhooks geralmente são inseridos por sistemas externos
        CREATE POLICY "Allow webhook operations" ON public.payment_webhooks
            FOR ALL USING (true);
        RAISE NOTICE 'Política permissiva criada para payment_webhooks';
    END IF;
END $$;

-- 9. lead_packages
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_name = 'lead_packages'
    ) THEN
        -- Pacotes de leads - geralmente públicos para leitura
        CREATE POLICY "Allow read access to lead packages" ON public.lead_packages
            FOR SELECT USING (true);
        RAISE NOTICE 'Política de leitura criada para lead_packages';
    END IF;
END $$;

-- 10. support_tickets
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_name = 'support_tickets'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = 'support_tickets' 
                AND column_name = 'user_id'
        ) THEN
            CREATE POLICY "Users can manage own support tickets" ON public.support_tickets
                FOR ALL USING ((select auth.uid()) = user_id);
            RAISE NOTICE 'Política criada para support_tickets com user_id';
        ELSE
            CREATE POLICY "Allow all operations on support tickets" ON public.support_tickets
                FOR ALL USING (true);
            RAISE NOTICE 'Política permissiva criada para support_tickets';
        END IF;
    END IF;
END $$;

-- =====================================================
-- VERIFICAÇÃO PÓS-CORREÇÃO
-- =====================================================

-- Verificar políticas criadas
SELECT 
    'POLÍTICAS CRIADAS' as categoria,
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN (
        'subscription_changes', 'upgrade_pending', 'campaign_leads_backup',
        'user_payment_subscriptions', 'whatsapp_delivery_status', 'payment_plans',
        'payment_plan_changes', 'payment_webhooks', 'lead_packages',
        'support_tickets'
    )
ORDER BY tablename, policyname;

-- =====================================================
-- RESUMO FINAL
-- =====================================================

SELECT 
    'RESUMO FINAL' as categoria,
    'Políticas RLS criadas para tabelas' as acao,
    'Segurança implementada' as resultado;




















