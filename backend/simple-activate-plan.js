#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './config.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const USER_ID = '66875e05-eace-49ac-bf07-0e794dbab8fd';
const PLAN_NAME = 'start';
const LEADS_INCLUDED = 1000;

async function activateUserPlan() {
    console.log('🚀 ATIVAÇÃO DE PLANO START');
    console.log('=========================');
    console.log(`👤 Usuário: ${USER_ID}`);
    console.log(`📦 Plano: ${PLAN_NAME}`);
    console.log(`🎯 Leads: ${LEADS_INCLUDED}`);
    console.log('');

    try {
        // 1. Buscar ID do plano Start
        console.log('1️⃣ Buscando plano Start...');
        const { data: plan, error: planError } = await supabase
            .from('payment_plans')
            .select('id, name, display_name, leads_included')
            .eq('name', PLAN_NAME)
            .single();

        if (planError || !plan) {
            console.error('❌ Plano Start não encontrado:', planError?.message);
            return;
        }

        console.log(`✅ Plano encontrado: ${plan.display_name} (${plan.leads_included} leads)`);

        // 2. Cancelar assinaturas existentes (se houver)
        console.log('\n2️⃣ Verificando assinaturas existentes...');
        const { data: existingSubs, error: subError } = await supabase
            .from('user_payment_subscriptions')
            .select('id, status')
            .eq('user_id', USER_ID)
            .eq('status', 'active');

        if (subError) {
            console.error('❌ Erro ao verificar assinaturas:', subError.message);
            return;
        }

        if (existingSubs && existingSubs.length > 0) {
            console.log(`⚠️ Encontradas ${existingSubs.length} assinatura(s) ativa(s)`);
            
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

        // 3. Criar nova assinatura
        console.log('\n3️⃣ Criando nova assinatura Start...');
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

        console.log('✅ Nova assinatura criada com sucesso!');
        console.log(`🆔 ID da assinatura: ${newSubscription.id}`);

        // 4. Verificar resultado
        console.log('\n4️⃣ Verificando resultado final...');
        const { data: finalSub, error: finalError } = await supabase
            .from('user_payment_subscriptions')
            .select(`
                id,
                user_id,
                status,
                leads_balance,
                leads_bonus,
                created_at,
                payment_plans (display_name, leads_included)
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
        console.log(`👤 Usuário: ${USER_ID}`);
        console.log(`📦 Plano: ${finalSub.payment_plans.display_name}`);
        console.log(`🎯 Leads disponíveis: ${finalSub.leads_balance}`);
        console.log(`🎁 Leads bonus: ${finalSub.leads_bonus}`);
        console.log(`📅 Criado em: ${new Date(finalSub.created_at).toLocaleString('pt-BR')}`);
        console.log(`🆔 ID da assinatura: ${finalSub.id}`);

    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    }
}

activateUserPlan().then(() => {
    console.log('\n✅ Script finalizado');
    process.exit(0);
}).catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});





