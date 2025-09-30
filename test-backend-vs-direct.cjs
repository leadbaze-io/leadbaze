const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './config.env' });

async function testBackendVsDirect() {
  try {
    console.log('🔍 Testando diferença entre backend e execução direta...');
    
    // Criar cliente Supabase (mesmo que o backend usa)
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('\n📋 Verificando fila atual...');
    const { data: queueItems, error: queueError } = await supabase
      .from('n8n_blog_queue')
      .select('*')
      .eq('processed', false)
      .order('created_at', { ascending: false });
    
    if (queueError) {
      console.log('❌ Erro ao buscar fila:', queueError);
      return;
    }
    
    console.log('📄 Itens pendentes na fila:', queueItems.length);
    if (queueItems.length === 0) {
      console.log('✅ Nenhum item pendente na fila!');
      return;
    }
    
    // Teste 1: Executar via RPC (como o backend faz)
    console.log('\n🚀 Teste 1: Executando via RPC (como backend)...');
    try {
      const { data: rpcResult, error: rpcError } = await supabase.rpc('process_n8n_blog_queue');
      
      if (rpcError) {
        console.log('❌ Erro no RPC:', rpcError);
        console.log('📄 Detalhes do erro:', JSON.stringify(rpcError, null, 2));
      } else {
        console.log('✅ RPC executado com sucesso!');
        console.log('📄 Resultado:', JSON.stringify(rpcResult, null, 2));
      }
    } catch (rpcException) {
      console.log('❌ Exceção no RPC:', rpcException.message);
    }
    
    // Teste 2: Executar via query direta (como você fez)
    console.log('\n🚀 Teste 2: Executando via query direta...');
    try {
      const { data: queryResult, error: queryError } = await supabase
        .from('n8n_blog_queue')
        .select('*')
        .eq('processed', false)
        .limit(1);
      
      if (queryError) {
        console.log('❌ Erro na query:', queryError);
      } else {
        console.log('✅ Query executada com sucesso!');
        console.log('📄 Resultado:', JSON.stringify(queryResult, null, 2));
      }
    } catch (queryException) {
      console.log('❌ Exceção na query:', queryException.message);
    }
    
    // Verificar fila após testes
    console.log('\n📋 Verificando fila após testes...');
    const { data: queueItemsAfter, error: queueErrorAfter } = await supabase
      .from('n8n_blog_queue')
      .select('*')
      .eq('processed', false)
      .order('created_at', { ascending: false });
    
    if (queueErrorAfter) {
      console.log('❌ Erro ao buscar fila após testes:', queueErrorAfter);
      return;
    }
    
    console.log('📄 Itens pendentes após testes:', queueItemsAfter.length);
    queueItemsAfter.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title} (ID: ${item.id})`);
      if (item.error_message) {
        console.log(`   ❌ Erro: ${item.error_message}`);
      }
    });
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
    console.log('📄 Stack:', error.stack);
  }
}

testBackendVsDirect();
