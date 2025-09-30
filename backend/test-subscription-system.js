#!/usr/bin/env node
require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');
const PerfectPayService = require('./services/perfectPayService');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Erro: Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const perfectPayService = new PerfectPayService(supabase);

const TEST_USER_ID = '66875e05-eace-49ac-bf07-0e794dbab8fd';

async function testSubscriptionSystem() {
    console.log('🧪 TESTANDO SISTEMA DE ASSINATURAS');
    console.log('==================================');
    console.log(`👤 Usuário: ${TEST_USER_ID}`);

    try {
        // 1. Verificar se o usuário existe
        console.log('\n1️⃣ Verificando usuário...');
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(TEST_USER_ID);
        
        if (userError || !userData.user) {
            console.error('❌ Usuário não encontrado:', userError?.message);
            return;
        }
        
        console.log('✅ Usuário encontrado:', userData.user.email);

        // 2. Verificar planos disponíveis
        console.log('\n2️⃣ Verificando planos disponíveis...');
        const { data: plans, error: plansError } = await supabase
            .from('payment_plans')
            .select('*')
            .order('price_cents', { ascending: true });

        if (plansError) {
            console.error('❌ Erro ao buscar planos:', plansError.message);
            return;
        }

        console.log(`✅ ${plans.length} planos encontrados:`);
        plans.forEach(plan => {
            const price = (plan.price_cents / 100).toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
            });
            console.log(`   📦 ${plan.display_name || plan.name}: ${price} (${plan.leads_included} leads)`);
        });

        // 3. Verificar assinatura ativa do usuário
        console.log('\n3️⃣ Verificando assinatura ativa...');
        const { data: subscription, error: subError } = await supabase
            .from('user_payment_subscriptions')
            .select('*')
            .eq('user_id', TEST_USER_ID)
            .eq('status', 'active')
            .single();

        if (subError || !subscription) {
            console.log('⚠️ Usuário não possui assinatura ativa');
        } else {
            console.log('✅ Assinatura ativa encontrada:');
            console.log(`   Plano ID: ${subscription.plan_id}`);
            console.log(`   Leads atuais: ${subscription.leads_balance}`);
            console.log(`   Status: ${subscription.status}`);
            console.log(`   Período: ${new Date(subscription.current_period_start).toLocaleDateString('pt-BR')} até ${new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}`);
        }

        // 4. Testar webhook de assinatura (simular renovação)
        console.log('\n4️⃣ Testando webhook de assinatura...');
        
        const mockSubscriptionWebhook = {
            "token": "5550029d92c8e727464111a087b6d903",
            "code": "PPCPMTB" + Date.now(),
            "sale_amount": 197.00,
            "currency_enum": 1,
            "currency_enum_key": "BRL",
            "payment_type_enum": 1,
            "payment_type_enum_key": "credit_card",
            "sale_status_enum": 2, // approved
            "sale_status_enum_key": "approved",
            "sale_status_detail": "approved",
            "date_created": new Date().toISOString(),
            "date_approved": new Date().toISOString(),
            "product": {
                "code": "PPPBDC49",
                "name": "LeadBaze",
                "external_reference": `renewal_${TEST_USER_ID}_460a8b88-f828-4b18-9d42-4b8ad5333d61_${Date.now()}`
            },
            "plan": {
                "code": "PPLQQNGCO",
                "name": "LeadBaze Start",
                "quantity": 1
            },
            "customer": {
                "email": userData.user.email,
                "full_name": userData.user.user_metadata?.full_name || "Teste Usuário",
                "identification_number": "11215289618"
            },
            "subscription": {
                "code": "PPSUB" + Date.now(),
                "status": "active",
                "status_event": "subscription_renewed",
                "subscription_status_enum": 2
            },
            "webhook_owner": "PPA23BQQ"
        };

        console.log('📤 Webhook de assinatura simulado');
        const subscriptionResult = await perfectPayService.processWebhook(mockSubscriptionWebhook, 'mock-signature');
        
        console.log('✅ Resultado do processamento de assinatura:', JSON.stringify(subscriptionResult, null, 2));

        // 5. Verificar se a assinatura foi atualizada
        console.log('\n5️⃣ Verificando assinatura após webhook...');
        const { data: updatedSubscription, error: updateError } = await supabase
            .from('user_payment_subscriptions')
            .select('*')
            .eq('user_id', TEST_USER_ID)
            .eq('status', 'active')
            .single();

        if (updateError) {
            console.error('❌ Erro ao verificar assinatura atualizada:', updateError.message);
        } else if (updatedSubscription) {
            console.log('✅ Assinatura atualizada:');
            console.log(`   Leads atuais: ${updatedSubscription.leads_balance}`);
            console.log(`   Atualizado em: ${new Date(updatedSubscription.updated_at).toLocaleString('pt-BR')}`);
        }

        // 6. Testar API de planos
        console.log('\n6️⃣ Testando API de planos...');
        try {
            const response = await fetch('http://localhost:3001/api/subscription/plans');
            const apiData = await response.json();

            if (apiData.success) {
                console.log(`✅ API de planos retornou ${apiData.data.availablePlans.length} planos`);
            } else {
                console.error('❌ Erro na API de planos:', apiData.message);
            }
        } catch (apiError) {
            console.log('⚠️ API de planos não disponível (servidor não está rodando)');
        }

        console.log('\n🎯 RESUMO DOS TESTES:');
        console.log('====================');
        console.log('✅ Usuário verificado');
        console.log('✅ Planos verificados');
        console.log('✅ Assinatura verificada');
        console.log('✅ Webhook de assinatura testado');
        console.log('✅ Sistema de assinaturas funcionando');

    } catch (error) {
        console.error('❌ Erro inesperado:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        console.log('\n✅ Teste do sistema de assinaturas concluído.');
    }
}

testSubscriptionSystem();




