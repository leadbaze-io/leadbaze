/**
 * =====================================================
 * SCRIPT PARA ADICIONAR POSTS MANUALMENTE
 * =====================================================
 * 
 * Este script permite adicionar posts à fila sem usar N8N
 * 
 * Uso:
 * node add-blog-post.cjs
 */

const axios = require('axios');

// Configuração
const BACKEND_URL = 'http://localhost:3001';
const API_ENDPOINT = `${BACKEND_URL}/api/blog/queue/add`;

// Dados do post (modifique conforme necessário)
const postData = {
    title: "Como Automatizar Posts no Blog sem N8N",
    content: `
# Como Automatizar Posts no Blog sem N8N

## Introdução

Você não precisa necessariamente do N8N para automatizar a criação de posts no blog. Existem várias alternativas mais simples e diretas.

## Opções Disponíveis

### 1. Cron Job Automático
O sistema já tem um cron job configurado que executa automaticamente todo dia às 9h.

### 2. API Endpoint
Você pode criar posts diretamente via API usando o endpoint:
\`\`\`
POST /api/blog/queue/add
\`\`\`

### 3. Script Manual
Use este script para adicionar posts à fila manualmente.

## Vantagens

- ✅ Mais simples que N8N
- ✅ Controle total sobre o conteúdo
- ✅ Sem dependências externas
- ✅ Processamento automático via cron job

## Conclusão

A automação pode ser feita de forma mais direta, sem a complexidade do N8N.
    `,
    category: "Tecnologia",
    date: new Date().toISOString(),
    imageurl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    autor: "LeadBaze Team"
};

async function addPost() {
    try {
        console.log('🚀 Adicionando post à fila...');
        console.log('📝 Título:', postData.title);
        console.log('📅 Data:', postData.date);
        console.log('👤 Autor:', postData.autor);
        
        const response = await axios.post(API_ENDPOINT, postData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data.success) {
            console.log('✅ Post adicionado com sucesso!');
            console.log('📊 Dados:', response.data.data);
            console.log('\n🔄 O post será processado automaticamente pelo cron job às 9h');
            console.log('⚡ Ou processe manualmente via: POST /api/blog/queue/process');
        } else {
            console.error('❌ Erro ao adicionar post:', response.data.error);
        }
        
    } catch (error) {
        console.error('❌ Erro na requisição:', error.message);
        if (error.response) {
            console.error('📄 Resposta:', error.response.data);
        }
    }
}

// Executar
addPost();
