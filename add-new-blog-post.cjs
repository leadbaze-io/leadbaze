const axios = require('axios');

async function addNewBlogPost() {
  try {
    console.log('🚀 Adicionando novo post à fila...');
    
    const postData = {
      title: "Guia Completo de Marketing Digital para Pequenas Empresas",
      content: `
        <h2>Introdução ao Marketing Digital</h2>
        <p>O marketing digital se tornou essencial para o sucesso de pequenas empresas no mundo moderno. Com as mudanças no comportamento do consumidor e a crescente presença online, é fundamental que empresas de todos os tamanhos desenvolvam uma estratégia digital sólida.</p>
        
        <h3>Principais Estratégias</h3>
        <ul>
          <li><strong>SEO (Search Engine Optimization):</strong> Otimize seu site para aparecer nos primeiros resultados do Google</li>
          <li><strong>Marketing de Conteúdo:</strong> Crie conteúdo valioso que atraia e engaje seu público</li>
          <li><strong>Redes Sociais:</strong> Use plataformas como Facebook, Instagram e LinkedIn para conectar com clientes</li>
          <li><strong>Email Marketing:</strong> Construa uma lista de contatos e mantenha relacionamento com clientes</li>
          <li><strong>Google Ads:</strong> Anuncie no Google para aparecer quando pessoas buscarem por seus produtos</li>
        </ul>
        
        <h3>Ferramentas Essenciais</h3>
        <p>Para implementar uma estratégia de marketing digital eficaz, você precisará de algumas ferramentas:</p>
        <ul>
          <li>Google Analytics para acompanhar visitantes</li>
          <li>Ferramentas de SEO como SEMrush ou Ahrefs</li>
          <li>Plataformas de email marketing como Mailchimp</li>
          <li>Ferramentas de design como Canva</li>
        </ul>
        
        <h3>Conclusão</h3>
        <p>O marketing digital não é mais uma opção, mas uma necessidade para pequenas empresas que querem crescer e competir no mercado atual. Comece com uma estratégia simples e vá evoluindo conforme aprende e obtém resultados.</p>
      `,
      category: "Marketing Digital",
      date: new Date().toISOString(),
      imageurl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop&crop=center",
      autor: "LeadBaze Team"
    };
    
    console.log('📝 Título:', postData.title);
    console.log('📅 Data:', postData.date);
    console.log('👤 Autor:', postData.autor);
    console.log('🖼️ Imagem:', postData.imageurl);
    
    const response = await axios.post('http://localhost:3001/api/blog/queue/add', postData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      console.log('✅ Post adicionado com sucesso!');
      console.log('📄 Resposta:', response.data);
    } else {
      console.log('❌ Erro na requisição:', response.data.error);
      console.log('📄 Resposta:', response.data);
    }
    
  } catch (error) {
    console.log('❌ Erro na requisição:', error.response?.status || error.message);
    if (error.response?.data) {
      console.log('📄 Resposta:', error.response.data);
    }
  }
}

addNewBlogPost();
