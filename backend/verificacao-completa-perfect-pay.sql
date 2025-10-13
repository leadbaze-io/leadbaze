-- =====================================================
-- VERIFICAÇÃO COMPLETA PERFECT PAY - BANCO DE DADOS
-- =====================================================
-- Este script verifica o estado atual das assinaturas
-- e pacotes no banco de dados
-- =====================================================

DO $$
DECLARE
    result RECORD;
    total_subscriptions INTEGER;
    total_packages INTEGER;
    total_transactions INTEGER;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'VERIFICAÇÃO COMPLETA PERFECT PAY - BANCO DE DADOS';
    RAISE NOTICE '=====================================================';
    
    -- =====================================================
    -- 1. VERIFICAR TABELAS ESSENCIAIS
    -- =====================================================
    RAISE NOTICE '';
    RAISE NOTICE '1️⃣ VERIFICANDO TABELAS ESSENCIAIS';
    RAISE NOTICE '================================';
    
    -- Verificar se as tabelas existem
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_payment_subscriptions') THEN
        RAISE NOTICE '✅ Tabela user_payment_subscriptions: EXISTE';
    ELSE
        RAISE NOTICE '❌ Tabela user_payment_subscriptions: NÃO EXISTE';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lead_packages') THEN
        RAISE NOTICE '✅ Tabela lead_packages: EXISTE';
    ELSE
        RAISE NOTICE '❌ Tabela lead_packages: NÃO EXISTE';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_transactions') THEN
        RAISE NOTICE '✅ Tabela payment_transactions: EXISTE';
    ELSE
        RAISE NOTICE '❌ Tabela payment_transactions: NÃO EXISTE';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_plans') THEN
        RAISE NOTICE '✅ Tabela subscription_plans: EXISTE';
    ELSE
        RAISE NOTICE '❌ Tabela subscription_plans: NÃO EXISTE';
    END IF;
    
    -- =====================================================
    -- 2. VERIFICAR PLANOS DE ASSINATURA
    -- =====================================================
    RAISE NOTICE '';
    RAISE NOTICE '2️⃣ VERIFICANDO PLANOS DE ASSINATURA';
    RAISE NOTICE '===================================';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_plans') THEN
        SELECT COUNT(*) INTO total_subscriptions FROM subscription_plans WHERE active = true;
        RAISE NOTICE '📊 Total de planos ativos: %', total_subscriptions;
        
        FOR result IN 
            SELECT name, price_cents, leads, perfect_pay_code, checkout_url
            FROM subscription_plans 
            WHERE active = true
            ORDER BY price_cents
        LOOP
            RAISE NOTICE '   📋 %: R$ %.2f (% leads) - Código: %', 
                result.name, 
                (result.price_cents / 100.0), 
                result.leads,
                result.perfect_pay_code;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ Tabela subscription_plans não existe';
    END IF;
    
    -- =====================================================
    -- 3. VERIFICAR PACOTES DE LEADS
    -- =====================================================
    RAISE NOTICE '';
    RAISE NOTICE '3️⃣ VERIFICANDO PACOTES DE LEADS';
    RAISE NOTICE '===============================';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lead_packages') THEN
        SELECT COUNT(*) INTO total_packages FROM lead_packages WHERE active = true;
        RAISE NOTICE '📦 Total de pacotes ativos: %', total_packages;
        
        FOR result IN 
            SELECT name, leads, price_cents, perfect_pay_code
            FROM lead_packages 
            WHERE active = true
            ORDER BY price_cents
        LOOP
            RAISE NOTICE '   📦 %: R$ %.2f (% leads) - Código: %', 
                result.name, 
                (result.price_cents / 100.0), 
                result.leads,
                result.perfect_pay_code;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ Tabela lead_packages não existe';
    END IF;
    
    -- =====================================================
    -- 4. VERIFICAR ASSINATURAS ATIVAS
    -- =====================================================
    RAISE NOTICE '';
    RAISE NOTICE '4️⃣ VERIFICANDO ASSINATURAS ATIVAS';
    RAISE NOTICE '==================================';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_payment_subscriptions') THEN
        SELECT COUNT(*) INTO total_subscriptions FROM user_payment_subscriptions WHERE status = 'active';
        RAISE NOTICE '👥 Total de assinaturas ativas: %', total_subscriptions;
        
        FOR result IN 
            SELECT user_id, plan_name, status, leads_balance, next_billing_date
            FROM user_payment_subscriptions 
            WHERE status = 'active'
            ORDER BY created_at DESC
            LIMIT 5
        LOOP
            RAISE NOTICE '   👤 Usuário: % | Plano: % | Status: % | Leads: % | Próxima cobrança: %', 
                result.user_id, 
                result.plan_name, 
                result.status, 
                result.leads_balance,
                result.next_billing_date;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ Tabela user_payment_subscriptions não existe';
    END IF;
    
    -- =====================================================
    -- 5. VERIFICAR TRANSAÇÕES RECENTES
    -- =====================================================
    RAISE NOTICE '';
    RAISE NOTICE '5️⃣ VERIFICANDO TRANSAÇÕES RECENTES';
    RAISE NOTICE '===================================';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_transactions') THEN
        SELECT COUNT(*) INTO total_transactions FROM payment_transactions WHERE created_at >= NOW() - INTERVAL '7 days';
        RAISE NOTICE '💳 Total de transações (últimos 7 dias): %', total_transactions;
        
        FOR result IN 
            SELECT transaction_id, user_id, amount_cents, status, transaction_type, created_at
            FROM payment_transactions 
            WHERE created_at >= NOW() - INTERVAL '7 days'
            ORDER BY created_at DESC
            LIMIT 5
        LOOP
            RAISE NOTICE '   💰 ID: % | Usuário: % | Valor: R$ %.2f | Status: % | Tipo: % | Data: %', 
                result.transaction_id, 
                result.user_id, 
                (result.amount_cents / 100.0), 
                result.status,
                result.transaction_type,
                result.created_at;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ Tabela payment_transactions não existe';
    END IF;
    
    -- =====================================================
    -- 6. VERIFICAR USUÁRIO DE TESTE
    -- =====================================================
    RAISE NOTICE '';
    RAISE NOTICE '6️⃣ VERIFICANDO USUÁRIO DE TESTE';
    RAISE NOTICE '===============================';
    
    DECLARE
        test_user_id TEXT := '66875e05-eace-49ac-bf07-0e794dbab8fd';
        user_exists BOOLEAN := FALSE;
        user_subscription RECORD;
    BEGIN
        -- Verificar se usuário existe
        IF EXISTS (SELECT 1 FROM auth.users WHERE id = test_user_id) THEN
            RAISE NOTICE '✅ Usuário de teste existe: %', test_user_id;
            user_exists := TRUE;
        ELSE
            RAISE NOTICE '❌ Usuário de teste não encontrado: %', test_user_id;
        END IF;
        
        -- Verificar assinatura do usuário de teste
        IF user_exists AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_payment_subscriptions') THEN
            SELECT * INTO user_subscription 
            FROM user_payment_subscriptions 
            WHERE user_id = test_user_id 
            ORDER BY created_at DESC 
            LIMIT 1;
            
            IF FOUND THEN
                RAISE NOTICE '📋 Assinatura do usuário de teste:';
                RAISE NOTICE '   Plano: %', user_subscription.plan_name;
                RAISE NOTICE '   Status: %', user_subscription.status;
                RAISE NOTICE '   Leads disponíveis: %', user_subscription.leads_balance;
                RAISE NOTICE '   Próxima cobrança: %', user_subscription.next_billing_date;
            ELSE
                RAISE NOTICE 'ℹ️ Usuário de teste não possui assinatura';
            END IF;
        END IF;
    END;
    
    -- =====================================================
    -- 7. RESUMO FINAL
    -- =====================================================
    RAISE NOTICE '';
    RAISE NOTICE '7️⃣ RESUMO FINAL';
    RAISE NOTICE '===============';
    
    RAISE NOTICE '📊 ESTATÍSTICAS:';
    RAISE NOTICE '   - Planos de assinatura ativos: %', COALESCE(total_subscriptions, 0);
    RAISE NOTICE '   - Pacotes de leads ativos: %', COALESCE(total_packages, 0);
    RAISE NOTICE '   - Assinaturas ativas: %', COALESCE(total_subscriptions, 0);
    RAISE NOTICE '   - Transações (7 dias): %', COALESCE(total_transactions, 0);
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ VERIFICAÇÃO COMPLETA FINALIZADA';
    RAISE NOTICE '=====================================================';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ ERRO DURANTE VERIFICAÇÃO: %', SQLERRM;
        RAISE NOTICE '=====================================================';
END $$;
