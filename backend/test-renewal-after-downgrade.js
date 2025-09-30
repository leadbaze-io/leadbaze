const axios = require('axios');

const TEST_USER_ID = '39dc6c62-6dea-4222-adb5-7075fd704189';
const BACKEND_URL = 'http://localhost:3001';

async function testRenewalAfterDowngrade() {
  console.log('🚀 ===== TESTE: RENOVAÇÃO START (APÓS DOWNGRADE) =====\n');

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

    // 2. Simular webhook de renovação (1 mês depois do downgrade)
    console.log('\n2️⃣ Simulando webhook de renovação mensal...');
    
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
      sale_status_enum: 2, // Ativa (renovação aprovada)
      sale_status_detail: "active", // Assinatura Ativa
      start_date_recurrent: now.toISOString(),
      next_date_recurrent: nextMonth.toISOString(), // +30 dias
      recurrent_type_enum: "Mensal",
      installments: 1,
      charges_made: 2, // Segunda cobrança (renovação)
      
      // Dados do produto/plano (mesmo plano Start)
      product: {
        name: "LeadBaze Start",
        external_reference: `renewal_${TEST_USER_ID}_1_${timestamp}` // renewal_userId_planId_timestamp
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

    console.log('📝 Payload do webhook de renovação:');
    console.log(JSON.stringify(webhookPayload, null, 2));

    // 3. Enviar webhook
    console.log('\n3️⃣ Enviando webhook de renovação...');
    const webhookResponse = await axios.post(`${BACKEND_URL}/api/perfect-pay/webhook`, webhookPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Status:', webhookResponse.status);
    console.log('📊 Resposta:', JSON.stringify(webhookResponse.data, null, 2));

    if (webhookResponse.data.success && webhookResponse.data.result.processed) {
      console.log('\n🎉 RENOVAÇÃO PROCESSADA COM SUCESSO!');
      
      // 4. Verificar resultado
      console.log('\n4️⃣ Verificando resultado...');
      const updatedResponse = await axios.get(`${BACKEND_URL}/api/perfect-pay/subscription/${TEST_USER_ID}`);
      
      if (updatedResponse.data.success && updatedResponse.data.data) {
        const updated = updatedResponse.data.data;
        console.log('✅ Assinatura após renovação:');
        console.log(`   Plano: ${updated.plan_display_name}`);
        console.log(`   Preço: R$ ${updated.price_monthly}`);
        console.log(`   Leads: ${updated.leads_remaining}/${updated.leads_limit}`);
        console.log(`   Próxima cobrança: ${updated.current_period_end}`);
        console.log(`   Status: ${updated.status}`);
        
        // Calcular leads adicionados
        if (current) {
          const leadsAdded = updated.leads_remaining - current.leads_remaining;
          console.log(`\n🎯 LEADS ADICIONADOS NA RENOVAÇÃO: ${leadsAdded}`);
          
          if (leadsAdded === 1000) {
            console.log('✅ Renovação correta! Adicionou exatamente 1000 leads do plano Start');
          } else {
            console.log(`⚠️  Atenção: Esperado 1000 leads, mas adicionou ${leadsAdded}`);
          }
        } else {
          console.log('\n🎯 RENOVAÇÃO PROCESSADA (não foi possível calcular leads adicionados)');
        }
        
        // Verificar se manteve os leads anteriores
        const excessLeads = updated.leads_remaining - updated.leads_limit;
        if (excessLeads > 0) {
          console.log(`🎁 Leads excedentes (bônus): ${excessLeads}`);
        }
      }
    } else {
      console.log('\n❌ FALHA! Renovação não foi processada!');
      console.log('Erro:', webhookResponse.data.result?.error);
    }

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testRenewalAfterDowngrade();










