const { createClient } = require('@supabase/supabase-js');
const PerfectPayService = require('./services/perfectPayService');

const supabase = createClient(
  'https://lsvwjyhnnzeewuuuykmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'
);

const perfectPayService = new PerfectPayService(supabase);
const TEST_USER_ID = '39dc6c62-6dea-4222-adb5-7075fd704189'; // Usuário de teste

async function testNewSubscriptionScale() {
  console.log('🚀 ===== TESTE: NOVA ASSINATURA SCALE =====\n');

  try {
    // 1. Verificar estado atual (assinatura cancelada com leads)
    console.log('1️⃣ Verificando estado atual...');
    const { data: currentSubscription, error: currentError } = await supabase
      .from('user_payment_subscriptions')
      .select(`
        *,
        payment_plans (
          name,
          display_name,
          price_cents,
          leads_included
        )
      `)
      .eq('user_id', TEST_USER_ID)
      .in('status', ['active', 'cancelled'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (currentError && currentError.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar assinatura atual: ${currentError.message}`);
    }

    if (!currentSubscription) {
      console.log('❌ Nenhuma assinatura encontrada para o usuário. Por favor, crie uma assinatura primeiro.');
      return;
    }

    console.log('✅ Estado atual:');
    console.log(`   Status: ${currentSubscription.status}`);
    console.log(`   Plano atual: ${currentSubscription.payment_plans.display_name}`);
    console.log(`   Leads disponíveis: ${currentSubscription.leads_balance}`);
    console.log(`   Acesso até: ${currentSubscription.current_period_end}`);
    console.log(`   Cancelado em: ${currentSubscription.cancelled_at}`);
    console.log('\n');

    // 2. Simular webhook de nova assinatura Scale
    console.log('2️⃣ Simulando webhook de nova assinatura Scale...');
    const timestamp = Date.now();
    const externalReference = `new_${TEST_USER_ID}_2_${timestamp}`; // 2 = Scale

    const webhookPayload = {
      token: "7378fa24f96b38a3b1805d7a6887bc82", // Token de teste
      code: `PPCPMTB${timestamp}`,
      subscription_amount: 497, // Preço do Scale
      currency_enum: 1,
      payment_type_enum: 4,
      sale_status_enum: 2, // Status ativo
      sale_status_detail: "Nova Assinatura Scale - Teste Real",
      start_date_recurrent: new Date().toISOString(),
      next_date_recurrent: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
      recurrent_type_enum: "Mensal",
      installments: 1,
      charges_made: 1,
      product: {
        name: "LeadBaze Scale",
        external_reference: externalReference
      },
      plan: {
        name: "LeadBaze Scale - 4000 leads"
      },
      customer: {
        email: "creaty123456@gmail.com", // Email do usuário de teste
        full_name: "Jean Lopes" // Nome do usuário de teste
      },
      webhook_owner: "PPAKIOL"
    };

    console.log('📝 Payload do webhook de nova assinatura:');
    console.log(JSON.stringify(webhookPayload, null, 2));
    console.log('\n');

    // 3. Enviar webhook para o serviço
    console.log('3️⃣ Enviando webhook de nova assinatura...');
    const webhookResponse = await perfectPayService.processWebhook(webhookPayload);

    console.log('✅ Status: 200');
    console.log('📊 Resposta:', JSON.stringify(webhookResponse, null, 2));
    console.log('\n🎉 NOVA ASSINATURA PROCESSADA!\n');

    // 4. Verificar resultado no banco de dados
    console.log('4️⃣ Verificando resultado...');
    const { data: newSubscription, error: newError } = await supabase
      .from('user_payment_subscriptions')
      .select(`
        *,
        payment_plans (
          name,
          display_name,
          price_cents,
          leads_included
        )
      `)
      .eq('user_id', TEST_USER_ID)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (newError) {
      throw new Error(`Erro ao buscar nova assinatura: ${newError.message}`);
    }

    console.log('✅ Nova assinatura criada:');
    console.log(`   Status: ${newSubscription.status}`);
    console.log(`   Plano: ${newSubscription.payment_plans.display_name}`);
    console.log(`   Preço: R$ ${(newSubscription.payment_plans.price_cents / 100).toFixed(2)}`);
    console.log(`   Leads do plano: ${newSubscription.payment_plans.leads_included}`);
    console.log(`   Leads disponíveis: ${newSubscription.leads_balance}`);
    console.log(`   Próxima cobrança: ${newSubscription.current_period_end}`);
    console.log(`   Criada em: ${newSubscription.created_at}`);

    // 5. Verificar se a assinatura anterior foi mantida ou substituída
    console.log('\n5️⃣ Verificando todas as assinaturas do usuário...');
    const { data: allSubscriptions, error: allError } = await supabase
      .from('user_payment_subscriptions')
      .select(`
        *,
        payment_plans (
          name,
          display_name,
          price_cents,
          leads_included
        )
      `)
      .eq('user_id', TEST_USER_ID)
      .order('created_at', { ascending: false });

    if (allError) {
      throw new Error(`Erro ao buscar todas as assinaturas: ${allError.message}`);
    }

    console.log(`✅ Total de assinaturas: ${allSubscriptions.length}`);
    allSubscriptions.forEach((sub, index) => {
      console.log(`   ${index + 1}. ${sub.payment_plans.display_name} - ${sub.status} - ${sub.leads_balance} leads - ${sub.created_at}`);
    });

    // 6. Testar API para verificar dados
    console.log('\n6️⃣ Testando API...');
    const apiResponse = await fetch(`http://localhost:3001/api/perfect-pay/subscription/${TEST_USER_ID}`);
    const apiData = await apiResponse.json();

    if (apiData.success && apiData.data) {
      console.log('✅ API retornando dados da nova assinatura:');
      console.log(`   Status: ${apiData.data.status}`);
      console.log(`   Plano: ${apiData.data.plan_display_name}`);
      console.log(`   Preço: R$ ${apiData.data.price_monthly}`);
      console.log(`   Leads restantes: ${apiData.data.leads_remaining}`);
      console.log(`   Leads do plano: ${apiData.data.leads_limit}`);
      console.log(`   Leads excedentes: ${apiData.data.leads_excess}`);
      console.log(`   Próxima cobrança: ${apiData.data.current_period_end}`);
      console.log(`   É cancelada: ${apiData.data.is_cancelled}`);
    } else {
      console.log('❌ API não retornou dados corretos');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste de nova assinatura:', error.message);
  }
}

testNewSubscriptionScale();
