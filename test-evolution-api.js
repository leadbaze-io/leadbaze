import axios from 'axios';

// Configuração do Evolution API
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'https://sua-evolution-api.com:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || 'sua-api-key-aqui';

console.log('🔍 Testando conectividade com Evolution API...');
console.log('📍 URL:', EVOLUTION_API_URL);
console.log('🔑 API Key:', EVOLUTION_API_KEY ? 'Configurada' : 'Não configurada');

const evolutionHeaders = {
  'Content-Type': 'application/json',
  'apikey': EVOLUTION_API_KEY
};

async function testEvolutionAPI() {
  try {
    console.log('\n1️⃣ Testando health check...');
    
    // Teste 1: Health check
    const healthResponse = await axios.get(`${EVOLUTION_API_URL}/instance/fetchInstances`, {
      headers: evolutionHeaders,
      timeout: 10000
    });
    
    console.log('✅ Health check OK:', healthResponse.status);
    console.log('📊 Instâncias encontradas:', healthResponse.data?.length || 0);
    
    // Teste 2: Criar instância de teste
    console.log('\n2️⃣ Testando criação de instância...');
    const testInstanceName = `test-${Date.now()}`;
    
    const createResponse = await axios.post(
      `${EVOLUTION_API_URL}/instance/create`,
      {
        instanceName: testInstanceName,
        token: 'test-token',
        qrcode: true,
        number: "000000",
        webhookByEvents: false,
        events: [],
        waitQrCode: true,
        integration: "WHATSAPP-BAILEYS"
      },
      { headers: evolutionHeaders, timeout: 15000 }
    );
    
    console.log('✅ Instância criada:', createResponse.data);
    
    // Teste 3: Iniciar instância
    console.log('\n3️⃣ Testando inicialização da instância...');
    
    try {
      const startResponse = await axios.get(
        `${EVOLUTION_API_URL}/instance/start/${testInstanceName}`,
        { headers: evolutionHeaders, timeout: 10000 }
      );
      console.log('✅ Instância iniciada:', startResponse.data);
    } catch (error) {
      console.log('⚠️ Erro ao iniciar instância (pode ser normal):', error.message);
    }
    
    // Teste 4: Buscar QR Code
    console.log('\n4️⃣ Testando busca de QR Code...');
    
    const qrResponse = await axios.get(
      `${EVOLUTION_API_URL}/instance/connect/${testInstanceName}`,
      { headers: evolutionHeaders, timeout: 10000 }
    );
    
    console.log('✅ QR Code response:', {
      hasQRCode: !!(qrResponse.data?.qrcode || qrResponse.data?.base64),
      fields: Object.keys(qrResponse.data || {})
    });
    
    // Teste 5: Verificar estado da conexão
    console.log('\n5️⃣ Testando verificação de estado...');
    
    const stateResponse = await axios.get(
      `${EVOLUTION_API_URL}/instance/connectionState/${testInstanceName}`,
      { headers: evolutionHeaders, timeout: 10000 }
    );
    
    console.log('✅ Estado da conexão:', stateResponse.data);
    
    // Teste 6: Limpar instância de teste
    console.log('\n6️⃣ Limpando instância de teste...');
    
    const deleteResponse = await axios.delete(
      `${EVOLUTION_API_URL}/instance/delete/${testInstanceName}`,
      { headers: evolutionHeaders, timeout: 10000 }
    );
    
    console.log('✅ Instância deletada:', deleteResponse.data);
    
    console.log('\n🎉 Todos os testes passaram! Evolution API está funcionando corretamente.');
    
  } catch (error) {
    console.error('\n❌ Erro nos testes:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Dica: Verifique se a URL da Evolution API está correta');
    } else if (error.response?.status === 401) {
      console.log('\n💡 Dica: Verifique se a API Key está correta');
    } else if (error.response?.status === 403) {
      console.log('\n💡 Dica: Verifique se a API Key tem permissões adequadas');
    }
  }
}

testEvolutionAPI(); 