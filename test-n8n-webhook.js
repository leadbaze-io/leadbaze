// Script para testar o webhook N8N
const axios = require('axios');

const N8N_WEBHOOK_URL = 'https://n8n-n8n-start.kof6cn.easypanel.host/webhook/b1b11d27-2dfa-42a6-bbaf-b0fa456c0bae';

async function testN8NWebhook() {
  console.log('🧪 Testando webhook N8N...');
  console.log('📍 URL:', N8N_WEBHOOK_URL);
  
  try {
    const testData = {
      google_maps_url: 'https://www.google.com/maps/search/restaurantes+sp',
      limit: 5,
      user_id: 'test-user-123',
      timestamp: new Date().toISOString()
    };

    console.log('📤 Enviando dados de teste:', JSON.stringify(testData, null, 2));

    const response = await axios.post(N8N_WEBHOOK_URL, testData, {
      timeout: 30000, // 30 segundos
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Resposta recebida!');
    console.log('📊 Status:', response.status);
    console.log('📄 Tipo da resposta:', typeof response.data);
    console.log('📋 Dados da resposta:', JSON.stringify(response.data, null, 2));

    if (response.data === "" || response.data === null) {
      console.log('❌ PROBLEMA: N8N retornou resposta vazia');
      console.log('💡 Isso indica que o webhook não está configurado corretamente');
    } else if (Array.isArray(response.data)) {
      console.log('✅ SUCESSO: N8N retornou array de dados');
      console.log(`📊 ${response.data.length} itens encontrados`);
    } else if (response.data && typeof response.data === 'object') {
      console.log('✅ SUCESSO: N8N retornou objeto de dados');
      console.log('🔍 Propriedades:', Object.keys(response.data));
    } else {
      console.log('⚠️ AVISO: Formato de resposta inesperado');
    }

  } catch (error) {
    console.error('❌ ERRO ao testar webhook:');
    console.error('📄 Mensagem:', error.message);
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📋 Dados:', error.response.data);
    } else if (error.request) {
      console.error('🌐 Erro de rede - N8N não está respondendo');
    }
    
    console.log('\n🔧 SOLUÇÕES:');
    console.log('1. Verificar se o N8N está rodando');
    console.log('2. Verificar se o workflow está ativo');
    console.log('3. Verificar se o webhook está habilitado');
    console.log('4. Verificar se a URL está correta');
  }
}

// Executar teste
testN8NWebhook(); 