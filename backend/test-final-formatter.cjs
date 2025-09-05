require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');
const ContentFormatter = require('./services/contentFormatter');

console.log('🎨 Testando Formatação Final Corrigida\n');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const formatter = new ContentFormatter();

// Conteúdo de teste bem estruturado
const testPost = {
    title: "Guia Completo: Como Implementar Automação de Marketing Digital",
    content: `Automação de marketing digital é uma das estratégias mais eficazes para empresas que querem escalar seus resultados. Neste guia completo, você aprenderá tudo sobre implementação.

## O que é Automação de Marketing?

Automação de marketing é o uso de software para automatizar tarefas repetitivas de marketing, permitindo que sua equipe se concentre em estratégias mais importantes e criativas.

### Principais benefícios da automação:

- **Aumento de produtividade**: Equipe foca em estratégias, não em tarefas manuais
- **Melhor experiência do cliente**: Conteúdo personalizado e relevante
- **ROI maior**: Menos custos operacionais, mais resultados mensuráveis
- **Escalabilidade**: Processos funcionam 24/7 sem intervenção humana

## Como Implementar Passo a Passo

### Passo 1: Definir Objetivos Claros

Antes de começar, defina claramente:
- O que você quer alcançar com a automação?
- Quais métricas são mais importantes para seu negócio?
- Qual é o seu público-alvo principal?

### Passo 2: Escolher as Ferramentas Certas

As melhores ferramentas do mercado incluem:

1. **HubSpot**: Para automação completa e CRM integrado
2. **Mailchimp**: Para email marketing e campanhas
3. **Zapier**: Para integrações entre diferentes plataformas
4. **Hootsuite**: Para automação de redes sociais

### Passo 3: Criar Workflows Eficazes

Desenvolva workflows que:
- Segmentem automaticamente leads por comportamento
- Enviem conteúdo personalizado baseado no perfil
- Façam follow-up inteligente em momentos estratégicos
- Meçam resultados em tempo real

## Métricas Importantes para Acompanhar

Para garantir o sucesso da sua automação, monitore sempre:

1. **Taxa de abertura** de emails
2. **Taxa de cliques** em links e CTAs
3. **Taxa de conversão** de leads em clientes
4. **ROI** das campanhas automatizadas

## Conclusão

Com essas estratégias e ferramentas, você pode transformar seu marketing digital em uma máquina eficiente de geração de leads e vendas. Lembre-se: a automação não substitui a criatividade, mas potencializa seus resultados exponencialmente.`,
    category: "marketing",
    type: "tutorial"
};

async function testFinalFormatter() {
    try {
        console.log('📝 Testando formatação final...');
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
        console.log('\n🎯 Agora processe a fila para ver o resultado no blog!');
        
    } catch (error) {
        console.error('💥 Erro geral:', error);
    }
}

testFinalFormatter();
