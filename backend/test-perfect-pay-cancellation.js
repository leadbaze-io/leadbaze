const axios = require('axios');

const TEST_USER_ID = '39dc6c62-6dea-4222-adb5-7075fd704189';
const BACKEND_URL = 'http://localhost:3001';

async function testCancellation() {
  console.log('🚀 ===== TESTE: CANCELAMENTO DE ASSINATURA =====');
  console.log('👤 Usuário:', TEST_USER_ID);
  console.log('📋 Operação: Cancelamento');
  console.log('⏰ Data:', new Date().toISOString());
  console.log('=========================================\n');

  const timestamp = Date.now();
  
  // Simular webhook de cancelamento do Perfect Pay
  const webhookPayload = {
    token: "7378fa24f96b38a3b1805d7a6887bc82",
    code: `PPCPMTB${timestamp}`,
    sale_amount: 0, // Cancelamento não tem valor
    currency_enum: 1,
    payment_type_enum: 4,
    sale_status_enum: 6, // 6 = subscription_cancelled
    sale_status_detail: "Cancelamento de Assinatura Start - Teste",
    date_created: new Date().toISOString(),
    date_approved: new Date().toISOString(),
    product: {
      code: "PPLQQNG92",
      name: "LeadBaze Start",
      external_reference: `cancel_${TEST_USER_ID}_1_${timestamp}`, // Formato: operationType_userId_planId_timestamp
      guarantee: 7
    },
    plan: {
      code: "PPLQQNG92",
      name: "LeadBaze Start - 1000 leads",
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

  console.log('📝 Payload do webhook:');
  console.log(JSON.stringify(webhookPayload, null, 2));
  console.log('\n🔄 Enviando webhook...');

  try {
    const response = await axios.post(`${BACKEND_URL}/api/perfect-pay/webhook`, webhookPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Status:', response.status);
    console.log('📊 Resposta:');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.success && response.data.result.processed) {
      console.log('\n🎉 SUCESSO! Cancelamento processado!');
      console.log('🔍 Agora verifique no banco de dados:');
      console.log('1. Status da assinatura deve ser "cancelled"');
      console.log('2. Campo cancelled_at deve estar preenchido');
      console.log('3. Campo cancellation_reason deve estar preenchido');
    } else {
      console.log('\n❌ FALHA! Cancelamento não foi processado!');
      console.log('Erro:', response.data.result?.error);
    }

  } catch (error) {
    console.error('❌ Erro ao enviar webhook:', error.response?.data || error.message);
  }
}

testCancellation();
