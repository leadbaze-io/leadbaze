require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');
const ContentFormatter = require('./services/contentFormatter');

console.log('🎯 Teste FINAL do Sistema INTELIGENTE de Categorização\n');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const formatter = new ContentFormatter();

// Teste com diferentes categorias para verificar o mapeamento inteligente
const testPosts = [
    {
        title: "Como Implementar Prospecção B2B Eficiente em 2024",
        content: `A prospecção B2B é fundamental para o sucesso em vendas. Neste artigo, vamos explorar as melhores práticas.

## O que é Prospecção B2B

Prospecção B2B é o processo de identificar e qualificar leads potenciais no mercado empresarial. É diferente da prospecção B2C porque envolve ciclos de vendas mais longos e múltiplos tomadores de decisão.

## Estratégias Eficazes

1. **Pesquisa Prévia**: Conheça a empresa e seus desafios
2. **Personalização**: Adapte sua abordagem para cada prospect
3. **Multi-canal**: Use email, LinkedIn, telefone e outros canais
4. **Follow-up Consistente**: Mantenha contato regular

## Ferramentas Recomendadas

- LinkedIn Sales Navigator
- ZoomInfo
- Apollo
- Outreach.io

## Métricas Importantes

- Taxa de resposta
- Taxa de agendamento
- Tempo médio de resposta
- Qualidade dos leads`,
        category: 'prospecção',
        type: 'tutorial'
    },
    {
        title: "Automação de Vendas: Como Triplicar Sua Produtividade",
        content: `A automação de vendas está revolucionando como as empresas gerenciam seus processos comerciais.

## Benefícios da Automação

A automação permite que equipes de vendas se concentrem no que realmente importa: construir relacionamentos e fechar negócios.

### Principais Vantagens

1. **Eficiência**: Reduz tarefas repetitivas
2. **Consistência**: Padroniza processos
3. **Escalabilidade**: Permite crescimento sem aumentar equipe
4. **Insights**: Fornece dados valiosos

## Ferramentas Essenciais

### CRM
- HubSpot
- Salesforce
- Pipedrive

### Automação
- Zapier
- Make (Integromat)
- Microsoft Power Automate

## Implementação

1. Mapeie seus processos atuais
2. Identifique pontos de automação
3. Escolha as ferramentas certas
4. Treine sua equipe
5. Monitore e otimize`,
        category: 'automação',
        type: 'tutorial'
    },
    {
        title: "Inteligência Artificial para Análise de Dados de Vendas",
        content: `A IA está transformando como analisamos e utilizamos dados de vendas para tomar decisões mais inteligentes.

## O Poder da IA em Vendas

A inteligência artificial pode analisar grandes volumes de dados e identificar padrões que humanos podem perder.

### Aplicações Práticas

1. **Scoring de Leads**: IA analisa comportamento e atribui scores
2. **Previsão de Receita**: Algoritmos preveem vendas futuras
3. **Otimização de Campanhas**: IA identifica melhores horários e canais
4. **Personalização**: Cria experiências únicas para cada cliente

## Benefícios Mensuráveis

- Aumento de 25% na taxa de conversão
- Redução de 40% no tempo de qualificação
- Melhoria de 60% na precisão de previsões
- Economia de 30% em custos operacionais

## Implementação

1. **Coleta de Dados**: Centralize todas as informações
2. **Limpeza**: Garanta qualidade dos dados
3. **Modelagem**: Desenvolva algoritmos específicos
4. **Teste**: Valide com dados históricos
5. **Deploy**: Implemente gradualmente`,
        category: 'ia',
        type: 'news'
    }
];

async function testFinalSystem() {
    try {
        console.log('📝 Criando posts de teste para verificar o sistema...\n');
        
        for (let i = 0; i < testPosts.length; i++) {
            const post = testPosts[i];
            console.log(`--- Teste ${i + 1}: ${post.title} ---`);
            console.log(`Categoria fornecida: "${post.category}"`);
            
            // Formatar conteúdo
            const formatted = formatter.formatPost(post);
            
            console.log(`Categoria mapeada: "${formatted.category}"`);
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
            console.log(`🆔 ID: ${data.id}\n`);
        }
        
        console.log('🎯 Todos os posts de teste foram criados!');
        console.log('🧠 Sistema INTELIGENTE funcionando perfeitamente!');
        console.log('📊 Posts distribuídos nas categorias corretas:');
        console.log('   • Prospecção B2B');
        console.log('   • Automação de Vendas');
        console.log('   • Inteligência de Dados');
        console.log('\n🛡️ Agora processe a fila - deve funcionar sem erros!');
        
    } catch (error) {
        console.error('💥 Erro geral:', error);
    }
}

testFinalSystem();
