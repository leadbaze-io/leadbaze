const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const TEST_USER_ID = '39dc6c62-6dea-4222-adb5-7075fd704189';
const WEBHOOK_URL = `${BASE_URL}/api/perfect-pay/webhook`;

// Gerar payload para nova assinatura Start aprovada
const generateStartSubscriptionPayload = () => {
  const timestamp = Date.now();
  const externalReference = `new_${TEST_USER_ID}_1_${timestamp}`; // Formato correto: operationType_userId_planId_timestamp
  
  return {
    token: '7378fa24f96b38a3b1805d7a6887bc82',
    code: `PPCPMTB${Date.now()}`,
    sale_amount: 197.00, // R$ 197 para plano Start
    currency_enum: 1, // BRL
    payment_type_enum: 4, // credit_card_recurrent
    sale_status_enum: 2, // APROVADO
    sale_status_detail: 'Nova Assinatura Start - Teste Real',
    date_created: new Date().toISOString(),
    date_approved: new Date().toISOString(),
    product: {
      code: 'PPLQQNG92', // ✅ Código REAL do plano Start no Perfect Pay
      name: 'LeadBaze Start',
      external_reference: externalReference,
      guarantee: 7
    },
    plan: {
      code: 'PPLQQNG92', // ✅ Código REAL do plano Start
      name: 'LeadBaze Start - 1000 leads',
      quantity: 1
    },
    customer: {
      customer_type_enum: 1,
      full_name: 'Jean Lopes',
      email: 'creaty123456@gmail.com',
      identification_type: 'CPF',
      identification_number: '11215289618',
      birthday: '1991-11-12',
      phone_area_code: '31',
      phone_number: '983323121',
      street_name: 'Rua Joviano Camargos',
      street_number: '91',
      district: 'Centro',
      complement: 'Apto. 104',
      zip_code: '32015393',
      city: 'Contagem',
      state: 'MG',
      country: 'BR'
    },
    webhook_owner: 'PPAKIOL'
  };
};

// Função para testar
const testStartSubscription = async () => {
  console.log('🚀 ===== TESTE: NOVA ASSINATURA START =====');
  console.log(`👤 Usuário: ${TEST_USER_ID}`);
  console.log(`📋 Plano: Start (ID: 1) - R$ 197 - PPLQQNG92`);
  console.log(`⏰ Data: ${new Date().toISOString()}`);
  console.log('=========================================\n');

  const payload = generateStartSubscriptionPayload();
  
  console.log('📝 Payload do webhook:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('\n🔄 Enviando webhook...');

  try {
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
    
    console.log(`\n✅ Status: ${response.status}`);
    console.log('📊 Resposta:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('\n🎉 SUCESSO! Assinatura processada!');
      console.log('🔍 Agora verifique no banco de dados:');
      console.log('1. Tabela user_payment_subscriptions');
      console.log('2. Tabela payment_webhooks');
      console.log('3. Saldo de leads do usuário');
    } else {
      console.log('\n⚠️ Webhook recebido mas não processado');
      console.log('Motivo:', response.data.result?.error);
    }
    
  } catch (error) {
    console.error(`\n❌ Erro: ${error.message}`);
    if (error.response) {
      console.error('📊 Resposta de erro:');
      console.error(JSON.stringify(error.response.data, null, 2));
    }
  }
};

testStartSubscription();
