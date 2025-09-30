require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');
const ContentFormatter = require('./services/contentFormatter');

console.log('🎨 Testando Formatação Simplificada (Apenas Modo Claro)\n');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const formatter = new ContentFormatter();

// Conteúdo de teste
const testPost = {
    title: "Teste de Legibilidade: Formatação com Texto Preto",
    content: `Este é um teste para verificar se a legibilidade melhorou com texto preto em todos os elementos.

## Teste de Títulos

Este título deve estar em preto e bem legível.

### Teste de Subtítulos

Este subtítulo também deve estar em preto.

## Teste de Listas

### Lista com bullets:

- **Primeiro item**: Texto em negrito preto
- **Segundo item**: Texto em negrito preto
- **Terceiro item**: Texto em negrito preto

### Lista numerada:

1. **HubSpot**: Para automação completa
2. **Mailchimp**: Para email marketing
3. **Zapier**: Para integrações
4. **Hootsuite**: Para redes sociais

## Teste de Parágrafos

Este parágrafo deve estar em texto preto e ser muito fácil de ler. A legibilidade deve ser excelente sem nenhum problema de contraste.

**Texto em negrito** deve estar em preto e bem destacado.

*Texto em itálico* também deve estar em preto.

## Conclusão

Todos os elementos devem estar em texto preto para máxima legibilidade no modo claro.`,
    category: "marketing",
    type: "tutorial"
};

async function testSimpleFormatter() {
    try {
        console.log('📝 Testando formatação simplificada...');
        console.log('Título:', testPost.title);
        console.log('Categoria:', testPost.category);
        console.log('Tamanho original:', testPost.content.length, 'caracteres');
        
        // Formatar conteúdo
        const formatted = formatter.formatPost(testPost);
        
        console.log('\n🎨 Após formatação:');
        console.log('Tipo detectado:', formatted.type);
        console.log('Categoria formatada:', formatted.category);
        console.log('Tamanho final:', formatted.content.length, 'caracteres');
        console.log('Excerpt:', formatted.excerpt.substring(0, 120) + '...');
        
        console.log('\n🎨 Conteúdo formatado (primeiros 1000 caracteres):');
        console.log(formatted.content.substring(0, 1000) + '...');
        
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
        
        console.log('\n✅ Post formatado adicionado à fila com sucesso!');
        console.log('🆔 ID:', data.id);
        console.log('📊 Status: Aguardando processamento');
        console.log('\n🎯 Processe a fila para ver o resultado com texto preto!');
        
    } catch (error) {
        console.error('💥 Erro geral:', error);
    }
}

testSimpleFormatter();
