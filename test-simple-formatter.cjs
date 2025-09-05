const ContentFormatter = require('./backend/services/contentFormatter');

console.log('🎨 Testando Sistema de Formatação Automática\n');

const formatter = new ContentFormatter();

// Exemplo simples
const testContent = {
    title: "Como implementar automação de vendas",
    content: `Automação de vendas é essencial para empresas modernas. Aqui estão os passos:

1. Definir processos
2. Escolher ferramentas  
3. Implementar
4. Monitorar resultados

Benefícios incluem aumento de produtividade e redução de custos.`,
    category: "automation"
};

console.log('📝 Conteúdo original:');
console.log(testContent.content);
console.log('\n' + '='.repeat(50));

const formatted = formatter.formatPost(testContent);

console.log('\n🎨 Conteúdo formatado:');
console.log(formatted.content);
console.log('\n📄 Excerpt:', formatted.excerpt);
console.log('🎯 Tipo:', formatted.type);

console.log('\n✅ Teste concluído!');
