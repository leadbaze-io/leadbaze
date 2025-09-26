const axios = require('axios');

// Script para testar as rotas dos planos
async function testPlansRoutes() {
  console.log('🧪 TESTANDO ROTAS DOS PLANOS...\n');
  
  const baseUrl = 'http://localhost:3001';
  const testUserId = 'f20ceb6a-0e59-477c-9a85-afc39ea90afe';
  
  try {
    // 1. Testar rota /api/subscription/plans
    console.log('1️⃣ Testando /api/subscription/plans...');
    try {
      const response1 = await axios.get(`${baseUrl}/api/subscription/plans?userId=${testUserId}`);
      console.log('✅ Status:', response1.status);
      console.log('✅ Success:', response1.data.success);
      console.log('✅ Plans count:', response1.data.data?.availablePlans?.length || 0);
      
      if (response1.data.data?.availablePlans) {
        console.log('📋 Planos encontrados:');
        response1.data.data.availablePlans.forEach(plan => {
          console.log(`   - ${plan.displayName}: R$ ${plan.price} (${plan.leads} leads)`);
        });
      }
    } catch (error) {
      console.log('❌ Erro:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 2. Testar rota /api/perfect-pay/plans
    console.log('2️⃣ Testando /api/perfect-pay/plans...');
    try {
      const response2 = await axios.get(`${baseUrl}/api/perfect-pay/plans`);
      console.log('✅ Status:', response2.status);
      console.log('✅ Success:', response2.data.success);
      console.log('✅ Plans count:', response2.data.plans?.length || 0);
      
      if (response2.data.plans) {
        console.log('📋 Planos encontrados:');
        response2.data.plans.forEach(plan => {
          console.log(`   - ${plan.displayName}: R$ ${plan.price} (${plan.leads} leads)`);
        });
      }
    } catch (error) {
      console.log('❌ Erro:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 3. Testar rota /api/subscription/original/:userId
    console.log('3️⃣ Testando /api/subscription/original/:userId...');
    try {
      const response3 = await axios.get(`${baseUrl}/api/subscription/original/${testUserId}`);
      console.log('✅ Status:', response3.status);
      console.log('✅ Success:', response3.data.success);
      console.log('✅ Data:', response3.data.data ? 'Encontrado' : 'Não encontrado');
    } catch (error) {
      console.log('❌ Erro:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 4. Verificar se o servidor está respondendo
    console.log('4️⃣ Testando se o servidor está online...');
    try {
      const response4 = await axios.get(`${baseUrl}/api/perfect-pay/plans`);
      console.log('✅ Servidor está online e respondendo');
    } catch (error) {
      console.log('❌ Servidor não está respondendo:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
  
  console.log('\n🏁 TESTE CONCLUÍDO!');
}

// Executar o teste
testPlansRoutes();


