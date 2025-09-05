const axios = require('axios');

async function testDashboardLogs() {
  try {
    console.log('🔍 Testando logs do dashboard...');
    
    // Primeiro, adicionar um post de teste
    console.log('\n📝 Adicionando post de teste...');
    const postData = {
      title: "Teste de Logs Detalhados",
      content: `
        <h2>Este é um post para testar logs</h2>
        <p>Este post foi criado para testar os logs detalhados no Chrome F12.</p>
        
        <h3>Objetivo</h3>
        <p>Verificar se os logs aparecem corretamente no console do navegador.</p>
      `,
      category: "Teste",
      date: new Date().toISOString(),
      imageurl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop&crop=center",
      autor: "LeadBaze Team"
    };
    
    const addResponse = await axios.post('http://localhost:3001/api/blog/queue/add', postData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    if (addResponse.data.success) {
      console.log('✅ Post de teste adicionado!');
      console.log('📄 ID:', addResponse.data.data?.id);
      
      console.log('\n🔧 Instruções para testar logs:');
      console.log('1. Abra o Chrome e vá para: http://localhost:5173/admin/blog-automation');
      console.log('2. Abra o DevTools (F12)');
      console.log('3. Vá para a aba "Console"');
      console.log('4. Clique em "Processar Fila"');
      console.log('5. Observe os logs detalhados que aparecem');
      console.log('\n📋 Logs esperados:');
      console.log('   🎯 [Dashboard] Iniciando processamento da fila...');
      console.log('   📞 [Dashboard] Chamando blogAutomationService.processQueue()');
      console.log('   🚀 [BlogAutomation] Iniciando processamento da fila...');
      console.log('   👤 [BlogAutomation] Usuário: creaty12345@gmail.com');
      console.log('   📡 [BlogAutomation] Fazendo requisição para /api/blog/automation/admin/process');
      console.log('   🌐 [BlogAutomation] URL: http://localhost:3001/api/blog/automation/admin/process');
      console.log('   📋 [BlogAutomation] Headers: {...}');
      console.log('   📡 [BlogAutomation] Response status: 200');
      console.log('   📄 [BlogAutomation] Response data: {...}');
      console.log('   ✅ [BlogAutomation] Resultado da requisição: {...}');
      console.log('   📊 [Dashboard] Resultado recebido: {...}');
      
    } else {
      console.log('❌ Erro ao adicionar post:', addResponse.data.error);
    }
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

testDashboardLogs();
