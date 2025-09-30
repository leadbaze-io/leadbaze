const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/config.env' });

async function testSupabaseDirect() {
  try {
    console.log('🔍 Testando função diretamente no Supabase...');
    
    // Criar cliente Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Verificar itens na fila
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
    queueItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title} (ID: ${item.id})`);
    });
    
    if (queueItems.length === 0) {
      console.log('✅ Nenhum item pendente na fila!');
      return;
    }
    
    // Executar função
    console.log('\n🚀 Executando função process_n8n_blog_queue...');
    const { data: result, error: functionError } = await supabase
      .rpc('process_n8n_blog_queue');
    
    if (functionError) {
      console.log('❌ Erro na função:', functionError);
      return;
    }
    
    console.log('\n📄 Resultado da função:');
    console.log(JSON.stringify(result, null, 2));
    
    // Verificar fila novamente
    console.log('\n📋 Verificando fila após processamento...');
    const { data: queueItemsAfter, error: queueErrorAfter } = await supabase
      .from('n8n_blog_queue')
      .select('*')
      .eq('processed', false)
      .order('created_at', { ascending: false });
    
    if (queueErrorAfter) {
      console.log('❌ Erro ao buscar fila após processamento:', queueErrorAfter);
      return;
    }
    
    console.log('📄 Itens pendentes após processamento:', queueItemsAfter.length);
    queueItemsAfter.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title} (ID: ${item.id})`);
      if (item.error_message) {
        console.log(`   ❌ Erro: ${item.error_message}`);
      }
    });
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

testSupabaseDirect();
