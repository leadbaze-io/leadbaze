import axios from 'axios';

// Simular exatamente o que o frontend está fazendo
const BACKEND_URL = 'https://leadflow-dtev.onrender.com';

async function simulateFrontendRequest() {
  try {
    console.log('🔍 Simulando requisição do frontend...');
    console.log('📍 URL:', BACKEND_URL);
    
    // Simular a requisição exata do frontend
    const instanceName = `creaty12345_${Date.now()}_csyb4m`;
    const userName = 'creaty12345@gmail.com';
    
    console.log('\n📝 Dados da requisição:');
    console.log('- instanceName:', instanceName);
    console.log('- userName:', userName);
    
    // Simular a requisição POST exata
    const response = await axios.post(
      `${BACKEND_URL}/api/create-instance-and-qrcode`,
      {
        instanceName: instanceName,
        userName: userName
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://leadflow-indol.vercel.app',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      }
    );
    
    console.log('\n✅ Resposta do backend:');
    console.log('- Status:', response.status);
    console.log('- Data:', response.data);
    
    // Simular busca de QR Code
    console.log('\n🔍 Simulando busca de QR Code...');
    
    const qrResponse = await axios.get(
      `${BACKEND_URL}/api/qrcode/${instanceName}`,
      {
        headers: {
          'Origin': 'https://leadflow-indol.vercel.app',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      }
    );
    
    console.log('\n✅ QR Code response:');
    console.log('- Status:', qrResponse.status);
    console.log('- Data:', {
      success: qrResponse.data.success,
      hasQRCode: qrResponse.data.hasQRCode,
      message: qrResponse.data.message
    });
    
    // Limpar instância
    console.log('\n🧹 Limpando instância...');
    
    const deleteResponse = await axios.delete(
      `${BACKEND_URL}/api/delete-instance/${instanceName}`,
      {
        headers: {
          'Origin': 'https://leadflow-indol.vercel.app',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      }
    );
    
    console.log('\n✅ Instância deletada:', deleteResponse.data);
    
    console.log('\n🎉 Simulação do frontend concluída com sucesso!');
    
  } catch (error) {
    console.error('\n❌ Erro na simulação do frontend:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });
    
    if (error.response?.status === 500) {
      console.log('\n💡 Erro 500 detectado - mesmo erro do frontend');
      console.log('📄 Detalhes do erro:', error.response.data);
    } else if (error.response?.status === 403) {
      console.log('\n💡 Erro 403 - Problema de CORS');
    }
  }
}

simulateFrontendRequest(); 