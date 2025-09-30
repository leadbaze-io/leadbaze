/**
 * Script para testar a conectividade com a Evolution API
 * Execute: node test-evolution-api.js
 */

const axios = require('axios');
require('dotenv').config({ path: './config.env' });

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

const evolutionHeaders = {
  'Content-Type': 'application/json',
  'apikey': EVOLUTION_API_KEY
};

async function testEvolutionAPI() {
  console.log('🧪 Testando conectividade com Evolution API...');
  console.log(`🌐 URL: ${EVOLUTION_API_URL}`);
  console.log(`🔑 API Key: ${EVOLUTION_API_KEY ? '✅ Configurada' : '❌ Não configurada'}`);
  console.log('');

  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    console.error('❌ Evolution API não configurada corretamente');
    console.error('   Verifique as variáveis EVOLUTION_API_URL e EVOLUTION_API_KEY no config.env');
    return;
  }

  try {
    // Teste 1: Health check básico
    console.log('1️⃣ Testando health check...');
    const healthResponse = await axios.get(`${EVOLUTION_API_URL}/manager/findInstances`, {
      headers: evolutionHeaders,
      timeout: 10000,
    });
    
    console.log('✅ Health check OK');
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Instâncias encontradas: ${healthResponse.data?.length || 0}`);
    console.log('');

    // Teste 2: Tentar criar uma instância de teste
    console.log('2️⃣ Testando criação de instância...');
    const testInstanceName = `test_${Date.now()}`;
    
    const createResponse = await axios.post(
      `${EVOLUTION_API_URL}/instance/create`,
      {
        instanceName: testInstanceName,
        token: 'test-token-123',
        qrcode: true,
        integration: "WHATSAPP-BAILEYS"
      },
      { 
        headers: evolutionHeaders,
        timeout: 30000
      }
    );
    
    console.log('✅ Instância criada com sucesso');
    console.log(`   Nome: ${testInstanceName}`);
    console.log(`   Resposta:`, JSON.stringify(createResponse.data, null, 2));
    console.log('');

    // Teste 3: Tentar deletar a instância de teste
    console.log('3️⃣ Limpando instância de teste...');
    try {
      await axios.delete(`${EVOLUTION_API_URL}/instance/delete/${testInstanceName}`, {
        headers: evolutionHeaders,
        timeout: 10000
      });
      console.log('✅ Instância de teste removida');
    } catch (deleteError) {
      console.log('⚠️ Não foi possível remover instância de teste:', deleteError.message);
    }

    console.log('');
    console.log('🎉 Todos os testes passaram! Evolution API está funcionando corretamente.');

  } catch (error) {
    console.error('❌ Erro nos testes:');
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Status Text: ${error.response?.statusText}`);
    console.error(`   Data:`, JSON.stringify(error.response?.data, null, 2));
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    
    if (error.response?.status === 401) {
      console.error('');
      console.error('🔑 Problema de autenticação:');
      console.error('   - Verifique se a EVOLUTION_API_KEY está correta');
      console.error('   - Verifique se a chave tem as permissões necessárias');
    } else if (error.response?.status === 404) {
      console.error('');
      console.error('🌐 Problema de URL:');
      console.error('   - Verifique se a EVOLUTION_API_URL está correta');
      console.error('   - Verifique se a Evolution API está rodando');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('');
      console.error('🔌 Problema de conexão:');
      console.error('   - Verifique se a Evolution API está rodando');
      console.error('   - Verifique se a URL está acessível');
    }
  }
}

// Executar teste
testEvolutionAPI().catch(console.error);
