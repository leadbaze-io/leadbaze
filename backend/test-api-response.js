const axios = require('axios');

async function testApiResponse() {
  try {
    console.log('🧪 ===== TESTANDO API CORRIGIDA =====\n');
    
    const response = await axios.get('http://localhost:3001/api/perfect-pay/subscription/39dc6c62-6dea-4222-adb5-7075fd704189');
    
    console.log('✅ Status:', response.status);
    console.log('📊 Resposta completa:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Verificar campos específicos que o frontend precisa
    const data = response.data.data;
    if (data) {
      console.log('\n🔍 Campos específicos para o frontend:');
      console.log('   plan_display_name:', data.plan_display_name);
      console.log('   price_monthly:', data.price_monthly);
      console.log('   leads_remaining:', data.leads_remaining);
      console.log('   leads_limit:', data.leads_limit);
      console.log('   current_period_end:', data.current_period_end);
      console.log('   status:', data.status);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testApiResponse();









