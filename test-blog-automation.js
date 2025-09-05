const axios = require('axios');

async function testBlogAutomation() {
  try {
    console.log('🧪 Testando Blog Automation API...\n');
    
    // Teste 1: Health Check
    console.log('1️⃣ Testando Health Check...');
    const healthResponse = await axios.get('http://localhost:3001/api/blog/automation/health');
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');
    
    // Teste 2: Stats
    console.log('2️⃣ Testando Stats...');
    const statsResponse = await axios.get('http://localhost:3001/api/blog/automation/stats');
    console.log('✅ Stats:', statsResponse.data);
    console.log('');
    
    // Teste 3: Inserir dados de teste na fila N8N
    console.log('3️⃣ Inserindo dados de teste na fila N8N...');
    const testData = {
      title: 'Artigo de Teste - Automação N8N',
      content: '<h1>Teste de Automação</h1><p>Este é um artigo criado automaticamente pelo sistema N8N para testar a automação do blog.</p><p>O sistema deve processar este artigo e criar um post no blog automaticamente.</p>',
      category: 'Teste',
      date: new Date().toISOString().split('T')[0],
      imageurl: 'https://via.placeholder.com/800x400/6366f1/ffffff?text=Artigo+de+Teste',
      autor: 'Sistema N8N'
    };
    
    // Simular inserção na tabela n8n_blog_queue
    console.log('📝 Dados de teste:', testData);
    console.log('💡 Para inserir na fila, execute o SQL no Supabase:');
    console.log(`
INSERT INTO n8n_blog_queue (title, content, category, date, imageurl, autor)
VALUES (
  '${testData.title}',
  '${testData.content}',
  '${testData.category}',
  '${testData.date}',
  '${testData.imageurl}',
  '${testData.autor}'
);
    `);
    console.log('');
    
    // Teste 4: Processar fila (requer autenticação admin)
    console.log('4️⃣ Testando processamento da fila (requer autenticação)...');
    try {
      const processResponse = await axios.post('http://localhost:3001/api/blog/automation/admin/process', {}, {
        headers: {
          'x-user-email': 'creaty12345@gmail.com'
        }
      });
      console.log('✅ Processamento:', processResponse.data);
    } catch (error) {
      console.log('⚠️ Erro no processamento (pode ser normal se não há dados):', error.response?.data || error.message);
    }
    
    console.log('\n🎉 Testes concluídos!');
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error.response?.data || error.message);
  }
}

testBlogAutomation();
