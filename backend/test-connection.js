/**
 * Script de teste para verificar a conexão com a Evolution API
 * Execute: node test-connection.js
 */

const axios = require('axios');
require('dotenv').config({ path: './config.env' });

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

const evolutionHeaders = {
  'Content-Type': 'application/json',
  'apikey': EVOLUTION_API_KEY
};

async function testConnection() {
  try {
    console.log('🧪 Testando conexão com Evolution API...');
    console.log('URL:', EVOLUTION_API_URL);
    console.log('API Key:', EVOLUTION_API_KEY ? '✅ Configurada' : '❌ Não configurada');

    // 1. Testar se a API está respondendo
    console.log('\n1️⃣ Testando se a API está respondendo...');
    try {
      const healthResponse = await axios.get(`${EVOLUTION_API_URL}/instance/fetchInstances`, { headers: evolutionHeaders });
      console.log('✅ API respondendo:', healthResponse.data);
    } catch (error) {
      console.log('❌ API não está respondendo:', error.message);
      return;
    }

    // 2. Criar uma instância de teste
    const testInstanceName = `test_${Date.now()}`;
    console.log(`\n2️⃣ Criando instância de teste: ${testInstanceName}`);
    
    const createResponse = await axios.post(
      `${EVOLUTION_API_URL}/instance/create`,
      {
        instanceName: testInstanceName,
        token: 'test-token-123',
        qrcode: true,
        webhook: "",
        webhookByEvents: false,
        events: [],
        waitQrCode: true,
        integration: "WHATSAPP-BAILEYS"
      },
      { headers: evolutionHeaders }
    );

    console.log('✅ Instância criada:', createResponse.data);

    // 3. Verificar estado da instância
    console.log('\n3️⃣ Verificando estado da instância...');
    const stateResponse = await axios.get(
      `${EVOLUTION_API_URL}/instance/connectionState/${testInstanceName}`,
      { headers: evolutionHeaders }
    );
    console.log('✅ Estado da instância:', stateResponse.data);

    // 4. Tentar obter QR Code com diferentes endpoints
    console.log('\n4️⃣ Testando diferentes endpoints para QR Code...');
    
    // Endpoint 1: /instance/connect/{instanceName}
    try {
      console.log('🔍 Tentando /instance/connect/{instanceName}...');
      const qrResponse1 = await axios.get(
        `${EVOLUTION_API_URL}/instance/connect/${testInstanceName}`,
        { headers: evolutionHeaders }
      );
      console.log('✅ Resposta:', qrResponse1.data);
    } catch (error) {
      console.log('❌ Erro:', error.response?.data || error.message);
    }

    // Endpoint 2: /instance/{instanceName}/qrcode
    try {
      console.log('🔍 Tentando /instance/{instanceName}/qrcode...');
      const qrResponse2 = await axios.get(
        `${EVOLUTION_API_URL}/instance/${testInstanceName}/qrcode`,
        { headers: evolutionHeaders }
      );
      console.log('✅ Resposta:', qrResponse2.data);
    } catch (error) {
      console.log('❌ Erro:', error.response?.data || error.message);
    }

    // Endpoint 3: /instance/{instanceName}/qrcode com token
    try {
      console.log('🔍 Tentando /instance/{instanceName}/qrcode com token...');
      const instanceToken = createResponse.data.hash;
      const qrResponse3 = await axios.get(
        `${EVOLUTION_API_URL}/instance/${testInstanceName}/qrcode`,
        { 
          headers: {
            ...evolutionHeaders,
            'Authorization': `Bearer ${instanceToken}`
          }
        }
      );
      console.log('✅ Resposta:', qrResponse3.data);
    } catch (error) {
      console.log('❌ Erro:', error.response?.data || error.message);
    }

    // 5. Aguardar e tentar novamente
    console.log('\n5️⃣ Aguardando 10 segundos e tentando novamente...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    try {
      console.log('🔍 Tentativa final para QR Code...');
      const qrResponseFinal = await axios.get(
        `${EVOLUTION_API_URL}/instance/connect/${testInstanceName}`,
        { headers: evolutionHeaders }
      );
      console.log('✅ Resposta final:', qrResponseFinal.data);
    } catch (error) {
      console.log('❌ Erro final:', error.response?.data || error.message);
    }

    // 6. Limpar instância de teste
    console.log('\n6️⃣ Limpando instância de teste...');
    try {
      await axios.delete(
        `${EVOLUTION_API_URL}/instance/delete/${testInstanceName}`,
        { headers: evolutionHeaders }
      );
      console.log('✅ Instância deletada');
    } catch (error) {
      console.log('❌ Erro ao deletar:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

testConnection(); 