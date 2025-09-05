require('dotenv').config({ path: './config.env' });
const ContentFormatter = require('./services/contentFormatter');

console.log('🎨 Testando Sistema Completo de Formatação\n');

const formatter = new ContentFormatter();

// Diferentes tipos de conteúdo para testar
const testCases = [
    {
        name: "Tutorial de Automação",
        data: {
            title: "Como automatizar vendas com IA",
            content: `Automação de vendas com IA é o futuro. Aqui está como fazer:

## Passo 1: Escolher a ferramenta
- HubSpot
- Salesforce
- Pipedrive

## Passo 2: Configurar
1. Conectar CRM
2. Definir regras
3. Testar

## Passo 3: Monitorar
Acompanhe métricas como:
- Taxa de conversão
- Tempo de resposta
- Satisfação do cliente

Com essas dicas, você pode automatizar suas vendas.`,
            category: "automation",
            type: "tutorial"
        }
    },
    {
        name: "Lista de Ferramentas",
        data: {
            title: "Top 10 ferramentas de marketing digital",
            content: `As melhores ferramentas de marketing digital são:

1. **Google Analytics** - Para análise de dados
2. **HubSpot** - Para automação completa
3. **Mailchimp** - Para email marketing
4. **Hootsuite** - Para redes sociais
5. **Canva** - Para design gráfico
6. **SEMrush** - Para SEO
7. **Zapier** - Para integrações
8. **Buffer** - Para agendamento
9. **Hotjar** - Para análise de comportamento
10. **Ahrefs** - Para pesquisa de palavras-chave

Cada ferramenta tem suas vantagens específicas.`,
            category: "marketing",
            type: "list"
        }
    },
    {
        name: "Notícia de Lançamento",
        data: {
            title: "Nova versão do sistema é lançada",
            content: `A nova versão do sistema foi lançada hoje com grandes melhorias:

**Principais novidades:**
- Interface mais moderna
- Performance 50% melhor
- Novos recursos de automação
- Integração com mais ferramentas

**Impacto esperado:**
- Maior produtividade
- Melhor experiência do usuário
- Redução de custos operacionais

A atualização está disponível para todos os usuários.`,
            category: "news",
            type: "news"
        }
    },
    {
        name: "Artigo Técnico",
        data: {
            title: "Implementação de microserviços em Node.js",
            content: `Microserviços são uma arquitetura moderna para aplicações escaláveis.

## Arquitetura de Microserviços

Microserviços permitem:
- Desenvolvimento independente
- Escalabilidade horizontal
- Tecnologias diversas
- Deploy independente

## Implementação em Node.js

Para implementar microserviços em Node.js:

1. **Separação de responsabilidades**
2. **Comunicação via API**
3. **Gerenciamento de estado**
4. **Monitoramento**

## Benefícios

- Maior flexibilidade
- Melhor manutenibilidade
- Escalabilidade individual
- Redução de acoplamento

Esta arquitetura é ideal para aplicações complexas.`,
            category: "tech",
            type: "technical"
        }
    }
];

// Testar cada caso
testCases.forEach((testCase, index) => {
    console.log(`\n📝 Teste ${index + 1}: ${testCase.name}`);
    console.log('=' .repeat(60));
    
    try {
        // Validar primeiro
        const validation = formatter.validatePost(testCase.data);
        console.log('✅ Validação:', validation.isValid ? 'PASSOU' : 'FALHOU');
        if (!validation.isValid) {
            console.log('❌ Erros:', validation.errors.join(', '));
            return;
        }
        
        // Formatar
        const formatted = formatter.formatPost(testCase.data);
        
        console.log('🎯 Tipo detectado:', formatted.type);
        console.log('📊 Categoria:', formatted.category);
        console.log('📏 Tamanho original:', testCase.data.content.length, 'caracteres');
        console.log('📏 Tamanho formatado:', formatted.content.length, 'caracteres');
        console.log('📄 Excerpt:', formatted.excerpt.substring(0, 100) + '...');
        
        console.log('\n🎨 Conteúdo formatado (primeiros 300 caracteres):');
        console.log(formatted.content.substring(0, 300) + '...');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
    
    console.log('\n' + '=' .repeat(60));
});

console.log('\n✅ Teste completo de formatação concluído!');
