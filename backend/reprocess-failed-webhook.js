#!/usr/bin/env node
require('dotenv').config({ path: './config.env' });
const PerfectPayService = require('./services/perfectPayService');

const userId = '66875e05-eace-49ac-bf07-0e794dbab8fd';
const userEmail = 'creaty1234567@gmail.com';

async function reprocessFailedWebhook() {
  console.log('🔄 REPROCESSANDO WEBHOOK QUE FALHOU');
  console.log('===================================');
  console.log(`👤 Usuário: ${userEmail} (${userId})`);
  console.log('');

  const perfectPayService = new PerfectPayService();

  // Dados do webhook que falhou (baseado no que encontramos)
  const webhookData = {
    token: "5550029d92c8e727464111a087b6d903",
    code: "PPCPMTB5H3C73L",
    sale_amount: 197,
    currency_enum: 1,
    currency_enum_key: "BRL",
    payment_type_enum: 1,
    payment_type_enum_key: "credit_card",
    sale_status_enum: 2, // approved
    sale_status_enum_key: "approved",
    sale_status_detail: "approved",
    date_created: "2025-09-28 20:20:01",
    date_approved: "2025-09-28 20:20:01",
    product: {
      code: "PPPBDC49",
      name: "LeadBaze",
      guarantee: 7,
      external_reference: null
    },
    plan: {
      code: "PPLQQNGCO", // Código do plano Start
      name: "LeadBaze Start",
      quantity: 1,
      tax_code: null
    },
    customer: {
      customer_type_enum: 1,
      full_name: "Maria de Fatima",
      email: userEmail,
      identification_type: "CPF",
      identification_number: "11215289618",
      phone_number: "983323121",
      phone_formated: "(31) 98332-3121"
    },
    subscription: {
      code: "PPSUB1O91FP3R",
      status: "active",
      charges_made: 3,
      status_event: "subscription_renewed",
      next_charge_date: "2025-10-27T03:00:00.000000Z",
      subscription_status_enum: 2
    },
    webhook_owner: "PPA23BQQ"
  };

  console.log('📤 Webhook para reprocessamento:');
  console.log('   Status:', webhookData.sale_status_detail);
  console.log('   Valor:', `R$ ${webhookData.sale_amount}`);
  console.log('   Plano:', webhookData.plan.name);
  console.log('   Código do Plano:', webhookData.plan.code);
  console.log('   Cliente:', webhookData.customer.email);
  console.log('   Subscription Status:', webhookData.subscription.status);
  console.log('');

  try {
    console.log('🔄 Processando webhook...');
    const result = await perfectPayService.processWebhook(webhookData, null);
    
    console.log('📊 Resultado:');
    console.log('   Processado:', result.processed);
    console.log('   Status:', result.status);
    console.log('   Operação:', result.operation);
    
    if (result.error) {
      console.log('❌ Erro:', result.error);
    }
    
    if (result.processed) {
      console.log('');
      console.log('✅ WEBHOOK REPROCESSADO COM SUCESSO!');
      console.log('🎯 A assinatura deve ter sido ativada/atualizada');
      
      if (result.leads_added) {
        console.log(`📈 Leads adicionados: ${result.leads_added}`);
      }
      if (result.plan_name) {
        console.log(`📦 Plano: ${result.plan_name}`);
      }
    } else {
      console.log('');
      console.log('⚠️ WEBHOOK AINDA NÃO FOI PROCESSADO');
      console.log('💡 Motivo:', result.reason || result.error);
    }
    
  } catch (error) {
    console.error('❌ Erro ao reprocessar webhook:', error.message);
  }
}

reprocessFailedWebhook();




