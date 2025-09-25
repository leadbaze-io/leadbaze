const axios = require('axios');

const TEST_USER_ID = '39dc6c62-6dea-4222-adb5-7075fd704189';
const BACKEND_URL = 'http://localhost:3001';

async function testUpgradeEnterprise() {
  console.log('🚀 ===== TESTE UPGRADE: SCALE → ENTERPRISE =====\n');

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

    // 2. Simular webhook de upgrade para Enterprise
    console.log('\n2️⃣ Simulando webhook de upgrade para Enterprise...');
    
    const timestamp = Date.now();
    const webhookPayload = {
      // Campos baseados na documentação oficial
      token: "7378fa24f96b38a3b1805d7a6887bc82",
      code: `PPCPMTB${timestamp}`,
      subscription_amount: 997.00, // Valor da assinatura Enterprise
      currency_enum: 1, // BRL
      payment_type_enum: 4, // Cartão de Crédito Recorrente
      sale_status_enum: 2, // Ativa (sistema espera este campo)
      sale_status_detail: "active", // Assinatura Ativa
      start_date_recurrent: new Date().toISOString(),
      next_date_recurrent: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 dias
      recurrent_type_enum: "Mensal",
      installments: 1,
      charges_made: 1,
      
      // Dados do produto/plano
      product: {
        name: "LeadBaze Enterprise",
        external_reference: `upgrade_${TEST_USER_ID}_3_${timestamp}` // Plano Enterprise = ID 3
      },
      plan: {
        name: "LeadBaze Enterprise - 10000 leads"
      },
      
      // Dados do cliente
      customer: {
        email: "creaty123456@gmail.com",
        full_name: "Jean Lopes"
      },
      
      webhook_owner: "PPAKIOL"
    };

    console.log('📝 Payload do webhook:');
    console.log(JSON.stringify(webhookPayload, null, 2));

    // 3. Enviar webhook
    console.log('\n3️⃣ Enviando webhook de upgrade...');
    const webhookResponse = await axios.post(`${BACKEND_URL}/api/perfect-pay/webhook`, webhookPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Status:', webhookResponse.status);
    console.log('📊 Resposta:', JSON.stringify(webhookResponse.data, null, 2));

    if (webhookResponse.data.success && webhookResponse.data.result.processed) {
      console.log('\n🎉 UPGRADE PROCESSADO COM SUCESSO!');
      
      // 4. Verificar resultado
      console.log('\n4️⃣ Verificando resultado...');
      const updatedResponse = await axios.get(`${BACKEND_URL}/api/perfect-pay/subscription/${TEST_USER_ID}`);
      
      if (updatedResponse.data.success && updatedResponse.data.data) {
        const updated = updatedResponse.data.data;
        console.log('✅ Assinatura após upgrade:');
        console.log(`   Plano: ${updated.plan_display_name}`);
        console.log(`   Preço: R$ ${updated.price_monthly}`);
        console.log(`   Leads: ${updated.leads_remaining}/${updated.leads_limit}`);
        console.log(`   Status: ${updated.status}`);
        
        if (updated.plan_display_name === 'Enterprise' && updated.price_monthly === 997) {
          console.log('\n🎯 UPGRADE REALIZADO COM SUCESSO!');
          console.log('✅ Plano atualizado para Enterprise');
          console.log('✅ Preço atualizado para R$ 997,00');
          console.log('✅ Leads atualizados para 10000');
          
          // Calcular leads excedentes
          const excessLeads = updated.leads_remaining - updated.leads_limit;
          if (excessLeads > 0) {
            console.log(`🎁 Leads excedentes (bônus): ${excessLeads}`);
          }
        }
      }
    } else {
      console.log('\n❌ FALHA! Upgrade não foi processado!');
      console.log('Erro:', webhookResponse.data.result?.error);
    }

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testUpgradeEnterprise();
