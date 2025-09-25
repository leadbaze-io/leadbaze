const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testEnvVars() {
  console.log('🔍 ===== TESTE: VARIÁVEIS DE AMBIENTE =====');
  
  try {
    // Testar endpoint que mostra as variáveis
    const response = await axios.get(`${BASE_URL}/api/perfect-pay/test`, {
      timeout: 5000
    });
    
    console.log('✅ Servidor respondendo:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erro ao conectar com servidor:', error.message);
    
    // Verificar se o servidor está rodando
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`, {
        timeout: 3000
      });
      console.log('✅ Servidor está rodando:', healthResponse.status);
    } catch (healthError) {
      console.error('❌ Servidor não está respondendo');
    }
  }
  
  console.log('\n📋 Variáveis locais:');
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL || 'NÃO DEFINIDA');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'DEFINIDA' : 'NÃO DEFINIDA');
}

testEnvVars();
