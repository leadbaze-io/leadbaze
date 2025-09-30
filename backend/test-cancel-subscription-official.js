const { createClient } = require('@supabase/supabase-js');
const PerfectPayService = require('./services/perfectPayService');

const supabase = createClient(
  'https://lsvwjyhnnzeewuuuykmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'
);

const perfectPayService = new PerfectPayService(supabase);
const TEST_USER_ID = '39dc6c62-6dea-4222-adb5-7075fd704189'; // Seu usuário de teste

async function testCancelSubscriptionOfficial() {
  console.log('🚀 ===== TESTE: CANCELAMENTO OFICIAL DE ASSINATURA =====\n');

  try {
    // 1. Verificar assinatura atual
    console.log('1️⃣ Verificando assinatura atual...');
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

    console.log('✅ Assinatura atual:');
    console.log(`   Status: ${currentSubscription.status}`);
    console.log(`   Plano: ${currentSubscription.payment_plans.display_name}`);
    console.log(`   Preço: R$ ${(currentSubscription.payment_plans.price_cents / 100).toFixed(2)}`);
    console.log(`   Leads: ${currentSubscription.leads_balance}/${currentSubscription.payment_plans.leads_included}`);
    console.log(`   Próxima cobrança: ${currentSubscription.current_period_end}`);
    console.log('\n');

    // 2. Simular webhook de cancelamento seguindo a documentação Perfect Pay
    console.log('2️⃣ Simulando webhook de cancelamento (sale_status_enum: 6)...');
    const timestamp = Date.now();
    const externalReference = `cancel_${TEST_USER_ID}_${currentSubscription.plan_id}_${timestamp}`;

    const webhookPayload = {
      token: "7378fa24f96b38a3b1805d7a6887bc82", // Token de teste
      code: `PPCPMTB${timestamp}`,
      subscription_amount: currentSubscription.payment_plans.price_cents / 100,
      currency_enum: 1,
      payment_type_enum: 4,
      sale_status_enum: 6, // Status de cancelamento (conforme documentação)
      sale_status_detail: "cancelled_by_customer", // Motivo do cancelamento
      start_date_recurrent: currentSubscription.current_period_start,
      next_date_recurrent: null, // Não há próxima cobrança após cancelamento
      recurrent_type_enum: "Mensal",
      installments: 1,
      charges_made: 1,
      product: {
        name: currentSubscription.payment_plans.display_name,
        external_reference: externalReference
      },
      plan: {
        name: `${currentSubscription.payment_plans.display_name} - ${currentSubscription.payment_plans.leads_included} leads`
      },
      customer: {
        email: "creaty123456@gmail.com", // Seu email de teste
        full_name: "Jean Lopes" // Seu nome de teste
      },
      webhook_owner: "PPAKIOL"
    };

    console.log('📝 Payload do webhook de cancelamento:');
    console.log(JSON.stringify(webhookPayload, null, 2));
    console.log('\n');

    // 3. Enviar webhook para o serviço
    console.log('3️⃣ Enviando webhook de cancelamento...');
    const webhookResponse = await perfectPayService.processWebhook(webhookPayload);

    console.log('✅ Status: 200');
    console.log('📊 Resposta:', JSON.stringify(webhookResponse, null, 2));
    console.log('\n🎉 CANCELAMENTO PROCESSADO!\n');

    // 4. Verificar resultado no banco de dados
    console.log('4️⃣ Verificando resultado...');
    const { data: afterCancellation, error: afterError } = await supabase
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

    if (afterError) {
      throw new Error(`Erro ao buscar assinatura após cancelamento: ${afterError.message}`);
    }

    console.log('✅ Assinatura após cancelamento:');
    console.log(`   Status: ${afterCancellation.status}`);
    console.log(`   Plano: ${afterCancellation.payment_plans.display_name}`);
    console.log(`   Preço: R$ ${(afterCancellation.payment_plans.price_cents / 100).toFixed(2)}`);
    console.log(`   Leads: ${afterCancellation.leads_balance}/${afterCancellation.payment_plans.leads_included}`);
    console.log(`   Acesso até: ${afterCancellation.current_period_end}`);
    console.log(`   Cancelado em: ${afterCancellation.cancelled_at}`);
    console.log(`   Motivo: ${afterCancellation.cancellation_reason}`);

    // 5. Testar API para verificar dados
    console.log('\n5️⃣ Testando API...');
    const apiResponse = await fetch(`http://localhost:3001/api/perfect-pay/subscription/${TEST_USER_ID}`);
    const apiData = await apiResponse.json();

    if (apiData.success && apiData.data) {
      console.log('✅ API retornando dados da assinatura cancelada:');
      console.log(`   Status: ${apiData.data.status}`);
      console.log(`   Plano: ${apiData.data.plan_display_name}`);
      console.log(`   Leads restantes: ${apiData.data.leads_remaining}`);
      console.log(`   Acesso até: ${apiData.data.access_until}`);
      console.log(`   É cancelada: ${apiData.data.is_cancelled}`);
      console.log(`   Cancelado em: ${apiData.data.cancelled_at}`);
      console.log(`   Motivo: ${apiData.data.cancellation_reason}`);
    } else {
      console.log('❌ API não retornou dados corretos');
    }

    // 6. Verificar se o aviso aparece corretamente
    console.log('\n6️⃣ Verificando condições para exibição do aviso...');
    const accessUntil = new Date(afterCancellation.current_period_end);
    const now = new Date();
    const isAccessExpired = now > accessUntil;
    
    console.log('📊 Condições do aviso:');
    console.log(`   Status cancelado: ${afterCancellation.status === 'cancelled' ? 'SIM' : 'NÃO'}`);
    console.log(`   Acesso até: ${accessUntil.toISOString()}`);
    console.log(`   Data atual: ${now.toISOString()}`);
    console.log(`   Acesso expirado: ${isAccessExpired ? 'SIM' : 'NÃO'}`);
    console.log(`   Leads restantes: ${afterCancellation.leads_balance}`);
    
    if (afterCancellation.status === 'cancelled' && !isAccessExpired) {
      console.log('✅ AVISO DEVE APARECER: Usuário tem assinatura cancelada com acesso ativo');
    } else if (afterCancellation.status === 'cancelled' && isAccessExpired) {
      console.log('⚠️ AVISO NÃO APARECE: Acesso já expirado');
    } else {
      console.log('❌ AVISO NÃO APARECE: Assinatura não está cancelada');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste de cancelamento:', error.message);
  }
}

testCancelSubscriptionOfficial();









