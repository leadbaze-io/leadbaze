const axios = require('axios');

const TEST_USER_ID = '39dc6c62-6dea-4222-adb5-7075fd704189';
const BACKEND_URL = 'http://localhost:3001';

async function testUpgradeAPI() {
  console.log('🚀 ===== TESTE: API DE UPGRADE =====\n');

  try {
    // 1. Verificar assinatura atual
    console.log('1️⃣ Verificando assinatura atual...');
    const currentResponse = await axios.get(`${BACKEND_URL}/api/perfect-pay/subscription/${TEST_USER_ID}`);
    
    if (currentResponse.data.success && currentResponse.data.data) {
      const current = currentResponse.data.data;
      console.log('✅ Assinatura atual:');
      console.log(`   Plano: ${current.plan_display_name}`);
      console.log(`   Preço: R$ ${current.price_monthly}`);
      console.log(`   Leads: ${current.leads_remaining}/${current.leads_limit}`);
      console.log(`   Status: ${current.status}`);
    }

    // 2. Testar API de upgrade
    console.log('\n2️⃣ Testando API de upgrade...');
    
    const upgradePayload = {
      userId: TEST_USER_ID,
      newPlanId: '2', // Plano Scale
      reason: 'Teste de upgrade via API'
    };

    console.log('📝 Payload da API:', JSON.stringify(upgradePayload, null, 2));

    // 3. Chamar API
    console.log('\n3️⃣ Chamando API de upgrade...');
    const upgradeResponse = await axios.post(`${BACKEND_URL}/api/perfect-pay/upgrade`, upgradePayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Status:', upgradeResponse.status);
    console.log('📊 Resposta:', JSON.stringify(upgradeResponse.data, null, 2));

    if (upgradeResponse.data.success) {
      console.log('\n🎉 UPGRADE VIA API REALIZADO COM SUCESSO!');
      
      // 4. Verificar resultado
      console.log('\n4️⃣ Verificando resultado...');
      const updatedResponse = await axios.get(`${BACKEND_URL}/api/perfect-pay/subscription/${TEST_USER_ID}`);
      
      if (updatedResponse.data.success && updatedResponse.data.data) {
        const updated = updatedResponse.data.data;
        console.log('✅ Assinatura após upgrade via API:');
        console.log(`   Plano: ${updated.plan_display_name}`);
        console.log(`   Preço: R$ ${updated.price_monthly}`);
        console.log(`   Leads: ${updated.leads_remaining}/${updated.leads_limit}`);
        console.log(`   Status: ${updated.status}`);
        
        if (updated.plan_display_name === 'Scale' && updated.price_monthly === 497) {
          console.log('\n🎯 UPGRADE VIA API REALIZADO COM SUCESSO!');
          console.log('✅ Plano atualizado para Scale');
          console.log('✅ Preço atualizado para R$ 497,00');
          console.log('✅ Leads atualizados para 4000');
        }
      }
    } else {
      console.log('\n❌ FALHA! Upgrade via API não foi processado!');
      console.log('Erro:', upgradeResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testUpgradeAPI();
