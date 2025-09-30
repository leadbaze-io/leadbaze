const axios = require('axios');

async function addPost() {
  try {
    console.log('🚀 Adicionando post...');
    
    const postData = {
      title: "Estratégias de SEO para Aumentar Tráfego Orgânico",
      content: `
        <h2>O que é SEO?</h2>
        <p>SEO (Search Engine Optimization) é o conjunto de técnicas utilizadas para otimizar um site e melhorar sua posição nos resultados de busca do Google.</p>
        
        <h3>Principais Fatores de SEO</h3>
        <ul>
          <li><strong>Conteúdo de Qualidade:</strong> Crie conteúdo original e valioso</li>
          <li><strong>Palavras-chave:</strong> Use palavras-chave relevantes naturalmente</li>
          <li><strong>Velocidade do Site:</strong> Sites rápidos rankeiam melhor</li>
          <li><strong>Mobile-First:</strong> Seu site deve ser responsivo</li>
          <li><strong>Links Internos:</strong> Conecte suas páginas entre si</li>
        </ul>
        
        <h3>Ferramentas Essenciais</h3>
        <p>Para implementar SEO com sucesso, você precisará de:</p>
        <ul>
          <li>Google Search Console</li>
          <li>Google Analytics</li>
          <li>Ferramentas de pesquisa de palavras-chave</li>
          <li>Ferramentas de análise de concorrentes</li>
        </ul>
        
        <h3>Conclusão</h3>
        <p>SEO é um investimento de longo prazo que pode trazer resultados significativos para seu negócio. Comece com o básico e vá evoluindo suas estratégias.</p>
      `,
      category: "SEO",
      date: new Date().toISOString(),
      imageurl: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=400&fit=crop&crop=center",
      autor: "LeadBaze Team"
    };
    
    console.log('📝 Título:', postData.title);
    console.log('📅 Data:', postData.date);
    
    const response = await axios.post('http://localhost:3001/api/blog/queue/add', postData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    if (response.data.success) {
      console.log('✅ Post adicionado com sucesso!');
      console.log('📄 ID:', response.data.data?.id);
    } else {
      console.log('❌ Erro:', response.data.error);
    }
    
  } catch (error) {
    if (error.response?.status === 429) {
      console.log('⏰ Rate limit ativo. Aguarde alguns minutos.');
    } else {
      console.log('❌ Erro:', error.message);
    }
  }
}

addPost();
