require('dotenv').config({ path: './backend/config.env' });
const ContentFormatter = require('./backend/services/contentFormatter');

console.log('🎨 Testando Sistema de Formatação Automática\n');

const formatter = new ContentFormatter();

// Exemplos de conteúdo bruto
const testContents = [
    {
        title: "Como implementar automação de vendas",
        content: `Automação de vendas é essencial para empresas modernas. Aqui estão os passos:

1. Definir processos
2. Escolher ferramentas
3. Implementar
4. Monitorar resultados

Benefícios incluem aumento de produtividade e redução de custos.`,
        category: "automation",
        type: "tutorial"
    },
    {
        title: "Top 5 ferramentas de IA para marketing",
        content: `As melhores ferramentas de IA para marketing são:

- ChatGPT para conteúdo
- Jasper para copywriting  
- Midjourney para imagens
- HubSpot para automação
- Google Analytics para dados

Cada uma tem suas vantagens específicas.`,
        category: "ai",
        type: "list"
    },
    {
        title: "Lançamento da nova versão do sistema",
        content: `A nova versão do sistema foi lançada hoje. Principais melhorias:

**Performance**: 50% mais rápido
**Interface**: Design moderno
**Recursos**: Novas funcionalidades

A atualização está disponível para todos os usuários.`,
        category: "news",
        type: "news"
    }
];

// Testar formatação
testContents.forEach((test, index) => {
    console.log(`\n📝 Teste ${index + 1}: ${test.title}`);
    console.log('=' .repeat(50));
    
    const formatted = formatter.formatPost(test);
    
    console.log('🎯 Tipo detectado:', formatted.type);
    console.log('📊 Categoria formatada:', formatted.category);
    console.log('📏 Tamanho do conteúdo:', formatted.content.length);
    console.log('📄 Excerpt gerado:', formatted.excerpt);
    console.log('\n🎨 Conteúdo formatado:');
    console.log(formatted.content.substring(0, 500) + '...');
    console.log('\n' + '=' .repeat(50));
});

console.log('\n✅ Teste de formatação concluído!');
