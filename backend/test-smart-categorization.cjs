require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');
const ContentFormatter = require('./services/contentFormatter');

console.log('🧠 Testando Sistema INTELIGENTE de Categorização\n');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const formatter = new ContentFormatter();

// Testar diferentes tipos de categoria - devem mapear para as 5 categorias principais
const testCategories = [
    // Prospecção B2B
    'prospecção', 'lead', 'leads', 'qualificação', 'cold', 'outreach',
    
    // Estratégias de Outbound  
    'outbound', 'estratégias', 'campanhas', 'email', 'linkedin', 'sequência',
    
    // Gestão e Vendas B2B
    'vendas', 'sales', 'gestão', 'crm', 'pipeline', 'negociação',
    
    // Inteligência de Dados
    'dados', 'analytics', 'métricas', 'kpi', 'ia', 'ai',
    
    // Automação de Vendas
    'automação', 'automation', 'workflow', 'zapier', 'hubspot',
    
    // Fallbacks
    'marketing', 'business', 'tech', 'tutorial', 'news', 'seo',
    
    // Categorias inexistentes
    'qualquer_coisa', 'inexistente', 'teste123'
];

console.log('🧪 Testando mapeamento INTELIGENTE de categorias:');
console.log('📊 5 Categorias principais: Prospecção B2B, Estratégias de Outbound, Gestão e Vendas B2B, Inteligência de Dados, Automação de Vendas\n');

testCategories.forEach(category => {
    const formatted = formatter.formatCategory(category);
    console.log(`  ${category} → ${formatted}`);
});

// Criar posts de teste representando cada categoria principal
const testPosts = [
    {
        title: "Como Qualificar Leads B2B de Forma Eficiente",
        content: `A qualificação de leads é fundamental para o sucesso em vendas B2B.

## O que é Qualificação de Leads

Qualificação de leads é o processo de identificar e priorizar prospects que têm maior probabilidade de se tornar clientes. Isso envolve analisar critérios como orçamento, autoridade, necessidade e timing.

## Critérios de Qualificação

Os principais critérios para qualificar leads incluem:

1. **BANT (Budget, Authority, Need, Timeline)**
2. **Fit do produto/serviço**
3. **Urgência da necessidade**
4. **Capacidade de decisão**

## Benefícios da Qualificação

- Aumenta a taxa de conversão
- Reduz tempo desperdiçado
- Melhora a experiência do cliente
- Otimiza recursos da equipe`,
        category: 'qualificação',
        type: 'tutorial'
    },
    {
        title: "Estratégias de Email Marketing para Outbound",
        content: `Email marketing é uma das ferramentas mais eficazes para campanhas de outbound.

## Personalização é Fundamental

Cada email deve ser personalizado para o destinatário específico. Isso inclui:

- Nome e empresa
- Cargo e responsabilidades
- Necessidades específicas
- Contexto da indústria

## Estrutura do Email

Um email de outbound eficaz deve ter:

1. **Assunto atrativo**
2. **Abertura personalizada**
3. **Proposta de valor clara**
4. **Call-to-action específico**

## Métricas Importantes

Acompanhe sempre:
- Taxa de abertura
- Taxa de resposta
- Taxa de agendamento
- Taxa de conversão`,
        category: 'email',
        type: 'tutorial'
    },
    {
        title: "Gestão de Pipeline de Vendas: Métricas Essenciais",
        content: `Um pipeline bem gerenciado é crucial para o sucesso em vendas.

## O que é Pipeline de Vendas

Pipeline de vendas é o processo visual que mostra onde cada prospect está no funil de vendas, desde o primeiro contato até o fechamento.

## Estágios do Pipeline

1. **Prospecção** - Identificação de leads
2. **Qualificação** - Avaliação de fit
3. **Proposta** - Apresentação da solução
4. **Negociação** - Discussão de termos
5. **Fechamento** - Assinatura do contrato

## Métricas Importantes

- **Velocidade do pipeline**
- **Taxa de conversão por estágio**
- **Valor médio do negócio**
- **Tempo médio de ciclo**

## Benefícios

- Visibilidade total do processo
- Identificação de gargalos
- Previsão de receita
- Otimização de recursos`,
        category: 'pipeline',
        type: 'tutorial'
    },
    {
        title: "Inteligência Artificial para Análise de Dados de Vendas",
        content: `A IA está revolucionando a forma como analisamos dados de vendas.

## O que é IA em Vendas

Inteligência Artificial em vendas envolve o uso de algoritmos e machine learning para:

- Analisar padrões de comportamento
- Prever probabilidade de fechamento
- Otimizar timing de contato
- Personalizar abordagens

## Aplicações Práticas

### 1. Scoring de Leads
IA pode analisar dados históricos para atribuir scores de qualidade aos leads.

### 2. Previsão de Receita
Algoritmos podem prever receita futura baseada em dados atuais.

### 3. Otimização de Campanhas
IA pode identificar os melhores horários e canais para contato.

## Benefícios

- Maior precisão nas previsões
- Otimização automática de processos
- Insights mais profundos
- Tomada de decisão baseada em dados`,
        category: 'ia',
        type: 'news'
    },
    {
        title: "Automação de Workflows de Vendas com Zapier",
        content: `Zapier pode automatizar diversos processos de vendas, economizando tempo e reduzindo erros.

## O que é Zapier

Zapier é uma plataforma que conecta diferentes aplicações através de "Zaps" - automações que executam ações baseadas em triggers.

## Workflows Comuns

### 1. Lead para CRM
Quando um lead preenche um formulário, automaticamente:
- Cria contato no CRM
- Envia email de boas-vindas
- Agenda follow-up

### 2. Qualificação Automática
Baseado em critérios definidos:
- Atribui score ao lead
- Move para estágio apropriado
- Notifica vendedor responsável

### 3. Follow-up Automático
- Envia sequência de emails
- Agenda lembretes
- Atualiza status no CRM

## Benefícios

- Reduz trabalho manual
- Elimina erros humanos
- Acelera processos
- Melhora consistência`,
        category: 'zapier',
        type: 'tutorial'
    }
];

async function testSmartCategorization() {
    try {
        console.log('\n📝 Criando posts de teste para cada categoria principal...');
        
        for (let i = 0; i < testPosts.length; i++) {
            const post = testPosts[i];
            console.log(`\n--- Teste ${i + 1}: ${post.title} ---`);
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
            console.log(`🆔 ID: ${data.id}`);
        }
        
        console.log('\n🎯 Todos os posts de teste foram criados!');
        console.log('🧠 Sistema INTELIGENTE de categorização implementado!');
        console.log('📊 Posts distribuídos nas 5 categorias principais:');
        console.log('   • Prospecção B2B');
        console.log('   • Estratégias de Outbound');
        console.log('   • Gestão e Vendas B2B');
        console.log('   • Inteligência de Dados');
        console.log('   • Automação de Vendas');
        console.log('\n🛡️ Agora processe a fila - deve funcionar perfeitamente!');
        
    } catch (error) {
        console.error('💥 Erro geral:', error);
    }
}

testSmartCategorization();
