const axios = require('axios');

// =====================================================
// TESTE COMPLETO DO SISTEMA PERFECT PAY
// =====================================================

const BASE_URL = 'http://localhost:3001';
const TEST_USER_ID = '39dc6c62-6dea-4222-adb5-7075fd704189';
const WEBHOOK_URL = `${BASE_URL}/api/perfect-pay/webhook`;

// Planos disponíveis (assumindo IDs do banco)
const PLANS = {
  START: '1',    // R$ 200 - 1000 leads
  GROWTH: '2',   // R$ X - Y leads  
  PRO: '3'       // R$ X - Y leads
};

// Função para gerar payload de webhook
const generateWebhookPayload = (statusEnum, userId, planId, operationType = 'new', transactionId = null) => {
  const externalReference = `${operationType}_${userId}_${planId}`;
  
  return {
    token: '7378fa24f96b38a3b1805d7a6887bc82', // Token do Perfect Pay
    code: transactionId || `PPCPMTB${Date.now()}`,
    sale_amount: 200.00, // R$ 200 para plano Start
    currency_enum: 1, // BRL
    payment_type_enum: 4, // credit_card_recurrent
    sale_status_enum: statusEnum,
    sale_status_detail: "Teste automatizado",
    date_created: new Date().toISOString(),
    date_approved: statusEnum === 2 ? new Date().toISOString() : null,
    product: {
      code: "PLAN_START",
      name: "Plano Start",
      external_reference: externalReference,
      guarantee: 7
    },
    plan: {
      code: "PLAN_START",
      name: "Plano Start - 1000 leads",
      quantity: 1
    },
    customer: {
      customer_type_enum: 1,
      full_name: "Jean Lopes",
      email: "creaty123456@gmail.com",
      identification_type: "CPF",
      identification_number: "11215289618",
      birthday: "1991-11-12",
      phone_area_code: "31",
      phone_number: "983323121",
      street_name: "Rua Joviano Camargos",
      street_number: "91",
      district: "Centro",
      complement: "Apto. 104",
      zip_code: "32015393",
      city: "Contagem",
      state: "MG",
      country: "BR"
    },
    webhook_owner: "PPAKIOL"
  };
};

// Função para enviar webhook
const sendWebhook = async (payload, testName) => {
  try {
    console.log(`\n🧪 [TESTE] ${testName}`);
    console.log(`📝 Payload: ${JSON.stringify(payload, null, 2)}`);
    
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Resposta: ${JSON.stringify(response.data, null, 2)}`);
    
    return { success: true, data: response.data };
    
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
    if (error.response) {
      console.error(`📊 Resposta: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return { success: false, error: error.message };
  }
};

// Função para verificar status no banco
const checkDatabase = async (description) => {
  console.log(`\n🔍 [VERIFICAÇÃO] ${description}`);
  // Aqui você pode adicionar queries para verificar o banco
  // Por enquanto, vamos apenas logar
  console.log(`📋 Execute manualmente as queries de verificação`);
};

// Função principal de teste
const runCompleteTest = async () => {
  console.log('🚀 ===== TESTE COMPLETO PERFECT PAY =====');
  console.log(`👤 Usuário: ${TEST_USER_ID}`);
  console.log(`🎯 Plano: Start (${PLANS.START}) - R$ 200`);
  console.log(`⏰ Data: ${new Date().toISOString()}`);
  console.log('=====================================\n');

  // ===== TESTE 1: NOVA ASSINATURA APROVADA =====
  console.log('\n📋 CENÁRIO 1: NOVA ASSINATURA');
  await checkDatabase('Estado inicial do usuário');
  
  const newSubscription = generateWebhookPayload(2, TEST_USER_ID, PLANS.START, 'new');
  const result1 = await sendWebhook(newSubscription, 'Nova Assinatura Aprovada');
  
  if (result1.success) {
    await checkDatabase('Após criar nova assinatura');
  }
  
  // Aguardar um pouco entre testes
  await new Promise(resolve => setTimeout(resolve, 2000));

  // ===== TESTE 2: RENOVAÇÃO =====
  console.log('\n📋 CENÁRIO 2: RENOVAÇÃO DE ASSINATURA');
  const renewal = generateWebhookPayload(2, TEST_USER_ID, PLANS.START, 'renewal', newSubscription.code);
  const result2 = await sendWebhook(renewal, 'Renovação de Assinatura');
  
  if (result2.success) {
    await checkDatabase('Após renovação');
  }
  
  await new Promise(resolve => setTimeout(resolve, 2000));

  // ===== TESTE 3: UPGRADE =====
  console.log('\n📋 CENÁRIO 3: UPGRADE DE PLANO');
  const upgrade = generateWebhookPayload(2, TEST_USER_ID, PLANS.GROWTH || '2', 'upgrade');
  const result3 = await sendWebhook(upgrade, 'Upgrade para Growth');
  
  if (result3.success) {
    await checkDatabase('Após upgrade');
  }
  
  await new Promise(resolve => setTimeout(resolve, 2000));

  // ===== TESTE 4: DOWNGRADE =====
  console.log('\n📋 CENÁRIO 4: DOWNGRADE DE PLANO');
  const downgrade = generateWebhookPayload(2, TEST_USER_ID, PLANS.START, 'downgrade');
  const result4 = await sendWebhook(downgrade, 'Downgrade para Start');
  
  if (result4.success) {
    await checkDatabase('Após downgrade');
  }
  
  await new Promise(resolve => setTimeout(resolve, 2000));

  // ===== TESTE 5: CANCELAMENTO =====
  console.log('\n📋 CENÁRIO 5: CANCELAMENTO');
  const cancellation = generateWebhookPayload(6, TEST_USER_ID, PLANS.START, 'cancel');
  const result5 = await sendWebhook(cancellation, 'Cancelamento');
  
  if (result5.success) {
    await checkDatabase('Após cancelamento');
  }

  // ===== RESUMO =====
  console.log('\n📊 ===== RESUMO DOS TESTES =====');
  console.log(`✅ Nova Assinatura: ${result1.success ? 'SUCESSO' : 'FALHA'}`);
  console.log(`✅ Renovação: ${result2.success ? 'SUCESSO' : 'FALHA'}`);
  console.log(`✅ Upgrade: ${result3.success ? 'SUCESSO' : 'FALHA'}`);
  console.log(`✅ Downgrade: ${result4.success ? 'SUCESSO' : 'FALHA'}`);
  console.log(`✅ Cancelamento: ${result5.success ? 'SUCESSO' : 'FALHA'}`);
  console.log('\n🎯 Execute as queries SQL para verificar os dados no banco!');
};

// Executar teste se chamado diretamente
if (require.main === module) {
  runCompleteTest().catch(console.error);
}

module.exports = {
  generateWebhookPayload,
  sendWebhook,
  runCompleteTest
};








