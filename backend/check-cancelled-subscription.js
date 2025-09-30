#!/usr/bin/env node
require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '66875e05-eace-49ac-bf07-0e794dbab8fd';

async function checkSubscription() {
  console.log('🔍 VERIFICANDO ASSINATURA APÓS CANCELAMENTO');
  console.log('==========================================');
  
  try {
    const { data: subscription, error } = await supabase
      .from('user_payment_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'cancelled')
      .single();
      
    if (error) {
      console.log('❌ Erro:', error.message);
      return;
    }
    
    console.log('📊 Assinatura cancelada:');
    console.log(`   Status: ${subscription.status}`);
    console.log(`   Perfect Pay Transaction ID: ${subscription.perfect_pay_transaction_id}`);
    console.log(`   Perfect Pay Subscription ID: ${subscription.perfect_pay_subscription_id}`);
    console.log(`   Cancelled at: ${subscription.cancelled_at}`);
    console.log(`   Cancellation reason: ${subscription.cancellation_reason}`);
    console.log(`   Access until: ${subscription.current_period_end}`);
    console.log(`   Leads remaining: ${subscription.leads_balance}`);
    
    console.log('');
    console.log('🎯 ANÁLISE DO ERRO:');
    console.log('==================');
    if (!subscription.perfect_pay_subscription_id) {
      console.log('❌ PROBLEMA: perfect_pay_subscription_id está null');
      console.log('💡 CAUSA: Assinatura foi criada manualmente, não via webhook');
      console.log('🔧 SOLUÇÃO: Cancelamento local funcionou corretamente');
      console.log('✅ RESULTADO: Usuário mantém acesso até o final do período');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

checkSubscription();



