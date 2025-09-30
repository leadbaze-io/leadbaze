const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './config.env' });

async function testSQLDirect() {
  try {
    console.log('🔍 Testando função SQL diretamente...');
    
    console.log('🔧 Verificando variáveis de ambiente...');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Definida' : '❌ Não definida');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Definida' : '❌ Não definida');
    
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
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
    
    // Verificar TODOS os itens (não apenas pendentes)
    console.log('\n📋 Verificando TODOS os itens da fila...');
    const { data: allItems, error: allError } = await supabase
      .from('n8n_blog_queue')
      .select('id, title, processed, error_message, processed_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (allError) {
      console.log('❌ Erro ao buscar todos os itens:', allError);
      return;
    }
    
    console.log(`📊 Total de itens na fila: ${allItems?.length || 0}`);
    allItems?.forEach((item, index) => {
      const status = item.processed ? '✅ Processado' : '⏳ Pendente';
      console.log(`   ${index + 1}. ${item.title} (ID: ${item.id}) - ${status}`);
      if (item.error_message) {
        console.log(`      ❌ Erro: ${item.error_message}`);
      }
      if (item.processed_at) {
        console.log(`      📅 Processado em: ${item.processed_at}`);
      }
    });
    
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
      
      // Verificar se os posts foram criados no blog
      console.log('\n📝 Verificando posts criados no blog...');
      const { data: blogPosts, error: blogError } = await supabase
        .from('blog_posts')
        .select('id, title, slug, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (blogError) {
        console.log('❌ Erro ao buscar posts do blog:', blogError);
      } else {
        console.log(`📊 Posts no blog: ${blogPosts?.length || 0}`);
        blogPosts?.forEach((post, index) => {
          console.log(`   ${index + 1}. ${post.title} (ID: ${post.id})`);
          console.log(`      🔗 Slug: ${post.slug}`);
          console.log(`      📅 Criado: ${post.created_at}`);
        });
      }
      
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
