// Teste simples do webhook N8N usando fetch
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

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log('✅ Resposta recebida!');
    console.log('📊 Status:', response.status);
    console.log('📄 Status Text:', response.statusText);

    const data = await response.text();
    console.log('📄 Tipo da resposta:', typeof data);
    console.log('📋 Dados da resposta:', data);

    if (data === "" || data === null) {
      console.log('❌ PROBLEMA: N8N retornou resposta vazia');
      console.log('💡 Isso indica que o webhook não está configurado corretamente');
    } else {
      try {
        const jsonData = JSON.parse(data);
        if (Array.isArray(jsonData)) {
          console.log('✅ SUCESSO: N8N retornou array de dados');
          console.log(`📊 ${jsonData.length} itens encontrados`);
        } else if (jsonData && typeof jsonData === 'object') {
          console.log('✅ SUCESSO: N8N retornou objeto de dados');
          console.log('🔍 Propriedades:', Object.keys(jsonData));
        }
      } catch (parseError) {
        console.log('⚠️ AVISO: Resposta não é JSON válido');
        console.log('📄 Resposta recebida:', data);
      }
    }

  } catch (error) {
    console.error('❌ ERRO ao testar webhook:');
    console.error('📄 Mensagem:', error.message);
    
    console.log('\n🔧 SOLUÇÕES:');
    console.log('1. Verificar se o N8N está rodando');
    console.log('2. Verificar se o workflow está ativo');
    console.log('3. Verificar se o webhook está habilitado');
    console.log('4. Verificar se a URL está correta');
  }
}

// Executar teste
testN8NWebhook(); 