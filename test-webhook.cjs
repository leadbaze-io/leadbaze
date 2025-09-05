const axios = require('axios');

async function testWebhook() {
  try {
    console.log('🧪 Testando Webhook N8N...\n');
    
    const testData = {
      title: 'Artigo de Teste via Webhook N8N',
      content: `
        <h1>Teste de Webhook N8N</h1>
        <p>Este artigo foi criado através do webhook do N8N para testar a automação do blog.</p>
        <h2>Funcionalidades Testadas:</h2>
        <ul>
          <li>✅ Recebimento de dados via webhook</li>
          <li>✅ Inserção na fila N8N</li>
          <li>✅ Processamento automático</li>
          <li>✅ Criação de artigo no blog</li>
        </ul>
        <p>O sistema está funcionando perfeitamente!</p>
      `,
      category: 'Automação',
      date: new Date().toISOString().split('T')[0],
      imageurl: 'https://via.placeholder.com/800x400/10b981/ffffff?text=Webhook+N8N+Test',
      autor: 'Sistema N8N'
    };
    
    console.log('📤 Enviando dados para o webhook...');
    console.log('Dados:', JSON.stringify(testData, null, 2));
    console.log('');
    
    const response = await axios.post('http://localhost:3001/api/blog/automation/webhook', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Resposta do webhook:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('');
    
    // Aguardar um pouco e verificar se foi adicionado à fila
    console.log('⏳ Aguardando 2 segundos...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar estatísticas
    console.log('📊 Verificando estatísticas...');
    const statsResponse = await axios.get('http://localhost:3001/api/blog/automation/stats');
    console.log('Estatísticas:', JSON.stringify(statsResponse.data, null, 2));
    
    console.log('\n🎉 Teste do webhook concluído com sucesso!');
    console.log('💡 Agora você pode:');
    console.log('   1. Acessar o dashboard: http://localhost:5173/admin/blog-automation');
    console.log('   2. Processar a fila manualmente');
    console.log('   3. Verificar se o artigo aparece no blog');
    
  } catch (error) {
    console.error('❌ Erro no teste do webhook:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Erro:', error.message);
    }
  }
}

testWebhook();
