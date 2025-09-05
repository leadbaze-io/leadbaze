require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔧 Debug do item específico que está dando erro...');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function debugSpecificItem() {
    try {
        const itemId = 'fa4b0cc7-7380-4131-b9b8-8074fa046743';
        
        // 1. Verificar o item na fila
        console.log('🔍 Verificando item na fila...');
        const { data: queueItem, error: queueError } = await supabase
            .from('n8n_blog_queue')
            .select('*')
            .eq('id', itemId)
            .single();
        
        if (queueError) {
            console.error('❌ Erro ao buscar item:', queueError);
        } else {
            console.log('📋 Item na fila:', JSON.stringify(queueItem, null, 2));
        }

        // 2. Verificar se a categoria existe
        console.log('🔍 Verificando categoria...');
        const { data: category, error: catError } = await supabase
            .from('blog_categories')
            .select('*')
            .eq('name', queueItem.category);
        
        if (catError) {
            console.error('❌ Erro ao buscar categoria:', catError);
        } else {
            console.log('📋 Categoria encontrada:', JSON.stringify(category, null, 2));
        }

        // 3. Verificar se há posts com slug similar
        console.log('🔍 Verificando slugs existentes...');
        const baseSlug = queueItem.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
        const { data: existingPosts, error: postsError } = await supabase
            .from('blog_posts')
            .select('slug')
            .ilike('slug', baseSlug + '%');
        
        if (postsError) {
            console.error('❌ Erro ao buscar posts:', postsError);
        } else {
            console.log('📋 Posts com slug similar:', JSON.stringify(existingPosts, null, 2));
        }

        // 4. Testar inserção manual
        console.log('🚀 Testando inserção manual...');
        try {
            const { data: newPost, error: insertError } = await supabase
                .from('blog_posts')
                .insert({
                    title: queueItem.title,
                    slug: baseSlug + '-teste',
                    excerpt: 'Teste de excerpt',
                    content: queueItem.content,
                    featured_image: queueItem.imageurl,
                    category_id: category[0]?.id,
                    author_name: queueItem.autor || 'LeadBaze Team',
                    published: true,
                    published_at: new Date().toISOString()
                })
                .select()
                .single();
            
            if (insertError) {
                console.error('❌ Erro na inserção:', insertError);
            } else {
                console.log('✅ Post inserido com sucesso:', JSON.stringify(newPost, null, 2));
                
                // Deletar o post de teste
                await supabase.from('blog_posts').delete().eq('id', newPost.id);
                console.log('🗑️ Post de teste deletado');
            }
        } catch (insertErr) {
            console.error('💥 Erro na inserção:', insertErr);
        }

    } catch (err) {
        console.error('💥 Erro geral:', err);
    }
}

debugSpecificItem();
