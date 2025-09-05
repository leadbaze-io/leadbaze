require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testando Filtros do Blog\n');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testBlogFilters() {
    try {
        console.log('📊 Testando consulta geral (todos os posts):');
        
        // Teste 1: Todos os posts
        const { data: allPosts, error: allError } = await supabase
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
            .order('published_at', { ascending: false });
        
        if (allError) {
            console.error('❌ Erro na consulta geral:', allError);
        } else {
            console.log(`✅ Total de posts encontrados: ${allPosts.length}`);
            allPosts.forEach(post => {
                console.log(`  - ${post.title} → ${post.blog_categories?.name || 'SEM CATEGORIA'}`);
            });
        }
        
        console.log('\n📊 Testando filtro por categoria "Prospecção B2B":');
        
        // Teste 2: Filtro por categoria
        const { data: categoryData } = await supabase
            .from('blog_categories')
            .select('id')
            .eq('slug', 'prospeccao-b2b')
            .single();
        
        if (categoryData) {
            const { data: filteredPosts, error: filterError } = await supabase
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
            
            if (filterError) {
                console.error('❌ Erro no filtro:', filterError);
            } else {
                console.log(`✅ Posts na categoria "Prospecção B2B": ${filteredPosts.length}`);
                filteredPosts.forEach(post => {
                    console.log(`  - ${post.title} → ${post.blog_categories?.name || 'SEM CATEGORIA'}`);
                });
            }
        } else {
            console.log('❌ Categoria não encontrada');
        }
        
        console.log('\n📊 Testando filtro por categoria "Automação de Vendas":');
        
        // Teste 3: Filtro por outra categoria
        const { data: categoryData2 } = await supabase
            .from('blog_categories')
            .select('id')
            .eq('slug', 'automacao-vendas')
            .single();
        
        if (categoryData2) {
            const { data: filteredPosts2, error: filterError2 } = await supabase
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
            
            if (filterError2) {
                console.error('❌ Erro no filtro:', filterError2);
            } else {
                console.log(`✅ Posts na categoria "Automação de Vendas": ${filteredPosts2.length}`);
                filteredPosts2.forEach(post => {
                    console.log(`  - ${post.title} → ${post.blog_categories?.name || 'SEM CATEGORIA'}`);
                });
            }
        } else {
            console.log('❌ Categoria não encontrada');
        }
        
    } catch (error) {
        console.error('💥 Erro geral:', error);
    }
}

testBlogFilters();
