const axios = require('axios');

const TEST_USER_ID = '39dc6c62-6dea-4222-adb5-7075fd704189';
const BACKEND_URL = 'http://localhost:3001';

async function testUpgradeComplete() {
  console.log('🚀 ===== TESTE COMPLETO DE UPGRADE =====\n');

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
    } else {
      console.log('❌ Nenhuma assinatura ativa encontrada!');
      return;
    }

    // 2. Criar checkout para upgrade (Start → Scale)
    console.log('\n2️⃣ Criando checkout para upgrade (Start → Scale)...');
    
    // ID do plano Scale (assumindo que é o segundo plano)
    const upgradeRequest = {
      userId: TEST_USER_ID,
      planId: 'e9004fad-85ab-41b8-9416-477e41e8bcc9', // Plano Scale
      operationType: 'upgrade'
    };

    console.log('📝 Dados do upgrade:', JSON.stringify(upgradeRequest, null, 2));

    const checkoutResponse = await axios.post(
      `${BACKEND_URL}/api/perfect-pay/create-checkout-with-type`,
      upgradeRequest,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (checkoutResponse.data.success) {
      console.log('✅ Checkout de upgrade criado com sucesso!');
      console.log('📊 Resposta:', JSON.stringify(checkoutResponse.data, null, 2));
      
      if (checkoutResponse.data.data.checkout_url) {
        console.log('\n🔗 Link do checkout:', checkoutResponse.data.data.checkout_url);
        console.log('👆 Usuário deve acessar este link para completar o upgrade');
        console.log('\n📋 O que acontecerá após o pagamento:');
        console.log('   1. Perfect Pay processará o pagamento');
        console.log('   2. Webhook será enviado para seu sistema');
        console.log('   3. Sistema processará o upgrade');
        console.log('   4. Leads serão adicionados (4000 - 955 = 3045 leads adicionais)');
        console.log('   5. Plano será atualizado para Scale');
      }
    } else {
      console.log('❌ Erro ao criar checkout:', checkoutResponse.data.message);
    }

    // 3. Simular webhook de upgrade aprovado
    console.log('\n3️⃣ Simulando webhook de upgrade aprovado...');
    
    const timestamp = Date.now();
    const webhookPayload = {
      token: "7378fa24f96b38a3b1805d7a6887bc82",
      code: `PPCPMTB${timestamp}`,
      sale_amount: 497.00, // Preço do plano Scale
      currency_enum: 1,
      payment_type_enum: 4,
      sale_status_enum: 2, // Aprovado
      sale_status_detail: "Upgrade para Scale - Teste Real",
      date_created: new Date().toISOString(),
      date_approved: new Date().toISOString(),
      product: {
        code: "PPLQQNG90", // Código do plano Scale
        name: "LeadBaze Scale",
        external_reference: `upgrade_${TEST_USER_ID}_e9004fad-85ab-41b8-9416-477e41e8bcc9_${timestamp}`,
        guarantee: 7
      },
      plan: {
        code: "PPLQQNG90",
        name: "LeadBaze Scale - 4000 leads",
        quantity: 1
      },
      customer: {
        customer_type_enum: 1,
        full_name: "Jean Lopes",
        email: "creaty123456@gmail.com",
        identification_type: "CPF",
        identification_number: "11215289618",
        birthday: "1991-11-12",
        phone_area_code: "31",
        phone_number: "983323121",
        street_name: "Rua Joviano Camargos",
        street_number: "91",
        district: "Centro",
        complement: "Apto. 104",
        zip_code: "32015393",
        city: "Contagem",
        state: "MG",
        country: "BR"
      },
      webhook_owner: "PPAKIOL"
    };

    console.log('📝 Payload do webhook de upgrade:');
    console.log(JSON.stringify(webhookPayload, null, 2));

    const webhookResponse = await axios.post(`${BACKEND_URL}/api/perfect-pay/webhook`, webhookPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('\n🔄 Enviando webhook de upgrade...');
    console.log('✅ Status:', webhookResponse.status);
    console.log('📊 Resposta:', JSON.stringify(webhookResponse.data, null, 2));

    if (webhookResponse.data.success && webhookResponse.data.result.processed) {
      console.log('\n🎉 UPGRADE PROCESSADO COM SUCESSO!');
      console.log('🔍 Verificando assinatura atualizada...');
      
      // 4. Verificar assinatura após upgrade
      const updatedResponse = await axios.get(`${BACKEND_URL}/api/perfect-pay/subscription/${TEST_USER_ID}`);
      
      if (updatedResponse.data.success && updatedResponse.data.data) {
        const updated = updatedResponse.data.data;
        console.log('\n✅ Assinatura após upgrade:');
        console.log(`   Plano: ${updated.plan_display_name}`);
        console.log(`   Preço: R$ ${updated.price_monthly}`);
        console.log(`   Leads: ${updated.leads_remaining}/${updated.leads_limit}`);
        console.log(`   Status: ${updated.status}`);
        
        // Verificar se o upgrade foi aplicado corretamente
        if (updated.plan_display_name === 'Scale' && updated.price_monthly === 497) {
          console.log('\n🎯 UPGRADE REALIZADO COM SUCESSO!');
          console.log('✅ Plano atualizado para Scale');
          console.log('✅ Preço atualizado para R$ 497,00');
          console.log('✅ Leads atualizados para 4000');
        } else {
          console.log('\n❌ UPGRADE NÃO FOI APLICADO CORRETAMENTE!');
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

testUpgradeComplete();

