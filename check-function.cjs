const axios = require('axios');

async function checkFunction() {
  try {
    console.log('🔍 Verificando função SQL...');
    
    // Testar a função diretamente
    const response = await axios.post('http://localhost:3001/api/blog/automation/admin/process', {}, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    console.log('📄 Resposta:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Erro:', error.response?.data || error.message);
  }
}

checkFunction();
