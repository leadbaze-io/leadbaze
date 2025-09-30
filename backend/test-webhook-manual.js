#!/usr/bin/env node
require('dotenv').config({ path: './config.env' });
const PerfectPayService = require('./services/perfectPayService');

const userId = '66875e05-eace-49ac-bf07-0e794dbab8fd';
const userEmail = 'creaty1234567@gmail.com';

async function testWebhookManually() {
  console.log('🧪 TESTANDO WEBHOOK MANUALMENTE');
  console.log('==============================');
  console.log(`👤 Usuário: ${userEmail} (${userId})`);
  console.log('');

  const perfectPayService = new PerfectPayService();

  // Simular webhook do Perfect Pay para pagamento aprovado
  const mockWebhookData = {
    token: "test_token_" + Date.now(),
    code: "PPCPMTB" + Date.now(),
    sale_amount: 197.00,
    currency_enum: 1,
    currency_enum_key: "BRL",
    payment_type_enum: 4,
    payment_type_enum_key: "subscription",
    sale_status_enum: 2, // approved
    sale_status_enum_key: "approved",
    sale_status_detail: "approved",
    date_created: new Date().toISOString(),
    date_approved: new Date().toISOString(),
    product: {
      code: "PPLQQNGCO", // Código do plano Start
      name: "LeadBaze Start",
      external_reference: `new_${userId}_460a8b88-f828-4b18-9d42-4b8ad5333d61_${Date.now()}`
    },
    plan: {
      code: "PPLQQNGCO",
      name: "Plano Start - 1000 leads",
      quantity: 1
    },
    customer: {
      customer_type_enum: 1,
      full_name: "Cliente Teste",
      email: userEmail,
      identification_type: "CPF",
      identification_number: "12345678901"
    },
    subscription: {
      code: "SUB" + Date.now(),
      status: "active",
      status_event: "subscription_started"
    },
    webhook_owner: "PPAKIOL"
  };

  console.log('📤 Webhook simulado:');
  console.log('   Status:', mockWebhookData.sale_status_detail);
  console.log('   Valor:', `R$ ${mockWebhookData.sale_amount}`);
  console.log('   Produto:', mockWebhookData.product.name);
  console.log('   Cliente:', mockWebhookData.customer.email);
  console.log('   External Reference:', mockWebhookData.product.external_reference);
  console.log('');

  try {
    console.log('🔄 Processando webhook...');
    const result = await perfectPayService.processWebhook(mockWebhookData, null);
    
    console.log('📊 Resultado:');
    console.log('   Processado:', result.processed);
    console.log('   Status:', result.status);
    console.log('   Operação:', result.operation);
    console.log('   Leads adicionados:', result.leads_added);
    console.log('   Nome do plano:', result.plan_name);
    
    if (result.error) {
      console.log('❌ Erro:', result.error);
    }
    
    if (result.processed) {
      console.log('');
      console.log('✅ WEBHOOK PROCESSADO COM SUCESSO!');
      console.log('🎯 A assinatura deve ter sido atualizada');
    } else {
      console.log('');
      console.log('⚠️ WEBHOOK NÃO FOI PROCESSADO');
      console.log('💡 Motivo:', result.reason || result.error);
    }
    
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error.message);
  }
}

testWebhookManually();




