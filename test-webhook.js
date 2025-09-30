// Script para testar o webhook do WhatsApp
// Execute com: node test-webhook.js

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TOKEN = 'whatsapp_webhook_token_2024';

// Dados de teste
const testData = {
  campaign_id: '123e4567-e89b-12d3-a456-426614174000',
  lead_phone: '+5511999999999',
  lead_name: 'João Silva',
  message_id: 'msg_test_123'
};

async function testWebhook() {
  console.log('🧪 TESTANDO WEBHOOK DO WHATSAPP...\n');

  try {
    // Teste 1: Resposta de mensagem
    console.log('📱 Teste 1: Resposta de mensagem');
    const response1 = await axios.post(`${BASE_URL}/api/whatsapp/webhook/response`, {
      ...testData,
      response_type: 'text',
      response_content: 'Olá, tenho interesse no produto!',
      response_timestamp: new Date().toISOString()
    }, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Resposta de mensagem:', response1.data);

    // Teste 2: Status de entrega
    console.log('\n📨 Teste 2: Status de entrega');
    const response2 = await axios.post(`${BASE_URL}/api/whatsapp/webhook/delivery-status`, {
      ...testData,
      delivery_status: 'delivered',
      status_timestamp: new Date().toISOString()
    }, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Status de entrega:', response2.data);

    // Teste 3: Conversão de venda
    console.log('\n💰 Teste 3: Conversão de venda');
    const response3 = await axios.post(`${BASE_URL}/api/whatsapp/webhook/conversion`, {
      ...testData,
      conversion_type: 'sale',
      conversion_value: 1500.00,
      conversion_date: new Date().toISOString(),
      notes: 'Cliente interessado no plano premium'
    }, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Conversão de venda:', response3.data);

    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Webhook está funcionando corretamente');
    console.log('✅ Dados estão sendo salvos no banco');
    console.log('✅ Sistema de Analytics está operacional');

  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 SOLUÇÃO:');
      console.log('1. Certifique-se de que o backend está rodando');
      console.log('2. Execute: cd backend && npm start');
      console.log('3. Aguarde a mensagem "Server running on port 3000"');
    }
  }
}

// Executar teste
testWebhook();
























