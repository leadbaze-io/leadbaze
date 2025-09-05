require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

console.log('🚀 Processando Fila de Posts Formatados\n');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function processQueue() {
    try {
        console.log('📊 Verificando itens na fila...');
        
        // Verificar itens pendentes
        const { data: queueItems, error: queueError } = await supabase
            .from('n8n_blog_queue')
            .select('*')
            .eq('processed', false)
            .order('created_at', { ascending: true });
        
        if (queueError) {
            console.error('❌ Erro ao verificar fila:', queueError);
            return;
        }
        
        console.log(`📝 Encontrados ${queueItems.length} itens na fila`);
        
        if (queueItems.length === 0) {
            console.log('✅ Nenhum item pendente na fila');
            return;
        }
        
        // Mostrar itens pendentes
        queueItems.forEach((item, index) => {
            console.log(`\n📄 Item ${index + 1}:`);
            console.log(`   Título: ${item.title}`);
            console.log(`   Categoria: ${item.category}`);
            console.log(`   Criado em: ${item.created_at}`);
            console.log(`   Tamanho: ${item.content.length} caracteres`);
        });
        
        console.log('\n🚀 Processando fila...');
        
        // Processar fila usando a função SQL
        const { data, error } = await supabase.rpc('process_n8n_blog_queue');
        
        if (error) {
            console.error('❌ Erro ao processar fila:', error);
            return;
        }
        
        console.log('\n✅ Fila processada com sucesso!');
        console.log('📊 Resultado:', JSON.stringify(data, null, 2));
        
        // Verificar posts criados
        console.log('\n📝 Verificando posts criados...');
        const { data: posts, error: postsError } = await supabase
            .from('blog_posts')
            .select('id, title, slug, category_id, created_at')
            .order('created_at', { ascending: false })
            .limit(5);
        
        if (postsError) {
            console.error('❌ Erro ao verificar posts:', postsError);
            return;
        }
        
        console.log(`\n📚 Últimos ${posts.length} posts criados:`);
        posts.forEach((post, index) => {
            console.log(`\n📄 Post ${index + 1}:`);
            console.log(`   Título: ${post.title}`);
            console.log(`   Slug: ${post.slug}`);
            console.log(`   ID: ${post.id}`);
            console.log(`   Criado em: ${post.created_at}`);
        });
        
        console.log('\n🎉 Processamento concluído!');
        console.log('🌐 Verifique o blog em: http://localhost:5173/blog');
        
    } catch (error) {
        console.error('💥 Erro geral:', error);
    }
}

processQueue();
