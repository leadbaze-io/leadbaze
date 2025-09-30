require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testando Filtros do Frontend\n');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testFrontendFilters() {
    try {
        console.log('📊 Testando getCategories (como o frontend faz):');
        
        // Simular a função getCategories do frontend
        const { data, error } = await supabase
            .from('blog_categories')
            .select('*')
            .order('name');
        
        if (error) {
            console.error('❌ Erro ao buscar categorias:', error);
        } else {
            console.log(`✅ Categorias encontradas: ${data.length}`);
            data.forEach(category => {
                console.log(`  - ${category.name} (slug: ${category.slug})`);
            });
        }
        
        console.log('\n📊 Testando filtro por categoria específica:');
        
        // Testar filtro por "prospeccao-b2b"
        const { data: categoryData } = await supabase
            .from('blog_categories')
            .select('id')
            .eq('slug', 'prospeccao-b2b')
            .single();
        
        if (categoryData) {
            console.log(`✅ Categoria "prospeccao-b2b" encontrada com ID: ${categoryData.id}`);
            
            const { data: posts, error: postsError } = await supabase
                .from('blog_posts')
                .select(`
                    id,
                    title,
                    category_id,
                    blog_categories (
                        id,
                        name,
                        slug
                    )
                `)
                .eq('published', true)
                .eq('category_id', categoryData.id)
                .order('published_at', { ascending: false });
            
            if (postsError) {
                console.error('❌ Erro ao buscar posts:', postsError);
            } else {
                console.log(`✅ Posts encontrados na categoria: ${posts.length}`);
                posts.forEach(post => {
                    console.log(`  - ${post.title}`);
                });
            }
        } else {
            console.log('❌ Categoria "prospeccao-b2b" não encontrada');
        }
        
        console.log('\n📊 Testando filtro por "automacao-vendas":');
        
        // Testar filtro por "automacao-vendas"
        const { data: categoryData2 } = await supabase
            .from('blog_categories')
            .select('id')
            .eq('slug', 'automacao-vendas')
            .single();
        
        if (categoryData2) {
            console.log(`✅ Categoria "automacao-vendas" encontrada com ID: ${categoryData2.id}`);
            
            const { data: posts2, error: postsError2 } = await supabase
                .from('blog_posts')
                .select(`
                    id,
                    title,
                    category_id,
                    blog_categories (
                        id,
                        name,
                        slug
                    )
                `)
                .eq('published', true)
                .eq('category_id', categoryData2.id)
                .order('published_at', { ascending: false });
            
            if (postsError2) {
                console.error('❌ Erro ao buscar posts:', postsError2);
            } else {
                console.log(`✅ Posts encontrados na categoria: ${posts2.length}`);
                posts2.forEach(post => {
                    console.log(`  - ${post.title}`);
                });
            }
        } else {
            console.log('❌ Categoria "automacao-vendas" não encontrada');
        }
        
    } catch (error) {
        console.error('💥 Erro geral:', error);
    }
}

testFrontendFilters();
