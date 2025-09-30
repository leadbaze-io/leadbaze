const ContentFormatter = require('./backend/services/contentFormatter');

// Teste de formatação
const testPost = {
    title: "Como Implementar Automação de Vendas B2B",
    content: "Este é um guia completo sobre como implementar automação de vendas B2B. Vamos abordar passo a passo todas as etapas necessárias para automatizar seu processo de vendas e aumentar significativamente seus resultados. A automação de vendas B2B é uma estratégia essencial para empresas que buscam escalar suas operações e otimizar o tempo da equipe comercial.",
    category: "Automação de Vendas",
    imageurl: "https://lsvwjyhnnzeewuuuykmb.supabase.co/storage/v1/object/posts_images/posts/b2b_leads_thumb.png",
    autor: "Sistema",
    date: "2025-09-06"
};

console.log('🧪 Testando formatação de conteúdo...\n');

const formatter = new ContentFormatter();
const formatted = formatter.formatPost(testPost);

console.log('📝 Resultado da formatação:');
console.log('========================');
console.log('Título:', formatted.title);
console.log('Tipo detectado:', formatted.type);
console.log('Categoria:', formatted.category);
console.log('Imagem:', formatted.featured_image);
console.log('Autor:', formatted.author_name);
console.log('\n📄 Conteúdo formatado:');
console.log('=====================');
console.log(formatted.content);
console.log('\n📏 Tamanho do conteúdo:', formatted.content.length, 'caracteres');
console.log('📝 Excerpt:', formatted.excerpt);






























