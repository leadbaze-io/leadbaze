const axios = require('axios');
require('dotenv').config({ path: './config.env' });

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

const evolutionHeaders = {
  'Content-Type': 'application/json',
  'apikey': EVOLUTION_API_KEY
};

async function testEvolutionAPI() {
  try {
    console.log('🔍 Testando conectividade com Evolution API...');
    console.log('URL:', EVOLUTION_API_URL);
    console.log('API Key:', EVOLUTION_API_KEY ? '✅ Configurada' : '❌ Não configurada');
    
    // Teste 1: Health check
    console.log('\n1️⃣ Testando health check...');
    const healthResponse = await axios.get(`${EVOLUTION_API_URL}/instance/fetchInstances`, {
      headers: evolutionHeaders
    });
    console.log('✅ Health check OK:', healthResponse.status);
    
    // Teste 2: Criar instância
    console.log('\n2️⃣ Testando criação de instância...');
    const instanceName = `test_${Date.now()}`;
    
    const createResponse = await axios.post(
      `${EVOLUTION_API_URL}/instance/create`,
      {
        instanceName: instanceName,
        token: 'test-token-' + Date.now(),
        qrcode: true,
        number: "000000",
        webhookByEvents: false,
        events: [],
        waitQrCode: true,
        integration: "WHATSAPP-BAILEYS"
      },
      { headers: evolutionHeaders }
    );
    
    console.log('✅ Instância criada:', createResponse.data);
    
    // Teste 3: Iniciar instância
    console.log('\n3️⃣ Testando início da instância...');
    const startResponse = await axios.get(
      `${EVOLUTION_API_URL}/instance/start/${instanceName}`,
      { headers: evolutionHeaders }
    );
    console.log('✅ Instância iniciada:', startResponse.data);
    
    // Teste 4: Buscar QR Code
    console.log('\n4️⃣ Testando busca do QR Code...');
    const qrResponse = await axios.get(
      `${EVOLUTION_API_URL}/instance/connect/${instanceName}`,
      { headers: evolutionHeaders }
    );
    console.log('✅ QR Code response:', qrResponse.data);
    
    // Teste 5: Deletar instância
    console.log('\n5️⃣ Limpando instância de teste...');
    const deleteResponse = await axios.delete(
      `${EVOLUTION_API_URL}/instance/delete/${instanceName}`,
      { headers: evolutionHeaders }
    );
    console.log('✅ Instância deletada:', deleteResponse.data);
    
    console.log('\n🎉 Todos os testes passaram! A Evolution API está funcionando corretamente.');
    
  } catch (error) {
    console.error('\n❌ Erro nos testes:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Message:', error.message);
  }
}

testEvolutionAPI(); 