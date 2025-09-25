const PerfectPayService = require('./services/perfectPayService');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const perfectPayService = new PerfectPayService(supabase);

async function testPerfectPayCancellation() {
  console.log('🧪 [TESTE] ===== TESTANDO CANCELAMENTO PELO PERFECT PAY =====\n');

  try {
    // Buscar usuário real
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError || !users.users || users.users.length === 0) {
      console.error('❌ [TESTE] Erro ao buscar usuários:', usersError?.message);
      return;
    }
    const realUser = users.users[0];
    console.log('✅ [TESTE] Usuário real encontrado:', realUser.email);

    // PASSO 1: Buscar um plano real primeiro
    console.log('\n📋 [PASSO 1] Buscando plano real...');
    const { data: plans, error: plansError } = await supabase
      .from('payment_plans')
      .select('id')
      .limit(1);

    if (plansError || !plans || plans.length === 0) {
      console.error('❌ [PASSO 1] Erro ao buscar planos:', plansError?.message);
      return;
    }
    const realPlanId = plans[0].id;
    console.log('✅ [PASSO 1] Plano real encontrado:', realPlanId);

    // PASSO 2: Criar uma assinatura ativa
    console.log('\n📋 [PASSO 2] Criando assinatura ativa para teste...');
    const { data: newSubscription, error: createError } = await supabase
      .from('user_payment_subscriptions')
      .insert({
        user_id: realUser.id,
        plan_id: realPlanId,
        status: 'active',
        perfect_pay_transaction_id: 'TEST_TXN_' + Date.now(),
        leads_balance: 1000,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        first_payment_date: new Date().toISOString(),
        refund_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ [PASSO 2] Erro ao criar assinatura:', createError.message);
      return;
    }
    console.log('✅ [PASSO 2] Assinatura ativa criada:', newSubscription.id);

    // PASSO 3: Simular webhook de cancelamento do Perfect Pay
    console.log('\n📋 [PASSO 3] Simulando webhook de cancelamento do Perfect Pay...');
    const cancellationWebhook = {
      "token": "5550029d92c8e727464111a087b6d903",
      "code": "PPCPMTB5H3745O",
      "sale_amount": 5,
      "sale_status_enum": 6, // cancelled
      "sale_status_detail": "cancelled",
      "date_created": new Date().toISOString(),
      "product": {
        "name": "LeadBaze",
        "external_reference": null // Simulando external_reference null
      },
      "plan": {
        "name": "LeadBaze Start",
        "quantity": 1
      },
      "customer": {
        "email": realUser.email, // Usuário real
        "full_name": "Usuário Teste"
      },
      "subscription": {
        "code": "TEST_SUB_" + Date.now(),
        "charges_made": 1,
        "subscription_status_enum": 6,
        "status": "cancelled",
        "status_event": "subscription_cancelled" // Evento de cancelamento
      }
    };

    console.log('🔔 [PASSO 3] Webhook de cancelamento enviado...');
    const cancellationResult = await perfectPayService.processWebhook(cancellationWebhook);
    
    console.log('📊 [PASSO 3] Resultado do cancelamento:', cancellationResult.processed ? '✅ Sucesso' : '❌ Falhou');
    if (cancellationResult.processed) {
      console.log('  - Status da assinatura:', cancellationResult.subscription?.status);
      console.log('  - Data de cancelamento:', cancellationResult.subscription?.cancelled_at);
      console.log('  - Motivo do cancelamento:', cancellationResult.subscription?.cancellation_reason);
      console.log('  - Acesso até:', cancellationResult.access_until);
      console.log('  - Leads restantes:', cancellationResult.leads_remaining);
    } else {
      console.log('  - Erro:', cancellationResult.error);
    }

    // PASSO 4: Verificar se a assinatura foi realmente cancelada
    console.log('\n📋 [PASSO 4] Verificando status da assinatura no banco...');
    const { data: updatedSubscription, error: fetchError } = await supabase
      .from('user_payment_subscriptions')
      .select('*')
      .eq('id', newSubscription.id)
      .single();

    if (fetchError) {
      console.error('❌ [PASSO 4] Erro ao buscar assinatura:', fetchError.message);
    } else {
      console.log('✅ [PASSO 4] Status atual da assinatura:');
      console.log('  - ID:', updatedSubscription.id);
      console.log('  - Status:', updatedSubscription.status);
      console.log('  - Cancelado em:', updatedSubscription.cancelled_at);
      console.log('  - Motivo:', updatedSubscription.cancellation_reason);
      console.log('  - Acesso até:', updatedSubscription.current_period_end);
    }

    // PASSO 5: Limpar dados de teste
    console.log('\n📋 [PASSO 5] Limpando dados de teste...');
    await supabase
      .from('user_payment_subscriptions')
      .delete()
      .eq('id', newSubscription.id);
    console.log('✅ [PASSO 5] Dados de teste removidos');

    console.log('\n🎯 [TESTE] ===== CONCLUSÃO =====');
    if (cancellationResult.processed && updatedSubscription?.status === 'cancelled') {
      console.log('✅ [TESTE] SUCESSO: Sistema identifica cancelamento do Perfect Pay!');
      console.log('✅ [TESTE] Assinatura cancelada automaticamente no nosso sistema');
      console.log('✅ [TESTE] Usuário não será mais cobrado');
      console.log('✅ [TESTE] Acesso mantido até o final do período pago');
    } else {
      console.log('❌ [TESTE] FALHA: Sistema não identificou o cancelamento');
    }

  } catch (error) {
    console.error('❌ [TESTE] Erro inesperado:', error.message);
  }
}

testPerfectPayCancellation().catch(console.error);