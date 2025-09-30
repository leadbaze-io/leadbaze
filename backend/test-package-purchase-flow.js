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

const TEST_USER_ID = '66875e05-eace-49ac-bf07-0e794dbab8fd'; // Usuário de teste
const TEST_PACKAGE_ID = 'leads_1000'; // Pacote de 1000 leads

async function testPackagePurchaseFlow() {
    console.log('🧪 TESTANDO FLUXO COMPLETO DE COMPRA DE PACOTES');
    console.log('===============================================');
    console.log(`👤 Usuário: ${TEST_USER_ID}`);
    console.log(`📦 Pacote: ${TEST_PACKAGE_ID}`);

    try {
        // 1. Verificar se o usuário existe
        console.log('\n1️⃣ Verificando usuário...');
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(TEST_USER_ID);
        
        if (userError || !userData.user) {
            console.error('❌ Usuário não encontrado:', userError?.message);
            return;
        }
        
        console.log('✅ Usuário encontrado:', userData.user.email);

        // 2. Verificar se o pacote existe
        console.log('\n2️⃣ Verificando pacote...');
        const { data: packageData, error: packageError } = await supabase
            .from('lead_packages')
            .select('*')
            .eq('package_id', TEST_PACKAGE_ID)
            .eq('active', true)
            .single();

        if (packageError || !packageData) {
            console.error('❌ Pacote não encontrado:', packageError?.message);
            return;
        }

        console.log('✅ Pacote encontrado:');
        console.log(`   Nome: ${packageData.name}`);
        console.log(`   Leads: ${packageData.leads}`);
        console.log(`   Preço: R$ ${(packageData.price_cents / 100).toFixed(2)}`);
        console.log(`   Código Perfect Pay: ${packageData.perfect_pay_code}`);

        // 3. Verificar assinatura ativa do usuário
        console.log('\n3️⃣ Verificando assinatura ativa...');
        let { data: subscription, error: subError } = await supabase
            .from('user_payment_subscriptions')
            .select('*')
            .eq('user_id', TEST_USER_ID)
            .eq('status', 'active')
            .single();

        if (subError || !subscription) {
            console.log('⚠️ Usuário não possui assinatura ativa - criando assinatura de teste...');
            
            // Criar assinatura de teste para o usuário
            const { data: testPlan, error: planError } = await supabase
                .from('payment_plans')
                .select('*')
                .eq('name', 'start')
                .single();
            
            if (planError || !testPlan) {
                console.error('❌ Plano de teste não encontrado:', planError?.message);
                return;
            }
            
            const { data: newSubscription, error: createError } = await supabase
                .from('user_payment_subscriptions')
                .insert({
                    user_id: TEST_USER_ID,
                    plan_id: testPlan.id,
                    status: 'active',
                    leads_balance: testPlan.leads_included,
                    current_period_start: new Date().toISOString(),
                    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    first_payment_date: new Date().toISOString()
                })
                .select()
                .single();
            
            if (createError) {
                console.error('❌ Erro ao criar assinatura de teste:', createError.message);
                return;
            }
            
            console.log('✅ Assinatura de teste criada');
            subscription = newSubscription;
        }

        console.log('✅ Assinatura ativa encontrada:');
        console.log(`   Plano ID: ${subscription.plan_id}`);
        console.log(`   Leads atuais: ${subscription.leads_balance}`);
        console.log(`   Status: ${subscription.status}`);

        // 4. Simular webhook de compra de pacote
        console.log('\n4️⃣ Simulando webhook de compra de pacote...');
        
        const mockWebhookData = {
            "token": "5550029d92c8e727464111a087b6d903",
            "code": "PPCPMTB" + Date.now(),
            "sale_amount": packageData.price_cents / 100,
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
                "code": packageData.perfect_pay_code,
                "name": packageData.name,
                "external_reference": `${TEST_PACKAGE_ID}_${TEST_USER_ID}_${Date.now()}`
            },
            "customer": {
                "email": userData.user.email,
                "full_name": userData.user.user_metadata?.full_name || "Teste Usuário",
                "identification_number": "11215289618"
            },
            "webhook_owner": "PPA23BQQ"
        };

        console.log('📤 Webhook simulado:', JSON.stringify(mockWebhookData, null, 2));

        // 5. Processar webhook via PerfectPayService
        console.log('\n5️⃣ Processando webhook...');
        const result = await perfectPayService.processWebhook(mockWebhookData, 'mock-signature');
        
        console.log('✅ Resultado do processamento:', JSON.stringify(result, null, 2));

        // 6. Verificar se os leads foram adicionados
        console.log('\n6️⃣ Verificando leads após compra...');
        const { data: updatedSubscription, error: updateError } = await supabase
            .from('user_payment_subscriptions')
            .select('*')
            .eq('user_id', TEST_USER_ID)
            .eq('status', 'active')
            .single();

        if (updateError) {
            console.error('❌ Erro ao verificar assinatura atualizada:', updateError.message);
        } else {
            console.log('✅ Assinatura atualizada:');
            console.log(`   Leads anteriores: ${subscription.leads_balance}`);
            console.log(`   Leads atuais: ${updatedSubscription.leads_balance}`);
            console.log(`   Leads adicionados: ${updatedSubscription.leads_balance - subscription.leads_balance}`);
            console.log(`   Leads esperados: ${packageData.leads}`);
            
            if (updatedSubscription.leads_balance === subscription.leads_balance + packageData.leads) {
                console.log('🎉 SUCESSO: Leads adicionados corretamente!');
            } else {
                console.log('⚠️ ATENÇÃO: Leads não foram adicionados corretamente');
            }
        }

        console.log('\n🎯 RESUMO DO TESTE:');
        console.log('==================');
        console.log('✅ Usuário verificado');
        console.log('✅ Pacote verificado');
        console.log('✅ Assinatura ativa encontrada');
        console.log('✅ Webhook simulado');
        console.log('✅ Processamento executado');
        console.log('✅ Leads verificados');

    } catch (error) {
        console.error('❌ Erro inesperado:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        console.log('\n✅ Teste de fluxo de compra concluído.');
    }
}

testPackagePurchaseFlow();
