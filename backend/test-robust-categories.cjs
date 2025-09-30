require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');
const ContentFormatter = require('./services/contentFormatter');

console.log('🔧 Testando Solução Robusta para Categorias\n');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const formatter = new ContentFormatter();

// Testar diferentes tipos de categoria
const testCategories = [
    'business',      // Deve mapear para 'Negócios'
    'ai',           // Deve mapear para 'Inteligência Artificial'
    'automation',   // Deve mapear para 'Automação'
    'tech',         // Deve mapear para 'Tecnologia'
    'inexistente',  // Deve usar fallback 'Marketing Digital'
    'Marketing',    // Deve usar como está (existe no banco)
    'Negócios'      // Deve usar como está (existe no banco)
];

console.log('🧪 Testando mapeamento de categorias:');
testCategories.forEach(category => {
    const formatted = formatter.formatCategory(category);
    console.log(`  ${category} → ${formatted}`);
});

// Criar um post de teste com categoria que pode dar problema
const testPost = {
    title: "Teste de Categoria Robusta: Verificando Fallback Automático",
    content: `Este é um teste para verificar se o sistema de categorias está funcionando de forma robusta.

## Objetivo do Teste

Queremos garantir que não haverá mais erros de categoria duplicada. O sistema deve:

1. Mapear categorias conhecidas para as existentes no banco
2. Usar categorias que já existem no banco
3. Fazer fallback para 'Marketing Digital' se não encontrar

## Como Funciona

O ContentFormatter agora tem uma lista de todas as categorias que existem no banco de dados. Quando uma categoria é fornecida, ele:

- Primeiro tenta mapear para uma categoria conhecida
- Se não encontrar, verifica se a categoria original existe
- Se nada funcionar, usa 'Marketing Digital' como fallback

## Resultado Esperado

Este post deve ser processado sem erros, independentemente da categoria fornecida.`,
    category: 'inexistente', // Categoria que não existe - deve usar fallback
    type: 'tutorial'
};

async function testRobustCategories() {
    try {
        console.log('\n📝 Testando post com categoria inexistente...');
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
        
        console.log('\n✅ Post de teste adicionado com sucesso!');
        console.log('🆔 ID:', data.id);
        console.log('📊 Categoria final:', formatted.category);
        console.log('\n🎯 Agora processe a fila - não deve dar erro de categoria!');
        
    } catch (error) {
        console.error('💥 Erro geral:', error);
    }
}

testRobustCategories();
