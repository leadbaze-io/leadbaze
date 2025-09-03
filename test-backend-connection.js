import axios from 'axios';

// Testar o backend do LeadFlow
const BACKEND_URL = 'https://leadflow-dtev.onrender.com';

async function testBackendConnection() {
  try {
    console.log('🔍 Testando conectividade do backend...');
    console.log('📍 URL:', BACKEND_URL);
    
    // Teste 1: Health check
    console.log('\n1️⃣ Testando health check...');
    const healthResponse = await axios.get(`${BACKEND_URL}/api/health`);
    console.log('✅ Health check OK:', healthResponse.status);
    console.log('📄 Resposta:', healthResponse.data);
    
    // Teste 2: Criar instância
    console.log('\n2️⃣ Testando criação de instância...');
    const testInstanceName = `test-${Date.now()}`;
    
    const createResponse = await axios.post(
      `${BACKEND_URL}/api/create-instance-and-qrcode`,
      {
        instanceName: testInstanceName,
        userName: 'test-user'
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      }
    );
    
    console.log('✅ Instância criada:', createResponse.data);
    
    // Teste 3: Buscar QR Code
    console.log('\n3️⃣ Testando busca de QR Code...');
    
    const qrResponse = await axios.get(
      `${BACKEND_URL}/api/qrcode/${testInstanceName}`,
      { timeout: 10000 }
    );
    
    console.log('✅ QR Code response:', qrResponse.data);
    
    // Teste 4: Verificar estado da conexão
    console.log('\n4️⃣ Testando verificação de estado...');
    
    const stateResponse = await axios.get(
      `${BACKEND_URL}/api/connection-state/${testInstanceName}`,
      { timeout: 10000 }
    );
    
    console.log('✅ Estado da conexão:', stateResponse.data);
    
    // Teste 5: Limpar instância
    console.log('\n5️⃣ Limpando instância de teste...');
    
    const deleteResponse = await axios.delete(
      `${BACKEND_URL}/api/delete-instance/${testInstanceName}`,
      { timeout: 10000 }
    );
    
    console.log('✅ Instância deletada:', deleteResponse.data);
    
    console.log('\n🎉 Todos os testes do backend passaram!');
    
  } catch (error) {
    console.error('\n❌ Erro nos testes do backend:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    if (error.response?.status === 500) {
      console.log('\n💡 Erro 500: Verifique os logs do backend para mais detalhes');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Dica: Verifique se a URL do backend está correta');
    }
  }
}

testBackendConnection(); 