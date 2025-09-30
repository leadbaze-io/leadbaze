#!/usr/bin/env node
require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '66875e05-eace-49ac-bf07-0e794dbab8fd';

async function checkUserAndSubscription() {
  console.log('🔍 INVESTIGANDO PROBLEMA DE ASSINATURA');
  console.log('=====================================');
  console.log(`👤 Usuário ID: ${userId}\n`);
  
  try {
    // 1. Verificar se usuário existe
    console.log('1️⃣ Verificando usuário...');
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError) {
      console.log('❌ Usuário não encontrado:', userError.message);
      return;
    }
    console.log('✅ Usuário encontrado:', user.email);
    console.log('📅 Criado em:', user.created_at);
    console.log('📧 Email confirmado:', user.email_confirmed_at ? 'Sim' : 'Não');
    console.log('');
    
    // 2. Verificar assinaturas existentes
    console.log('2️⃣ Verificando assinaturas...');
    const { data: subscriptions, error: subError } = await supabase
      .from('user_payment_subscriptions')
      .select(`
        *,
        payment_plans (
          id,
          name,
          display_name,
          leads_included
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (subError) {
      console.log('❌ Erro ao buscar assinaturas:', subError.message);
      return;
    }
    
    console.log(`📊 Assinaturas encontradas: ${subscriptions.length}`);
    if (subscriptions.length === 0) {
      console.log('⚠️ NENHUMA ASSINATURA ENCONTRADA - Este é o problema!');
    } else {
      subscriptions.forEach((sub, index) => {
        console.log(`   ${index + 1}. Status: ${sub.status}`);
        console.log(`      Plano: ${sub.payment_plans?.display_name || 'N/A'}`);
        console.log(`      Leads: ${sub.leads_balance}`);
        console.log(`      Criado: ${sub.created_at}`);
        console.log(`      Perfect Pay ID: ${sub.perfect_pay_subscription_id || 'N/A'}`);
        console.log(`      Transaction ID: ${sub.perfect_pay_transaction_id || 'N/A'}`);
        console.log('');
      });
    }
    
    // 3. Verificar webhooks recentes
    console.log('3️⃣ Verificando webhooks recentes...');
    const { data: webhooks, error: webhookError } = await supabase
      .from('perfect_pay_webhooks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (webhookError) {
      console.log('⚠️ Erro ao buscar webhooks:', webhookError.message);
    } else {
      console.log(`📨 Webhooks recentes: ${webhooks.length}`);
      if (webhooks.length === 0) {
        console.log('⚠️ NENHUM WEBHOOK ENCONTRADO - Possível problema de configuração!');
      } else {
        webhooks.forEach((webhook, index) => {
          console.log(`   ${index + 1}. Status: ${webhook.status}`);
          console.log(`      Processado: ${webhook.processed ? 'Sim' : 'Não'}`);
          console.log(`      Criado: ${webhook.created_at}`);
          console.log(`      Sale Status: ${webhook.sale_status_enum}`);
          console.log(`      Amount: R$ ${webhook.sale_amount || 'N/A'}`);
          console.log(`      Customer Email: ${webhook.customer_email || 'N/A'}`);
          console.log('');
        });
      }
    }
    
    // 4. Verificar se há webhooks com o email do usuário
    console.log('4️⃣ Verificando webhooks para este usuário...');
    const { data: userWebhooks, error: userWebhookError } = await supabase
      .from('perfect_pay_webhooks')
      .select('*')
      .eq('customer_email', user.email)
      .order('created_at', { ascending: false });
      
    if (userWebhookError) {
      console.log('⚠️ Erro ao buscar webhooks do usuário:', userWebhookError.message);
    } else {
      console.log(`📨 Webhooks para ${user.email}: ${userWebhooks.length}`);
      if (userWebhooks.length === 0) {
        console.log('⚠️ NENHUM WEBHOOK ENCONTRADO PARA ESTE EMAIL!');
        console.log('💡 Possíveis causas:');
        console.log('   - Webhook não foi enviado pelo Perfect Pay');
        console.log('   - Email no webhook é diferente do cadastrado');
        console.log('   - Webhook foi enviado mas não processado');
      } else {
        userWebhooks.forEach((webhook, index) => {
          console.log(`   ${index + 1}. Status: ${webhook.status}`);
          console.log(`      Processado: ${webhook.processed ? 'Sim' : 'Não'}`);
          console.log(`      Criado: ${webhook.created_at}`);
          console.log(`      Sale Status: ${webhook.sale_status_enum}`);
          console.log(`      Amount: R$ ${webhook.sale_amount || 'N/A'}`);
          console.log('');
        });
      }
    }
    
    // 5. Verificar planos disponíveis
    console.log('5️⃣ Verificando planos disponíveis...');
    const { data: plans, error: plansError } = await supabase
      .from('payment_plans')
      .select('*')
      .order('price_cents', { ascending: true });
      
    if (plansError) {
      console.log('❌ Erro ao buscar planos:', plansError.message);
    } else {
      console.log('📦 Planos disponíveis:');
      plans.forEach(plan => {
        console.log(`   - ${plan.display_name}: R$ ${(plan.price_cents / 100).toFixed(2)} (${plan.leads_included} leads)`);
      });
    }
    
    console.log('\n🎯 DIAGNÓSTICO:');
    console.log('================');
    if (subscriptions.length === 0) {
      console.log('❌ PROBLEMA: Usuário não possui assinatura ativa');
      console.log('💡 SOLUÇÃO: Verificar se o webhook foi processado corretamente');
    } else {
      console.log('✅ Usuário possui assinatura(s)');
    }
    
    if (userWebhooks.length === 0) {
      console.log('❌ PROBLEMA: Nenhum webhook encontrado para este usuário');
      console.log('💡 SOLUÇÃO: Verificar configuração do webhook no Perfect Pay');
    } else {
      console.log('✅ Webhooks encontrados para este usuário');
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

checkUserAndSubscription();




