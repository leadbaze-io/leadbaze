#!/usr/bin/env node

/**
 * 🚀 Script para Ativar Plano Start para Usuário Específico
 * 
 * Este script:
 * 1. Verifica se o usuário existe
 * 2. Cancela assinaturas existentes
 * 3. Cria nova assinatura Start
 * 4. Registra a atividade
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './config.env' });

// Configuração Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Configurações
const USER_ID = '66875e05-eace-49ac-bf07-0e794dbab8fd';
const PLAN_NAME = 'start';
const LEADS_INCLUDED = 1000;

console.log('🚀 ATIVAÇÃO DE PLANO START');
console.log('=========================');
console.log(`👤 Usuário: ${USER_ID}`);
console.log(`📦 Plano: ${PLAN_NAME}`);
console.log(`🎯 Leads: ${LEADS_INCLUDED}`);
console.log('');

async function activateUserPlan() {
    try {
        // 1. Verificar se o usuário existe
        console.log('1️⃣ Verificando usuário...');
        const { data: user, error: userError } = await supabase
            .from('auth.users')
            .select('id, email, created_at, email_confirmed_at')
            .eq('id', USER_ID)
            .single();

        if (userError || !user) {
            console.error('❌ Usuário não encontrado:', userError?.message);
            return;
        }

        console.log('✅ Usuário encontrado:', user.email);

        // 2. Verificar plano Start
        console.log('\n2️⃣ Verificando plano Start...');
        const { data: plan, error: planError } = await supabase
            .from('payment_plans')
            .select('id, name, display_name, price_cents, leads_included')
            .eq('name', PLAN_NAME)
            .single();

        if (planError || !plan) {
            console.error('❌ Plano Start não encontrado:', planError?.message);
            return;
        }

        console.log('✅ Plano Start encontrado:', plan.display_name);

        // 3. Verificar assinaturas existentes
        console.log('\n3️⃣ Verificando assinaturas existentes...');
        const { data: existingSubscriptions, error: subError } = await supabase
            .from('user_payment_subscriptions')
            .select('id, status, leads_balance, created_at')
            .eq('user_id', USER_ID)
            .eq('status', 'active');

        if (subError) {
            console.error('❌ Erro ao verificar assinaturas:', subError.message);
            return;
        }

        if (existingSubscriptions && existingSubscriptions.length > 0) {
            console.log(`⚠️ Encontradas ${existingSubscriptions.length} assinatura(s) ativa(s)`);
            
            // Cancelar assinaturas existentes
            console.log('🔄 Cancelando assinaturas existentes...');
            const { error: cancelError } = await supabase
                .from('user_payment_subscriptions')
                .update({
                    status: 'cancelled',
                    cancelled_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', USER_ID)
                .eq('status', 'active');

            if (cancelError) {
                console.error('❌ Erro ao cancelar assinaturas:', cancelError.message);
                return;
            }

            console.log('✅ Assinaturas existentes canceladas');
        } else {
            console.log('✅ Nenhuma assinatura ativa encontrada');
        }

        // 4. Criar nova assinatura Start
        console.log('\n4️⃣ Criando nova assinatura Start...');
        const now = new Date();
        const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const refundDeadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const { data: newSubscription, error: createError } = await supabase
            .from('user_payment_subscriptions')
            .insert({
                user_id: USER_ID,
                plan_id: plan.id,
                status: 'active',
                leads_balance: LEADS_INCLUDED,
                leads_bonus: 0,
                first_payment_date: now.toISOString(),
                current_period_start: now.toISOString(),
                current_period_end: nextMonth.toISOString(),
                next_billing_date: nextMonth.toISOString(),
                is_refund_eligible: false,
                refund_deadline: refundDeadline.toISOString(),
                created_at: now.toISOString(),
                updated_at: now.toISOString()
            })
            .select()
            .single();

        if (createError) {
            console.error('❌ Erro ao criar assinatura:', createError.message);
            return;
        }

        console.log('✅ Nova assinatura criada:', newSubscription.id);

        // 5. Registrar atividade
        console.log('\n5️⃣ Registrando atividade...');
        const { error: activityError } = await supabase
            .from('user_subscription_activities')
            .insert({
                user_id: USER_ID,
                activity_type: 'plan_activated',
                activity_data: {
                    plan: PLAN_NAME,
                    leads: LEADS_INCLUDED,
                    method: 'manual_activation',
                    subscription_id: newSubscription.id
                },
                created_at: new Date().toISOString()
            });

        if (activityError) {
            console.error('⚠️ Erro ao registrar atividade:', activityError.message);
        } else {
            console.log('✅ Atividade registrada');
        }

        // 6. Verificar resultado final
        console.log('\n6️⃣ Verificando resultado final...');
        const { data: finalSubscription, error: finalError } = await supabase
            .from('user_payment_subscriptions')
            .select(`
                id,
                user_id,
                status,
                leads_balance,
                leads_used,
                created_at,
                payment_plans (
                    display_name,
                    leads_included
                )
            `)
            .eq('user_id', USER_ID)
            .eq('status', 'active')
            .single();

        if (finalError) {
            console.error('❌ Erro ao verificar resultado:', finalError.message);
            return;
        }

        console.log('\n🎉 ATIVAÇÃO CONCLUÍDA COM SUCESSO!');
        console.log('==================================');
        console.log(`👤 Usuário: ${user.email}`);
        console.log(`📦 Plano: ${finalSubscription.payment_plans.display_name}`);
        console.log(`🎯 Leads disponíveis: ${finalSubscription.leads_balance}`);
        console.log(`📊 Leads usados: ${finalSubscription.leads_used}`);
        console.log(`📅 Criado em: ${new Date(finalSubscription.created_at).toLocaleString('pt-BR')}`);
        console.log(`🆔 ID da assinatura: ${finalSubscription.id}`);

    } catch (error) {
        console.error('❌ Erro geral:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Executar ativação
activateUserPlan().then(() => {
    console.log('\n✅ Script finalizado');
    process.exit(0);
}).catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});
