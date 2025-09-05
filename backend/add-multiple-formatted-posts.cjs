require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');
const ContentFormatter = require('./services/contentFormatter');

console.log('🎨 Adicionando Múltiplos Posts com Formatação Automática\n');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const formatter = new ContentFormatter();

// Posts com diferentes tipos de conteúdo
const posts = [
    {
        title: "Como Criar Campanhas de Email Marketing Eficazes",
        content: `Email marketing é uma das ferramentas mais poderosas para engajar clientes. Aqui está um guia completo:

## Planejamento da Campanha

Antes de começar, defina:
- **Objetivo**: O que você quer alcançar?
- **Público-alvo**: Quem são seus clientes?
- **Mensagem**: O que você quer comunicar?

## Criação do Conteúdo

### Assunto do Email
- Seja claro e direto
- Use números quando possível
- Crie urgência

### Corpo do Email
- Comece com uma saudação personalizada
- Use parágrafos curtos
- Inclua call-to-action claro

## Ferramentas Recomendadas

- **Mailchimp**: Para iniciantes
- **HubSpot**: Para automação avançada
- **ConvertKit**: Para criadores de conteúdo
- **ActiveCampaign**: Para segmentação

## Métricas Importantes

Acompanhe sempre:
- Taxa de abertura
- Taxa de cliques
- Taxa de conversão
- Taxa de descadastro

Com essas estratégias, suas campanhas de email serão muito mais eficazes.`,
        category: "marketing",
        type: "tutorial",
        imageurl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center"
    },
    {
        title: "5 Tendências de IA que Vão Revolucionar o Marketing em 2024",
        content: `A inteligência artificial está transformando o marketing digital. Conheça as principais tendências:

## 1. Chatbots Inteligentes
- Atendimento 24/7
- Respostas personalizadas
- Integração com CRM

## 2. Análise Preditiva
- Previsão de comportamento
- Otimização de campanhas
- Segmentação avançada

## 3. Geração de Conteúdo
- Textos automáticos
- Imagens personalizadas
- Vídeos gerados por IA

## 4. Personalização em Tempo Real
- Conteúdo dinâmico
- Recomendações inteligentes
- Experiência única

## 5. Automação de Vendas
- Lead scoring automático
- Follow-up inteligente
- Qualificação de prospects

Essas tendências estão redefinindo como as empresas se conectam com seus clientes.`,
        category: "ai",
        type: "list",
        imageurl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&crop=center"
    },
    {
        title: "LeadBaze Anuncia Nova Funcionalidade de Automação Avançada",
        content: `A LeadBaze está revolucionando a automação de marketing com o lançamento de uma nova funcionalidade.

## O que há de novo?

A nova funcionalidade permite:
- **Automação multicanal**: Email, SMS e redes sociais
- **Segmentação inteligente**: Baseada em comportamento
- **Analytics avançado**: Métricas em tempo real
- **Integração nativa**: Com mais de 50 ferramentas

## Impacto para os usuários

Esta atualização representa:
- Aumento de 40% na taxa de conversão
- Redução de 60% no tempo de configuração
- Melhoria de 80% na personalização

## Disponibilidade

A funcionalidade está disponível para todos os planos a partir de hoje. Usuários premium terão acesso a recursos avançados.

Esta é uma evolução significativa na plataforma LeadBaze.`,
        category: "news",
        type: "news",
        imageurl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop&crop=center"
    }
];

async function addMultiplePosts() {
    console.log(`📝 Adicionando ${posts.length} posts com formatação automática...\n`);
    
    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        
        try {
            console.log(`\n📝 Post ${i + 1}: ${post.title}`);
            console.log('=' .repeat(50));
            
            // Formatar conteúdo
            const formatted = formatter.formatPost(post);
            
            console.log('🎯 Tipo:', formatted.type);
            console.log('📊 Categoria:', formatted.category);
            console.log('📏 Tamanho:', formatted.content.length, 'caracteres');
            
            // Adicionar à fila
            const { data, error } = await supabase
                .from('n8n_blog_queue')
                .insert([{
                    title: formatted.title,
                    content: formatted.content,
                    category: formatted.category,
                    date: new Date().toISOString().split('T')[0],
                    imageurl: post.imageurl,
                    autor: 'LeadBaze Team',
                    processed: false
                }])
                .select()
                .single();
            
            if (error) {
                console.error('❌ Erro:', error);
                continue;
            }
            
            console.log('✅ Post adicionado com sucesso!');
            console.log('🆔 ID:', data.id);
            
        } catch (error) {
            console.error('💥 Erro no post:', error.message);
        }
    }
    
    console.log('\n🎉 Todos os posts foram processados!');
    console.log('📊 Verifique o dashboard para ver os posts na fila.');
}

addMultiplePosts();
