require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

console.log('🎯 Testando Apenas as 5 Categorias Principais\n');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testMainCategories() {
    try {
        console.log('📊 Buscando apenas as 5 categorias principais:');
        
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
        } else {
            console.log(`✅ Categorias principais encontradas: ${data.length}`);
            data.forEach(category => {
                console.log(`  - ${category.name} (slug: ${category.slug})`);
            });
            
            console.log('\n📊 Verificando se todas as 5 categorias foram encontradas:');
            const foundNames = data.map(c => c.name);
            mainCategoryNames.forEach(name => {
                if (foundNames.includes(name)) {
                    console.log(`  ✅ ${name} - Encontrada`);
                } else {
                    console.log(`  ❌ ${name} - NÃO encontrada`);
                }
            });
        }
        
    } catch (error) {
        console.error('💥 Erro geral:', error);
    }
}

testMainCategories();
