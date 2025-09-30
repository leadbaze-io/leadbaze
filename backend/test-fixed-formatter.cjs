require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');
const ContentFormatter = require('./services/contentFormatter');

console.log('🎨 Testando Formatação Corrigida\n');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const formatter = new ContentFormatter();

// Conteúdo de teste com listas e formatação
const testPost = {
    title: "Como Escolher as Melhores Ferramentas de Marketing Digital",
    content: `Escolher as ferramentas certas de marketing digital é fundamental para o sucesso da sua estratégia. Neste guia, você aprenderá a fazer as melhores escolhas.

## O que considerar ao escolher ferramentas

Antes de investir em qualquer ferramenta, é importante considerar alguns fatores essenciais que vão impactar diretamente nos seus resultados.

### Principais critérios de seleção:

- **Orçamento disponível**: Defina quanto pode investir mensalmente
- **Tamanho da equipe**: Considere quantas pessoas vão usar
- **Integração com sistemas existentes**: Verifique compatibilidade
- **Facilidade de uso**: Priorize ferramentas intuitivas

## As melhores ferramentas do mercado

### Para automação de marketing:

1. **HubSpot**: Para automação completa e CRM integrado
2. **Mailchimp**: Para email marketing e campanhas
3. **Zapier**: Para integrações entre diferentes plataformas
4. **Hootsuite**: Para automação de redes sociais

### Para análise e métricas:

1. **Google Analytics**: Para análise de tráfego web
2. **SEMrush**: Para SEO e análise de concorrentes
3. **Hotjar**: Para análise de comportamento do usuário
4. **Mixpanel**: Para análise de eventos e funnels

## Como implementar gradualmente

### Fase 1: Ferramentas essenciais
Comece com as ferramentas mais importantes para seu negócio.

### Fase 2: Automação básica
Implemente automações simples para otimizar processos.

### Fase 3: Análise avançada
Adicione ferramentas de análise para otimizar resultados.

## Conclusão

Escolher as ferramentas certas é um processo que deve ser feito com cuidado e planejamento. Comece com o essencial e evolua gradualmente conforme sua necessidade e orçamento permitem.`,
    category: "marketing",
    type: "tutorial"
};

async function testFixedFormatter() {
    try {
        console.log('📝 Testando formatação corrigida...');
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
        
        console.log('\n🎨 Conteúdo formatado (primeiros 1200 caracteres):');
        console.log(formatted.content.substring(0, 1200) + '...');
        
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
        console.log('\n🎯 Processe a fila para ver o resultado corrigido no blog!');
        
    } catch (error) {
        console.error('💥 Erro geral:', error);
    }
}

testFixedFormatter();
