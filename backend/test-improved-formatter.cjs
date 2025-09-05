require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');
const ContentFormatter = require('./services/contentFormatter');

console.log('🎨 Testando Formatação Melhorada\n');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const formatter = new ContentFormatter();

// Conteúdo de teste melhorado
const testPost = {
    title: "Como Implementar Automação de Marketing Digital Passo a Passo",
    content: `Automação de marketing digital é essencial para empresas que querem escalar seus resultados. Neste guia completo, você aprenderá como implementar uma estratégia eficaz.

## O que é Automação de Marketing?

Automação de marketing é o uso de software para automatizar tarefas repetitivas de marketing, permitindo que sua equipe se concentre em estratégias mais importantes.

### Principais benefícios:

- **Aumento de produtividade**: Equipe foca em estratégias, não em tarefas manuais
- **Melhor experiência do cliente**: Conteúdo personalizado e relevante
- **ROI maior**: Menos custos operacionais, mais resultados
- **Escalabilidade**: Processos funcionam 24/7

## Como Implementar Passo a Passo

### Passo 1: Definir Objetivos

Antes de começar, defina claramente:
- O que você quer alcançar?
- Quais métricas são importantes?
- Qual é o público-alvo?

### Passo 2: Escolher as Ferramentas

As melhores ferramentas incluem:
- **HubSpot**: Para automação completa
- **Mailchimp**: Para email marketing
- **Zapier**: Para integrações
- **Hootsuite**: Para redes sociais

### Passo 3: Criar Workflows

Desenvolva workflows que:
- Segmentem automaticamente leads
- Enviem conteúdo personalizado
- Façam follow-up inteligente
- Meçam resultados

## Métricas Importantes

Acompanhe sempre:
1. **Taxa de abertura** de emails
2. **Taxa de cliques** em links
3. **Taxa de conversão** de leads
4. **ROI** das campanhas

## Conclusão

Com essas estratégias e ferramentas, você pode transformar seu marketing digital em uma máquina de geração de leads e vendas. A automação não substitui a criatividade, mas potencializa seus resultados.`,
    category: "marketing",
    type: "tutorial"
};

async function testImprovedFormatter() {
    try {
        console.log('📝 Testando formatação melhorada...');
        console.log('Título:', testPost.title);
        console.log('Categoria:', testPost.category);
        console.log('Tamanho original:', testPost.content.length, 'caracteres');
        
        // Formatar conteúdo
        const formatted = formatter.formatPost(testPost);
        
        console.log('\n🎨 Após formatação:');
        console.log('Tipo detectado:', formatted.type);
        console.log('Categoria formatada:', formatted.category);
        console.log('Tamanho final:', formatted.content.length, 'caracteres');
        console.log('Excerpt:', formatted.excerpt.substring(0, 100) + '...');
        
        console.log('\n🎨 Conteúdo formatado (primeiros 800 caracteres):');
        console.log(formatted.content.substring(0, 800) + '...');
        
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

testImprovedFormatter();
