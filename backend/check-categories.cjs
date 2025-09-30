require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Verificando Categorias no Banco\n');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const targetCategories = [
    'Prospecção B2B',
    'Estratégias de Outbound', 
    'Gestão e Vendas B2B',
    'Inteligência de Dados',
    'Automação de Vendas'
];

async function checkCategories() {
    try {
        console.log('📊 Verificando se as 5 categorias principais existem no banco:\n');
        
        for (const category of targetCategories) {
            const { data, error } = await supabase
                .from('blog_categories')
                .select('name')
                .eq('name', category);
            
            if (error) {
                console.error(`❌ Erro ao verificar "${category}":`, error);
            } else {
                const exists = data && data.length > 0;
                console.log(`${exists ? '✅' : '❌'} "${category}": ${exists ? 'EXISTE' : 'NÃO EXISTE'}`);
            }
        }
        
        console.log('\n📋 Listando TODAS as categorias existentes no banco:');
        const { data: allCategories, error } = await supabase
            .from('blog_categories')
            .select('name')
            .order('name');
        
        if (error) {
            console.error('❌ Erro ao listar categorias:', error);
        } else {
            allCategories.forEach(cat => {
                console.log(`  - ${cat.name}`);
            });
        }
        
    } catch (error) {
        console.error('💥 Erro geral:', error);
    }
}

checkCategories();
