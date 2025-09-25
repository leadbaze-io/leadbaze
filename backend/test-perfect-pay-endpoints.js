const axios = require('axios');
require('dotenv').config();

async function testPerfectPayEndpoints() {
  console.log('🧪 [TESTE] ===== TESTANDO ENDPOINTS PERFECT PAY =====');

  const baseUrl = 'https://app.perfectpay.com.br/api/v1';
  const accessToken = process.env.PERFECT_PAY_ACCESS_TOKEN;

  if (!accessToken) {
    console.log('❌ [TESTE] Token de acesso não configurado');
    return;
  }

  const endpoints = [
    '/subscriptions',
    '/subscriptions/cancel',
    '/subscriptions/{id}/cancel',
    '/subscriptions/{id}',
    '/subscription/cancel',
    '/subscription/{id}/cancel',
    '/cancel-subscription',
    '/subscription-management',
    '/subscription-status'
  ];

  console.log('📡 [TESTE] Testando endpoints possíveis...');

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 [TESTE] Testando: ${endpoint}`);
      
      const response = await axios.get(`${baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        },
        timeout: 5000
      });

      console.log(`✅ [TESTE] ${endpoint} - Status: ${response.status}`);
      console.log(`📊 [TESTE] Resposta:`, response.data);

    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          console.log(`❌ [TESTE] ${endpoint} - Não encontrado (404)`);
        } else if (status === 401) {
          console.log(`🔐 [TESTE] ${endpoint} - Não autorizado (401)`);
        } else if (status === 403) {
          console.log(`🚫 [TESTE] ${endpoint} - Proibido (403)`);
        } else {
          console.log(`⚠️ [TESTE] ${endpoint} - Erro ${status}`);
        }
      } else {
        console.log(`❌ [TESTE] ${endpoint} - Erro de conexão`);
      }
    }
  }

  console.log('\n🎯 [TESTE] ===== CONCLUSÃO =====');
  console.log('💡 [TESTE] Se algum endpoint retornou 200/201, pode ser útil');
  console.log('💡 [TESTE] Se todos retornaram 404, não há API de cancelamento');
}

testPerfectPayEndpoints().catch(console.error);


