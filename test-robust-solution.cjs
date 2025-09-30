const axios = require('axios');

async function testRobustSolution() {
  try {
    console.log('🔧 Testando solução robusta...');
    
    // 1. Adicionar post de teste
    console.log('\n📝 1. Adicionando post de teste...');
    const postData = {
      title: "Solução Robusta Implementada!",
      content: `
        <h2>🎉 Sistema Funcionando Perfeitamente!</h2>
        <p>Esta é uma versão robusta que resolve todos os problemas:</p>
        
        <h3>✅ Correções Implementadas:</h3>
        <ul>
          <li>Função SQL com WHERE clause explícita</li>
          <li>Rate limiting otimizado</li>
          <li>Logs detalhados</li>
          <li>Tratamento de erros robusto</li>
        </ul>
        
        <h3>🚀 Pronto para Produção!</h3>
        <p>O sistema agora está completamente funcional e otimizado.</p>
      `,
      category: "Sucesso",
      date: new Date().toISOString(),
      imageurl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center",
      autor: "LeadBaze Team"
    };
    
    const addResponse = await axios.post('http://localhost:3001/api/blog/queue/add', postData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    if (addResponse.data.success) {
      console.log('✅ Post de teste adicionado!');
      console.log('📄 ID:', addResponse.data.data?.id);
      
      console.log('\n🔧 2. Instruções para testar:');
      console.log('1. Execute o SQL no Supabase:');
      console.log('   - Abra: fix-function-robust.sql');
      console.log('   - Cole no SQL Editor do Supabase');
      console.log('   - Execute');
      
      console.log('\n2. Reinicie o backend:');
      console.log('   - Ctrl+C no terminal do backend');
      console.log('   - node server.js');
      
      console.log('\n3. Teste no Dashboard:');
      console.log('   - Vá para: http://localhost:5173/admin/blog-automation');
      console.log('   - Clique em "Processar Fila"');
      console.log('   - Deve funcionar sem erros!');
      
      console.log('\n📋 4. Logs esperados:');
      console.log('   🚀 [ROBUST] Iniciando processamento da fila N8N...');
      console.log('   📝 [ROBUST] Processando: Solução Robusta Implementada!');
      console.log('   ✅ [ROBUST] Categoria encontrada: Sucesso');
      console.log('   🔗 [ROBUST] Slug gerado: solucao-robusta-implementada');
      console.log('   ✅ [ROBUST] Post criado com sucesso');
      console.log('   ✅ [ROBUST] Item marcado como processado');
      console.log('   🏁 [ROBUST] Processamento concluído: 1 processados, 0 erros');
      
    } else {
      console.log('❌ Erro ao adicionar post:', addResponse.data.error);
    }
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

testRobustSolution();
