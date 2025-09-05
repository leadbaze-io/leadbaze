require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');
const ContentFormatter = require('./services/contentFormatter');

console.log('🎨 Testando Sistema de Formatação Automática\n');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const formatter = new ContentFormatter();

// Conteúdo bruto para testar
const rawContent = {
    title: "Guia Completo de Automação de Marketing Digital",
    content: `Automação de marketing digital é fundamental para empresas que querem escalar. Neste guia, você aprenderá:

## O que é Automação de Marketing?

Automação de marketing é o uso de software para automatizar tarefas repetitivas de marketing, como:

- Envio de emails
- Postagem em redes sociais
- Segmentação de leads
- Follow-up de vendas

## Benefícios Principais

**Aumento de Produtividade**: Equipe foca em estratégias, não em tarefas manuais
**Melhor Experiência**: Clientes recebem conteúdo personalizado
**ROI Maior**: Menos custos, mais resultados
**Escalabilidade**: Processos funcionam 24/7

## Como Implementar

1. **Defina seus objetivos**
2. **Escolha as ferramentas certas**
3. **Crie seus workflows**
4. **Teste e otimize**

## Ferramentas Recomendadas

- **HubSpot**: Para automação completa
- **Mailchimp**: Para email marketing
- **Zapier**: Para integrações
- **Hootsuite**: Para redes sociais

Com essas ferramentas e estratégias, você pode transformar seu marketing digital.`,
    category: "marketing",
    type: "tutorial"
};

async function testFormattedPost() {
    try {
        console.log('📝 Conteúdo original:');
        console.log('Título:', rawContent.title);
        console.log('Categoria:', rawContent.category);
        console.log('Tamanho:', rawContent.content.length, 'caracteres');
        
        // Formatar conteúdo
        const formatted = formatter.formatPost(rawContent);
        
        console.log('\n🎨 Após formatação:');
        console.log('Tipo detectado:', formatted.type);
        console.log('Categoria formatada:', formatted.category);
        console.log('Tamanho final:', formatted.content.length, 'caracteres');
        console.log('Excerpt:', formatted.excerpt);
        
        console.log('\n🎨 Conteúdo formatado (primeiros 500 caracteres):');
        console.log(formatted.content.substring(0, 500) + '...');
        
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
        
    } catch (error) {
        console.error('💥 Erro geral:', error);
    }
}

testFormattedPost();
