#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './config.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTables() {
    console.log('🔍 VERIFICANDO TABELAS E DADOS...\n');
    
    // 1. Verificar planos disponíveis
    console.log('1️⃣ Planos disponíveis:');
    try {
        const { data: plans, error } = await supabase
            .from('payment_plans')
            .select('*');
        
        if (error) {
            console.error('❌ Erro:', error.message);
        } else {
            plans.forEach(plan => {
                console.log(`   - ${plan.name}: ${plan.display_name} (${plan.leads_included} leads)`);
            });
        }
    } catch (e) {
        console.error('❌ Erro:', e.message);
    }
    
    // 2. Verificar usuário
    console.log('\n2️⃣ Verificando usuário:');
    try {
        const { data: user, error } = await supabase
            .from('auth.users')
            .select('id, email')
            .eq('id', '66875e05-eace-49ac-bf07-0e794dbab8fd')
            .single();
        
        if (error) {
            console.error('❌ Erro:', error.message);
        } else {
            console.log(`   ✅ Usuário encontrado: ${user.email}`);
        }
    } catch (e) {
        console.error('❌ Erro:', e.message);
    }
    
    // 3. Verificar assinaturas existentes
    console.log('\n3️⃣ Assinaturas existentes:');
    try {
        const { data: subscriptions, error } = await supabase
            .from('user_payment_subscriptions')
            .select(`
                id,
                user_id,
                status,
                leads_balance,
                created_at,
                payment_plans (display_name)
            `)
            .eq('user_id', '66875e05-eace-49ac-bf07-0e794dbab8fd');
        
        if (error) {
            console.error('❌ Erro:', error.message);
        } else {
            if (subscriptions.length === 0) {
                console.log('   ℹ️ Nenhuma assinatura encontrada');
            } else {
                subscriptions.forEach(sub => {
                    console.log(`   - ${sub.payment_plans?.display_name || 'Plano desconhecido'}: ${sub.status} (${sub.leads_balance} leads)`);
                });
            }
        }
    } catch (e) {
        console.error('❌ Erro:', e.message);
    }
}

checkTables().then(() => {
    console.log('\n✅ Verificação concluída');
    process.exit(0);
}).catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});


