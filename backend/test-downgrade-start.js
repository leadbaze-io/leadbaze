const axios = require('axios');

const TEST_USER_ID = '39dc6c62-6dea-4222-adb5-7075fd704189';
const BACKEND_URL = 'http://localhost:3001';

async function testDowngradeStart() {
  console.log('🚀 ===== TESTE: DOWNGRADE ENTERPRISE → START =====\n');

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
      console.log(`   Próxima cobrança: ${current.current_period_end}`);
      console.log(`   Status: ${current.status}`);
    }

    // 2. Simular webhook de downgrade para Start
    console.log('\n2️⃣ Simulando webhook de downgrade para Start...');
    
    const timestamp = Date.now();
    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const webhookPayload = {
      // Campos baseados na documentação oficial
      token: "7378fa24f96b38a3b1805d7a6887bc82",
      code: `PPCPMTB${timestamp}`,
      subscription_amount: 197.00, // Valor da assinatura Start
      currency_enum: 1, // BRL
      payment_type_enum: 4, // Cartão de Crédito Recorrente
      sale_status_enum: 2, // Ativa (downgrade aprovado)
      sale_status_detail: "active", // Assinatura Ativa
      start_date_recurrent: now.toISOString(),
      next_date_recurrent: nextMonth.toISOString(), // +30 dias
      recurrent_type_enum: "Mensal",
      installments: 1,
      charges_made: 1, // Primeira cobrança do novo plano
      
      // Dados do produto/plano (downgrade)
      product: {
        name: "LeadBaze Start",
        external_reference: `downgrade_${TEST_USER_ID}_1_${timestamp}` // downgrade_userId_planId_timestamp
      },
      plan: {
        name: "LeadBaze Start - 1000 leads"
      },
      
      // Dados do cliente
      customer: {
        email: "creaty123456@gmail.com",
        full_name: "Jean Lopes"
      },
      
      webhook_owner: "PPAKIOL"
    };

    console.log('📝 Payload do webhook de downgrade:');
    console.log(JSON.stringify(webhookPayload, null, 2));

    // 3. Enviar webhook
    console.log('\n3️⃣ Enviando webhook de downgrade...');
    const webhookResponse = await axios.post(`${BACKEND_URL}/api/perfect-pay/webhook`, webhookPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Status:', webhookResponse.status);
    console.log('📊 Resposta:', JSON.stringify(webhookResponse.data, null, 2));

    if (webhookResponse.data.success && webhookResponse.data.result.processed) {
      console.log('\n🎉 DOWNGRADE PROCESSADO COM SUCESSO!');
      
      // 4. Verificar resultado
      console.log('\n4️⃣ Verificando resultado...');
      const updatedResponse = await axios.get(`${BACKEND_URL}/api/perfect-pay/subscription/${TEST_USER_ID}`);
      
      if (updatedResponse.data.success && updatedResponse.data.data) {
        const updated = updatedResponse.data.data;
        console.log('✅ Assinatura após downgrade:');
        console.log(`   Plano: ${updated.plan_display_name}`);
        console.log(`   Preço: R$ ${updated.price_monthly}`);
        console.log(`   Leads: ${updated.leads_remaining}/${updated.leads_limit}`);
        console.log(`   Próxima cobrança: ${updated.current_period_end}`);
        console.log(`   Status: ${updated.status}`);
        
        // Calcular leads após downgrade
        if (current) {
          const leadsBefore = current.leads_remaining;
          const leadsAfter = updated.leads_remaining;
          const leadsDifference = leadsBefore - leadsAfter;
          
          console.log(`\n🎯 ANÁLISE DO DOWNGRADE:`);
          console.log(`   Leads antes: ${leadsBefore}`);
          console.log(`   Leads depois: ${leadsAfter}`);
          console.log(`   Diferença: ${leadsDifference}`);
          
          if (updated.plan_display_name === 'Start' && updated.price_monthly === 197) {
            console.log('✅ Downgrade correto! Plano atualizado para Start');
            console.log('✅ Preço atualizado para R$ 197,00');
            console.log('✅ Leads atualizados para 1000');
          }
        }
        
        // Verificar se manteve os leads anteriores
        const excessLeads = updated.leads_remaining - updated.leads_limit;
        if (excessLeads > 0) {
          console.log(`🎁 Leads excedentes (bônus): ${excessLeads}`);
        }
      }
    } else {
      console.log('\n❌ FALHA! Downgrade não foi processado!');
      console.log('Erro:', webhookResponse.data.result?.error);
    }

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testDowngradeStart();
