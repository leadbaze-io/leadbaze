const { createClient } = require('@supabase/supabase-js');
const PerfectPayService = require('./services/perfectPayService');

const supabase = createClient(
  'https://lsvwjyhnnzeewuuuykmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'
);

const perfectPayService = new PerfectPayService(supabase);
const TEST_USER_ID = '39dc6c62-6dea-4222-adb5-7075fd704189';

async function testNewSubscriptionAfterCancellation() {
  console.log('🚀 ===== TESTE: NOVA ASSINATURA APÓS CANCELAMENTO =====\n');

  try {
    // 1. Verificar estado atual (deve estar cancelado)
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
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (currentError && currentError.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar assinatura atual: ${currentError.message}`);
    }

    if (!currentSubscription) {
      console.log('❌ Nenhuma assinatura encontrada para o usuário.');
      return;
    }

    console.log('✅ Estado atual:');
    console.log(`   Status: ${currentSubscription.status}`);
    console.log(`   Plano atual: ${currentSubscription.payment_plans.display_name}`);
    console.log(`   Leads disponíveis: ${currentSubscription.leads_balance}`);
    console.log(`   Acesso até: ${currentSubscription.current_period_end}`);
    console.log(`   Cancelado em: ${currentSubscription.cancelled_at}`);
    console.log('\n');

    if (currentSubscription.status !== 'cancelled') {
      console.log('⚠️ Assinatura não está cancelada. Cancelando primeiro...');
      return;
    }

    // 2. Simular webhook de nova assinatura Enterprise seguindo documentação Perfect Pay
    console.log('2️⃣ Simulando webhook de nova assinatura Enterprise (sale_status_enum: 2)...');
    const timestamp = Date.now();
    const externalReference = `new_${TEST_USER_ID}_3_${timestamp}`; // 3 = Enterprise

    const webhookPayload = {
      token: "7378fa24f96b38a3b1805d7a6887bc82", // Token de teste
      code: `PPCPMTB${timestamp}`,
      subscription_amount: 997, // Preço do Enterprise
      currency_enum: 1,
      payment_type_enum: 4, // Assinatura recorrente
      sale_status_enum: 2, // Status ativo (conforme documentação)
      sale_status_detail: "Nova Assinatura Enterprise - Após Cancelamento",
      start_date_recurrent: new Date().toISOString(),
      next_date_recurrent: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
      recurrent_type_enum: "Mensal",
      installments: 1,
      charges_made: 1,
      product: {
        name: "LeadBaze Enterprise",
        external_reference: externalReference
      },
      plan: {
        name: "LeadBaze Enterprise - 10000 leads"
      },
      customer: {
        email: "creaty123456@gmail.com", // Seu email de teste
        full_name: "Jean Lopes" // Seu nome de teste
      },
      webhook_owner: "PPAKIOL"
    };

    console.log('📝 Payload do webhook de nova assinatura Enterprise:');
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

    console.log('✅ Nova assinatura:');
    console.log(`   Status: ${newSubscription.status}`);
    console.log(`   Plano: ${newSubscription.payment_plans.display_name}`);
    console.log(`   Preço: R$ ${(newSubscription.payment_plans.price_cents / 100).toFixed(2)}`);
    console.log(`   Leads do plano: ${newSubscription.payment_plans.leads_included}`);
    console.log(`   Leads disponíveis: ${newSubscription.leads_balance}`);
    console.log(`   Próxima cobrança: ${newSubscription.current_period_end}`);
    console.log(`   Criada em: ${newSubscription.created_at}`);

    // 5. Verificar todas as assinaturas do usuário
    console.log('\n5️⃣ Verificando histórico de assinaturas...');
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

    console.log(`✅ Histórico de assinaturas (${allSubscriptions.length} total):`);
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
      console.log(`   Cancelado em: ${apiData.data.cancelled_at}`);
    } else {
      console.log('❌ API não retornou dados corretos');
    }

    // 7. Verificar se o aviso de cancelamento desapareceu
    console.log('\n7️⃣ Verificando condições do aviso...');
    const accessUntil = new Date(newSubscription.current_period_end);
    const now = new Date();
    const isAccessExpired = now > accessUntil;
    
    console.log('📊 Condições do aviso:');
    console.log(`   Status cancelado: ${newSubscription.status === 'cancelled' ? 'SIM' : 'NÃO'}`);
    console.log(`   Acesso até: ${accessUntil.toISOString()}`);
    console.log(`   Data atual: ${now.toISOString()}`);
    console.log(`   Acesso expirado: ${isAccessExpired ? 'SIM' : 'NÃO'}`);
    console.log(`   Leads restantes: ${newSubscription.leads_balance}`);
    
    if (newSubscription.status === 'active') {
      console.log('✅ AVISO NÃO DEVE APARECER: Nova assinatura ativa criada com sucesso');
    } else if (newSubscription.status === 'cancelled' && !isAccessExpired) {
      console.log('⚠️ AVISO AINDA APARECE: Assinatura ainda cancelada');
    } else {
      console.log('❌ ESTADO INESPERADO');
    }

    // 8. Comparar com assinatura anterior
    console.log('\n8️⃣ Comparação com assinatura anterior...');
    console.log(`   Plano anterior: ${currentSubscription.payment_plans.display_name} (${currentSubscription.leads_balance} leads)`);
    console.log(`   Novo plano: ${newSubscription.payment_plans.display_name} (${newSubscription.leads_balance} leads)`);
    console.log(`   Diferença de leads: ${newSubscription.leads_balance - currentSubscription.leads_balance}`);
    
    if (newSubscription.leads_balance === newSubscription.payment_plans.leads_included) {
      console.log('✅ CORRETO: Leads resetados para o novo plano');
    } else {
      console.log('⚠️ ATENÇÃO: Leads não foram resetados corretamente');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste de nova assinatura:', error.message);
  }
}

testNewSubscriptionAfterCancellation();











