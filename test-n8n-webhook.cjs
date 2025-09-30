/**
 * Script para testar o webhook do N8N
 * Simula o envio de atualizações de status de campanha
 */

const axios = require('axios');

const API_BASE_URL = 'https://leadbaze.io';
const CAMPAIGN_ID = 'ffc8d172-9f0e-485e-ab59-000a7f05af68'; // Use o ID da sua campanha

async function testWebhook() {
  console.log('🧪 Iniciando teste do webhook N8N...');
  console.log(`📡 URL: ${API_BASE_URL}/api/campaign/n8n-webhook`);
  console.log(`🆔 Campaign ID: ${CAMPAIGN_ID}`);

  try {
    // Teste 1: Enviar progresso
    console.log('\n📊 Teste 1: Enviando progresso...');
    const progressResponse = await axios.post(`${API_BASE_URL}/api/campaign/n8n-webhook`, {
      campaignId: CAMPAIGN_ID,
      type: 'progress',
      data: {
        leadIndex: 1,
        totalLeads: 5,
        success: true,
        error: null,
        leadPhone: '+5531999999999',
        leadName: 'João Silva'
      }
    });

    console.log('✅ Progresso enviado com sucesso:', progressResponse.data);

    // Aguardar 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Teste 2: Enviar mais progresso
    console.log('\n📊 Teste 2: Enviando mais progresso...');
    const progressResponse2 = await axios.post(`${API_BASE_URL}/api/campaign/n8n-webhook`, {
      campaignId: CAMPAIGN_ID,
      type: 'progress',
      data: {
        leadIndex: 2,
        totalLeads: 5,
        success: true,
        error: null,
        leadPhone: '+5531888888888',
        leadName: 'Maria Santos'
      }
    });

    console.log('✅ Segundo progresso enviado:', progressResponse2.data);

    // Aguardar 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Teste 3: Enviar conclusão
    console.log('\n🎉 Teste 3: Enviando conclusão...');
    const completeResponse = await axios.post(`${API_BASE_URL}/api/campaign/n8n-webhook`, {
      campaignId: CAMPAIGN_ID,
      type: 'complete',
      data: {
        successCount: 4,
        failedCount: 1,
        totalProcessed: 5
      }
    });

    console.log('✅ Conclusão enviada:', completeResponse.data);

    console.log('\n🎉 Todos os testes concluídos com sucesso!');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executar teste
testWebhook();























