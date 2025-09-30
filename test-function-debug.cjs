const axios = require('axios');

async function testFunctionDebug() {
  try {
    console.log('🔍 Testando função com logs detalhados...');
    
    // Primeiro, vamos ver o que está na fila
    console.log('\n📋 Verificando fila atual...');
    const queueResponse = await axios.get('http://localhost:3001/api/blog/queue/list', {
      timeout: 10000
    });
    
    if (queueResponse.data.success) {
      console.log('📄 Itens na fila:', queueResponse.data.data.length);
      queueResponse.data.data.forEach((item, index) => {
        console.log(`${index + 1}. ${item.title} (${item.processed ? 'Processado' : 'Pendente'})`);
      });
    }
    
    // Agora vamos testar a função
    console.log('\n🚀 Executando função de processamento...');
    const response = await axios.post('http://localhost:3001/api/blog/automation/admin/process', {}, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
    
    console.log('\n📄 Resultado:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Verificar fila novamente
    console.log('\n📋 Verificando fila após processamento...');
    const queueResponse2 = await axios.get('http://localhost:3001/api/blog/queue/list', {
      timeout: 10000
    });
    
    if (queueResponse2.data.success) {
      console.log('📄 Itens na fila após processamento:', queueResponse2.data.data.length);
      queueResponse2.data.data.forEach((item, index) => {
        console.log(`${index + 1}. ${item.title} (${item.processed ? 'Processado' : 'Pendente'})`);
        if (item.error_message) {
          console.log(`   ❌ Erro: ${item.error_message}`);
        }
      });
    }
    
  } catch (error) {
    console.log('❌ Erro na requisição:', error.response?.status || error.message);
    if (error.response?.data) {
      console.log('📄 Resposta:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testFunctionDebug();
