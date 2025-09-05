const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testSQLDirect() {
  try {
    console.log('🔍 Testando função SQL diretamente...');
    
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    
    console.log('📡 Conectando ao Supabase...');
    console.log('🌐 URL:', process.env.SUPABASE_URL);
    
    // Testar conexão
    const { data: testData, error: testError } = await supabase
      .from('n8n_blog_queue')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('❌ Erro de conexão:', testError);
      return;
    }
    
    console.log('✅ Conexão com Supabase OK');
    
    // Verificar itens pendentes
    console.log('\n📋 Verificando itens pendentes...');
    const { data: pendingItems, error: pendingError } = await supabase
      .from('n8n_blog_queue')
      .select('id, title, processed, error_message')
      .eq('processed', false);
    
    if (pendingError) {
      console.log('❌ Erro ao buscar itens pendentes:', pendingError);
      return;
    }
    
    console.log(`📊 Itens pendentes: ${pendingItems?.length || 0}`);
    pendingItems?.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.title} (ID: ${item.id})`);
      if (item.error_message) {
        console.log(`      ❌ Erro: ${item.error_message}`);
      }
    });
    
    if (pendingItems?.length === 0) {
      console.log('ℹ️ Nenhum item pendente para processar');
      return;
    }
    
    // Chamar função SQL
    console.log('\n🚀 Chamando função SQL process_n8n_blog_queue...');
    const { data: result, error: sqlError } = await supabase.rpc('process_n8n_blog_queue');
    
    if (sqlError) {
      console.log('❌ Erro na função SQL:');
      console.log('   Código:', sqlError.code);
      console.log('   Mensagem:', sqlError.message);
      console.log('   Detalhes:', sqlError.details);
      console.log('   Hint:', sqlError.hint);
      return;
    }
    
    console.log('✅ Função SQL executada com sucesso!');
    console.log('📄 Resultado:', JSON.stringify(result, null, 2));
    
    if (result && result[0]) {
      const { processed_count, error_count, details } = result[0];
      console.log(`\n📊 Resumo:`);
      console.log(`   ✅ Processados: ${processed_count}`);
      console.log(`   ❌ Erros: ${error_count}`);
      
      if (details && details.length > 0) {
        console.log(`\n📋 Detalhes:`);
        details.forEach((detail, index) => {
          console.log(`   ${index + 1}. ${detail.title} - ${detail.status}`);
          if (detail.error) {
            console.log(`      ❌ Erro: ${detail.error}`);
          }
          if (detail.blog_post_id) {
            console.log(`      ✅ Post ID: ${detail.blog_post_id}`);
          }
        });
      }
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

testSQLDirect();
