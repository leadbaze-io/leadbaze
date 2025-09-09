/**
 * Script para testar o sistema completo de campanhas
 * Simula o fluxo completo: criação, progresso e conclusão
 */

const axios = require('axios');

const API_BASE_URL = 'https://leadbaze.io';
const CAMPAIGN_ID = 'test-campaign-' + Date.now();

async function testCompleteSystem() {
  console.log('🧪 Iniciando teste completo do sistema de campanhas...');
  console.log(`📡 URL Base: ${API_BASE_URL}`);
  console.log(`🆔 Campaign ID: ${CAMPAIGN_ID}`);

  try {
    // Passo 1: Iniciar rastreamento da campanha
    console.log('\n🚀 Passo 1: Iniciando rastreamento da campanha...');
    const startResponse = await axios.post(`${API_BASE_URL}/api/campaign/status/start`, {
      campaignId: CAMPAIGN_ID,
      totalLeads: 5
    });

    console.log('✅ Rastreamento iniciado:', startResponse.data);

    // Aguardar 1 segundo
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Passo 2: Simular progresso gradual
    console.log('\n📊 Passo 2: Simulando progresso gradual...');
    
    for (let i = 1; i <= 5; i++) {
      console.log(`\n📤 Enviando progresso ${i}/5...`);
      
      const progressResponse = await axios.post(`${API_BASE_URL}/api/campaign/n8n-webhook`, {
        campaignId: CAMPAIGN_ID,
        type: 'progress',
        data: {
          leadIndex: i,
          totalLeads: 5,
          success: i <= 4, // 4 sucessos, 1 falha
          error: i === 5 ? 'Número inválido' : null,
          leadPhone: `+553199999999${i}`,
          leadName: `Lead ${i}`
        }
      });

      console.log(`✅ Progresso ${i} enviado:`, progressResponse.data);

      // Aguardar 2 segundos entre cada envio
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Passo 3: Finalizar campanha
    console.log('\n🏁 Passo 3: Finalizando campanha...');
    const completeResponse = await axios.post(`${API_BASE_URL}/api/campaign/n8n-webhook`, {
      campaignId: CAMPAIGN_ID,
      type: 'complete',
      data: {
        successCount: 4,
        failedCount: 1,
        totalProcessed: 5
      }
    });

    console.log('✅ Campanha finalizada:', completeResponse.data);

    // Passo 4: Verificar status final
    console.log('\n🔍 Passo 4: Verificando status final...');
    const statusResponse = await axios.get(`${API_BASE_URL}/api/campaign/status/${CAMPAIGN_ID}`);
    
    console.log('📊 Status final da campanha:', statusResponse.data);

    console.log('\n🎉 Teste completo concluído com sucesso!');
    console.log('📱 Verifique o frontend para ver as atualizações em tempo real.');
    console.log(`🔗 URL do SSE: ${API_BASE_URL}/api/campaign/status/stream/${CAMPAIGN_ID}`);

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📊 Headers:', error.response.headers);
    }
  }
}

// Executar teste
testCompleteSystem();
