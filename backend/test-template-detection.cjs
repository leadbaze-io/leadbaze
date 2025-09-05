require('dotenv').config({ path: './config.env' });

console.log('🎯 Testando Sistema de Detecção de Templates\n');

// Simular o ContentFormatter
class ContentFormatter {
    detectContentType(content) {
        const lowerContent = content.toLowerCase();
        
        // Detectar narrativas/depoimentos (texto fluido, sem muitas listas)
        const narrativeIndicators = [
            'minha jornada', 'minha experiência', 'minha história', 'depoimento',
            'testemunho', 'case study', 'como consegui', 'como tripliquei',
            'como aumentei', 'transformação', 'evolução', 'crescimento pessoal'
        ];
        
        const hasNarrativeIndicators = narrativeIndicators.some(indicator => 
            lowerContent.includes(indicator)
        );
        
        // Contar elementos de lista
        const listCount = (content.match(/^\s*[-*+]\s/gm) || []).length + 
                         (content.match(/^\s*\d+\.\s/gm) || []).length;
        
        // Contar parágrafos longos (mais de 200 caracteres)
        const paragraphs = content.split('\n\n');
        const longParagraphs = paragraphs.filter(p => p.trim().length > 200).length;
        
        // Detectar se é principalmente narrativo
        if (hasNarrativeIndicators && longParagraphs > listCount && longParagraphs > 2) {
            console.log('📖 [ContentFormatter] Detectado: NARRATIVA/DEPOIMENTO');
            return 'narrative';
        }
        
        // Detectar tutoriais (muitos passos numerados)
        if (lowerContent.includes('passo') || lowerContent.includes('tutorial') || 
            lowerContent.includes('como fazer') || listCount > 5) {
            console.log('📋 [ContentFormatter] Detectado: TUTORIAL/LISTA');
            return 'tutorial';
        }
        
        // Detectar listas
        if (lowerContent.includes('lista') || lowerContent.includes('top') || 
            lowerContent.includes('melhores') || listCount > 3) {
            console.log('📝 [ContentFormatter] Detectado: LISTA');
            return 'list';
        }
        
        // Detectar notícias
        if (lowerContent.includes('notícia') || lowerContent.includes('anúncio') || 
            lowerContent.includes('lançamento') || lowerContent.includes('novidade')) {
            console.log('📰 [ContentFormatter] Detectado: NOTÍCIA');
            return 'news';
        }
        
        console.log('🔧 [ContentFormatter] Detectado: ARTIGO TÉCNICO (padrão)');
        return 'technical';
    }
}

const formatter = new ContentFormatter();

// Teste 1: Narrativa/Depoimento
console.log('🧪 TESTE 1: Narrativa/Depoimento');
const narrativeContent = `
Minha Jornada de Transformação Digital: Como Automatizei Meu Negócio e Tripliquei os Resultados

Há dois anos, eu estava completamente perdido. Meu negócio de consultoria estava estagnado, eu trabalhava 16 horas por dia e ainda assim não conseguia atender todos os clientes que precisavam da minha ajuda. Foi quando decidi que algo precisava mudar.

A transformação não foi fácil. Passei meses estudando automação, testando ferramentas e fazendo ajustes. Mas quando finalmente consegui implementar um sistema completo, os resultados foram surpreendentes.

Em apenas 6 meses, consegui triplicar minha receita, reduzir minha carga de trabalho em 60% e ainda assim melhorar a qualidade do atendimento aos meus clientes. Hoje, posso dizer que a automação salvou meu negócio.
`;

const narrativeType = formatter.detectContentType(narrativeContent);
console.log(`✅ Tipo detectado: ${narrativeType}\n`);

// Teste 2: Tutorial/Lista
console.log('🧪 TESTE 2: Tutorial/Lista');
const tutorialContent = `
Como Implementar Automação de Marketing Digital Passo a Passo

1. Defina seus objetivos
2. Escolha as ferramentas certas
3. Configure seus workflows
4. Teste e otimize
5. Monitore os resultados

Passo 1: Defina seus objetivos
Antes de começar, é importante saber exatamente o que você quer alcançar.

Passo 2: Escolha as ferramentas certas
Existem várias opções no mercado, cada uma com suas vantagens.
`;

const tutorialType = formatter.detectContentType(tutorialContent);
console.log(`✅ Tipo detectado: ${tutorialType}\n`);

// Teste 3: Lista
console.log('🧪 TESTE 3: Lista');
const listContent = `
Top 10 Ferramentas de Marketing Digital

- HubSpot
- Mailchimp
- Zapier
- Hootsuite
- Google Analytics
- Facebook Ads
- LinkedIn Sales Navigator
- Canva
- Buffer
- SEMrush

Cada uma dessas ferramentas tem suas vantagens específicas.
`;

const listType = formatter.detectContentType(listContent);
console.log(`✅ Tipo detectado: ${listType}\n`);

// Teste 4: Notícia
console.log('🧪 TESTE 4: Notícia');
const newsContent = `
LeadBaze Anuncia Nova Funcionalidade de Automação Avançada

A LeadBaze, líder em soluções de automação de marketing, anunciou hoje o lançamento de sua nova funcionalidade de automação avançada. A novidade promete revolucionar a forma como empresas gerenciam seus processos de marketing digital.

A nova funcionalidade inclui recursos de inteligência artificial para personalização de campanhas e análise preditiva de comportamento do cliente.
`;

const newsType = formatter.detectContentType(newsContent);
console.log(`✅ Tipo detectado: ${newsType}\n`);

// Teste 5: Artigo Técnico
console.log('🧪 TESTE 5: Artigo Técnico');
const technicalContent = `
Inteligência Artificial para Análise de Dados de Vendas

A inteligência artificial está transformando a forma como empresas analisam dados de vendas. Com algoritmos avançados de machine learning, é possível identificar padrões que antes passavam despercebidos.

Os benefícios incluem maior precisão nas previsões, otimização de processos e redução de custos operacionais. Empresas que implementam essas tecnologias veem um aumento médio de 25% na eficiência de vendas.
`;

const technicalType = formatter.detectContentType(technicalContent);
console.log(`✅ Tipo detectado: ${technicalType}\n`);

console.log('🎯 RESUMO DOS TESTES:');
console.log(`- Narrativa: ${narrativeType} (deve ser 'narrative')`);
console.log(`- Tutorial: ${tutorialType} (deve ser 'tutorial')`);
console.log(`- Lista: ${listType} (deve ser 'list')`);
console.log(`- Notícia: ${newsType} (deve ser 'news')`);
console.log(`- Técnico: ${technicalType} (deve ser 'technical')`);
