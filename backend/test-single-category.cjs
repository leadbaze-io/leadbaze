require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');
const ContentFormatter = require('./services/contentFormatter');

console.log('🧪 Testando Categoria Única\n');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const formatter = new ContentFormatter();

// Teste simples com uma categoria
const testPost = {
    title: "Teste Simples: Categoria Prospecção B2B",
    content: `Este é um teste simples para verificar se a categoria "Prospecção B2B" funciona.

## Objetivo

Verificar se o sistema consegue processar um post com a categoria "Prospecção B2B" sem erros.

## Resultado Esperado

Este post deve ser processado com sucesso usando a categoria "Prospecção B2B".`,
    category: 'prospecção', // Deve mapear para "Prospecção B2B"
    type: 'tutorial'
};

async function testSingleCategory() {
    try {
        console.log('📝 Criando post de teste simples...');
        console.log('Categoria fornecida:', testPost.category);
        
        // Formatar conteúdo
        const formatted = formatter.formatPost(testPost);
        
        console.log('Categoria formatada:', formatted.category);
        console.log('Tipo detectado:', formatted.type);
        
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
            console.error('❌ Erro:', error);
            return;
        }
        
        console.log('\n✅ Post de teste criado com sucesso!');
        console.log('🆔 ID:', data.id);
        console.log('📊 Categoria final:', formatted.category);
        console.log('\n🎯 Agora processe a fila - deve funcionar!');
        
    } catch (error) {
        console.error('💥 Erro geral:', error);
    }
}

testSingleCategory();
