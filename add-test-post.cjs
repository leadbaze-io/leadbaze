const axios = require('axios');

async function addTestPost() {
  try {
    console.log('📝 Adicionando post de teste à fila...');
    
    const postData = {
      title: "Teste Final do Dashboard - Sistema Funcionando!",
      content: `
        <h2>🎉 Teste Final!</h2>
        <p>Este é um post de teste para verificar se o dashboard está funcionando corretamente.</p>
        
        <h3>Funcionalidades Testadas:</h3>
        <ul>
          <li>✅ Adição à fila</li>
          <li>✅ Processamento automático</li>
          <li>✅ Criação de posts</li>
          <li>✅ Dashboard em tempo real</li>
        </ul>
        
        <h3>Resultado Esperado:</h3>
        <p>Este post deve ser processado com sucesso e aparecer no blog principal!</p>
      `,
      category: "Teste",
      date: new Date().toISOString(),
      imageurl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center",
      autor: "LeadBaze Team"
    };
    
    const response = await axios.post('http://localhost:3001/api/blog/queue/add', postData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    if (response.data.success) {
      console.log('✅ Post adicionado à fila com sucesso!');
      console.log('📄 ID:', response.data.data?.id);
      console.log('📝 Título:', response.data.data?.title);
      console.log('📅 Data:', response.data.data?.created_at);
      
      console.log('\n🧪 Agora teste no Dashboard:');
      console.log('1. Vá para: http://localhost:5173/admin/blog-automation');
      console.log('2. Clique em "Processar Fila"');
      console.log('3. Deve processar com sucesso!');
      console.log('4. Verifique o blog principal: http://localhost:5173/blog');
      
    } else {
      console.log('❌ Erro ao adicionar post:', response.data.error);
    }
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

addTestPost();