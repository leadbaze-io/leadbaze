require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Debug: Verificando Contadores das Categorias\n');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function debugCategoryCount() {
    try {
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
        
        console.log('📊 Verificando cada categoria individualmente:\n');
        
        for (const category of data) {
            // Buscar contagem de posts
            const { count, error: countError } = await supabase
                .from('blog_posts')
                .select('*', { count: 'exact', head: true })
                .eq('published', true)
                .eq('category_id', category.id);
            
            if (countError) {
                console.error(`❌ Erro ao contar posts para "${category.name}":`, countError);
                continue;
            }
            
            const postCount = count || 0;
            
            // Verificar se há posts realmente
            const { data: posts, error: postsError } = await supabase
                .from('blog_posts')
                .select('id, title')
                .eq('published', true)
                .eq('category_id', category.id)
                .limit(5);
            
            if (postsError) {
                console.error(`❌ Erro ao buscar posts para "${category.name}":`, postsError);
                continue;
            }
            
            console.log(`📝 ${category.name}:`);
            console.log(`   - Contagem: ${postCount}`);
            console.log(`   - Posts reais: ${posts.length}`);
            if (posts.length > 0) {
                console.log(`   - Títulos: ${posts.map(p => p.title).join(', ')}`);
            }
            console.log(`   - Deve mostrar contador: ${postCount > 0 ? 'SIM' : 'NÃO'}`);
            console.log('');
        }
        
    } catch (error) {
        console.error('💥 Erro geral:', error);
    }
}

debugCategoryCount();
