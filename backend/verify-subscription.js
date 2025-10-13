#!/usr/bin/env node
require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '66875e05-eace-49ac-bf07-0e794dbab8fd';

async function verifySubscription() {
  console.log('✅ VERIFICANDO ASSINATURA APÓS REPROCESSAMENTO');
  console.log('==============================================');
  
  try {
    const { data: subscription, error } = await supabase
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
      .eq('status', 'active')
      .single();
      
    if (error) {
      console.log('❌ Erro:', error.message);
      return;
    }
    
    console.log('📊 Assinatura ativa:');
    console.log(`   ID: ${subscription.id}`);
    console.log(`   Status: ${subscription.status}`);
    console.log(`   Plano: ${subscription.payment_plans?.display_name}`);
    console.log(`   Leads disponíveis: ${subscription.leads_balance}`);
    console.log(`   Leads bonus: ${subscription.leads_bonus}`);
    console.log(`   Período atual: ${subscription.current_period_start} até ${subscription.current_period_end}`);
    console.log(`   Próxima cobrança: ${subscription.next_billing_date}`);
    console.log(`   Perfect Pay Transaction ID: ${subscription.perfect_pay_transaction_id}`);
    console.log(`   Perfect Pay Subscription ID: ${subscription.perfect_pay_subscription_id}`);
    console.log(`   Atualizado em: ${subscription.updated_at}`);
    
    console.log('');
    console.log('🎯 RESULTADO:');
    console.log('=============');
    if (subscription.perfect_pay_transaction_id) {
      console.log('✅ Assinatura vinculada ao Perfect Pay');
      console.log('✅ Webhook processado com sucesso');
      console.log('✅ Usuário tem acesso completo ao sistema');
    } else {
      console.log('⚠️ Assinatura ativa mas sem vínculo com Perfect Pay');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

verifySubscription();







