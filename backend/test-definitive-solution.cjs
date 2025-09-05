require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');
const ContentFormatter = require('./services/contentFormatter');

console.log('🛡️ Testando Solução DEFINITIVA para Categorias\n');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const formatter = new ContentFormatter();

// Testar diferentes tipos de categoria - todas devem resultar em "Marketing Digital"
const testCategories = [
    'business',
    'ai', 
    'automation',
    'tech',
    'inexistente',
    'qualquer_coisa',
    'Marketing Digital',
    'Negócios'
];

console.log('🧪 Testando mapeamento DEFINITIVO de categorias:');
testCategories.forEach(category => {
    const formatted = formatter.formatCategory(category);
    console.log(`  ${category} → ${formatted}`);
});

// Criar posts de teste com diferentes categorias
const testPosts = [
    {
        title: "Teste 1: Categoria 'business' - Deve usar Marketing Digital",
        content: `Este é um teste para verificar se a solução definitiva está funcionando.

## Objetivo

Verificar se a categoria 'business' é convertida para 'Marketing Digital' sem erros.

## Resultado Esperado

Este post deve ser processado com sucesso usando a categoria 'Marketing Digital'.`,
        category: 'business',
        type: 'tutorial'
    },
    {
        title: "Teste 2: Categoria 'ai' - Deve usar Marketing Digital", 
        content: `Este é outro teste para verificar a solução definitiva.

## Objetivo

Verificar se a categoria 'ai' é convertida para 'Marketing Digital' sem erros.

## Resultado Esperado

Este post também deve ser processado com sucesso usando a categoria 'Marketing Digital'.`,
        category: 'ai',
        type: 'news'
    },
    {
        title: "Teste 3: Categoria 'qualquer_coisa' - Deve usar Marketing Digital",
        content: `Este é um teste com uma categoria completamente inexistente.

## Objetivo

Verificar se qualquer categoria é convertida para 'Marketing Digital' sem erros.

## Resultado Esperado

Este post deve ser processado com sucesso usando a categoria 'Marketing Digital'.`,
        category: 'qualquer_coisa',
        type: 'tutorial'
    }
];

async function testDefinitiveSolution() {
    try {
        console.log('\n📝 Criando posts de teste...');
        
        for (let i = 0; i < testPosts.length; i++) {
            const post = testPosts[i];
            console.log(`\n--- Teste ${i + 1} ---`);
            console.log(`Categoria fornecida: "${post.category}"`);
            
            // Formatar conteúdo
            const formatted = formatter.formatPost(post);
            
            console.log(`Categoria formatada: "${formatted.category}"`);
            console.log(`Tipo detectado: ${formatted.type}`);
            
            // Adicionar à fila
            const { data, error } = await supabase
                .from('n8n_blog_queue')
                .insert([{
                    title: formatted.title,
                    content: formatted.content,
                    category: formatted.category,
                    date: new Date().toISOString().split('T')[0],
                    imageurl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop&crop=center',
                    autor: 'LeadBaze Team',
                    processed: false
                }])
                .select()
                .single();
            
            if (error) {
                console.error(`❌ Erro no teste ${i + 1}:`, error);
                return;
            }
            
            console.log(`✅ Teste ${i + 1} adicionado com sucesso!`);
            console.log(`🆔 ID: ${data.id}`);
        }
        
        console.log('\n🎯 Todos os posts de teste foram criados!');
        console.log('🛡️ Agora processe a fila - NÃO deve haver mais erros de categoria!');
        console.log('📊 Todos os posts usarão a categoria "Marketing Digital"');
        
    } catch (error) {
        console.error('💥 Erro geral:', error);
    }
}

testDefinitiveSolution();
