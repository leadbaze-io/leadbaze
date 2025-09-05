require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

console.log('🎯 Testando Categorias com Contadores\n');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testCategoriesWithCount() {
    try {
        console.log('📊 Buscando as 5 categorias principais com contadores:');
        
        const mainCategoryNames = [
            'Prospecção B2B',
            'Estratégias de Outbound', 
            'Gestão e Vendas B2B',
            'Inteligência de Dados',
            'Automação de Vendas'
        ];
        
        const { data, error } = await supabase
            .from('blog_categories')
            .select('*')
            .in('name', mainCategoryNames)
            .order('name');
        
        if (error) {
            console.error('❌ Erro ao buscar categorias:', error);
            return;
        }
        
        console.log(`✅ Categorias encontradas: ${data.length}\n`);
        
        // Para cada categoria, buscar a contagem de posts
        for (const category of data) {
            const { count } = await supabase
                .from('blog_posts')
                .select('*', { count: 'exact', head: true })
                .eq('published', true)
                .eq('category_id', category.id);
            
            const postCount = count || 0;
            console.log(`📝 ${category.name}: ${postCount} posts`);
        }
        
        console.log('\n🎯 Resumo:');
        console.log('- Categorias com posts: Mostrarão o contador');
        console.log('- Categorias sem posts: NÃO mostrarão o contador (0)');
        
    } catch (error) {
        console.error('💥 Erro geral:', error);
    }
}

testCategoriesWithCount();
