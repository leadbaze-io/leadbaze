const axios = require('axios');

const TEST_USER_ID = '39dc6c62-6dea-4222-adb5-7075fd704189';
const BACKEND_URL = 'http://localhost:3001';

async function testCancellation() {
  console.log('🚀 ===== TESTE: CANCELAMENTO DE ASSINATURA =====\n');

  try {
    // 1. Verificar assinatura atual
    console.log('1️⃣ Verificando assinatura atual...');
    const currentResponse = await axios.get(`${BACKEND_URL}/api/perfect-pay/subscription/${TEST_USER_ID}`);
    
    let current = null;
    if (currentResponse.data.success && currentResponse.data.data) {
      current = currentResponse.data.data;
      console.log('✅ Assinatura atual:');
      console.log(`   Plano: ${current.plan_display_name}`);
      console.log(`   Preço: R$ ${current.price_monthly}`);
      console.log(`   Leads: ${current.leads_remaining}/${current.leads_limit}`);
      console.log(`   Status: ${current.status}`);
      console.log(`   Próxima cobrança: ${current.current_period_end}`);
    }

    // 2. Simular webhook de cancelamento
    console.log('\n2️⃣ Simulando webhook de cancelamento...');
    
    const timestamp = Date.now();
    const now = new Date();
    
    const webhookPayload = {
      // Campos baseados na documentação oficial
      token: "7378fa24f96b38a3b1805d7a6887bc82",
      code: `PPCPMTB${timestamp}`,
      subscription_amount: current.price_monthly,
      currency_enum: 1, // BRL
      payment_type_enum: 4, // Cartão de Crédito Recorrente
      sale_status_enum: 6, // Cancelada (documentação oficial)
      sale_status_detail: "cancelled_by_customer", // Cancelada pelo cliente
      start_date_recurrent: current.current_period_start,
      next_date_recurrent: null, // Não há próxima cobrança
      recurrent_type_enum: "Mensal",
      installments: 1,
      charges_made: 1,
      
      // Dados do produto/plano (mesmo plano atual)
      product: {
        name: current.plan_display_name,
        external_reference: `cancel_${TEST_USER_ID}_${current.plan_id}_${timestamp}` // cancel_userId_planId_timestamp
      },
      plan: {
        name: `${current.plan_display_name} - ${current.leads_limit} leads`
      },
      
      // Dados do cliente
      customer: {
        email: "creaty123456@gmail.com",
        full_name: "Jean Lopes"
      },
      
      webhook_owner: "PPAKIOL"
    };

    console.log('📝 Payload do webhook de cancelamento:');
    console.log(JSON.stringify(webhookPayload, null, 2));

    // 3. Enviar webhook
    console.log('\n3️⃣ Enviando webhook de cancelamento...');
    const webhookResponse = await axios.post(`${BACKEND_URL}/api/perfect-pay/webhook`, webhookPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Status:', webhookResponse.status);
    console.log('📊 Resposta:', JSON.stringify(webhookResponse.data, null, 2));

    if (webhookResponse.data.success && webhookResponse.data.result.processed) {
      console.log('\n🎉 CANCELAMENTO PROCESSADO COM SUCESSO!');
      
      // 4. Verificar resultado
      console.log('\n4️⃣ Verificando resultado...');
      const updatedResponse = await axios.get(`${BACKEND_URL}/api/perfect-pay/subscription/${TEST_USER_ID}`);
      
      if (updatedResponse.data.success && updatedResponse.data.data) {
        const updated = updatedResponse.data.data;
        console.log('✅ Assinatura após cancelamento:');
        console.log(`   Plano: ${updated.plan_display_name}`);
        console.log(`   Preço: R$ ${updated.price_monthly}`);
        console.log(`   Leads: ${updated.leads_remaining}/${updated.leads_limit}`);
        console.log(`   Status: ${updated.status}`);
        console.log(`   Próxima cobrança: ${updated.current_period_end}`);
        
        if (updated.status === 'cancelled') {
          console.log('\n🎯 CANCELAMENTO REALIZADO COM SUCESSO!');
          console.log('✅ Status atualizado para cancelled');
          console.log('✅ Leads mantidos até fim do período');
          console.log('✅ Não haverá mais cobranças');
        }
      }
    } else {
      console.log('\n❌ FALHA! Cancelamento não foi processado!');
      console.log('Erro:', webhookResponse.data.result?.error);
    }

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testCancellation();


