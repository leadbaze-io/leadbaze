require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a8e49f2-b584-4516-aeea-f342e75686f9';

async function processUnprocessedWebhook() {
  console.log('🔍 ===== PROCESSANDO WEBHOOK NÃO PROCESSADO =====\n');

  try {
    // 1. Buscar webhook não processado
    console.log('1️⃣ Buscando webhook não processado...');
    const { data: unprocessedWebhooks, error: unprocessedError } = await supabase
      .from('payment_webhooks')
      .select('*')
      .eq('processed', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (unprocessedError) {
      console.error('❌ Erro ao buscar webhook não processado:', unprocessedError.message);
      return;
    }

    if (!unprocessedWebhooks || unprocessedWebhooks.length === 0) {
      console.log('✅ Nenhum webhook não processado encontrado.');
      return;
    }

    const webhook = unprocessedWebhooks[0];
    console.log('📋 Webhook não processado encontrado:');
    console.log(`   ID: ${webhook.id}`);
    console.log(`   Criado: ${webhook.created_at}`);
    console.log(`   Raw Data: ${JSON.stringify(webhook.raw_data, null, 2)}`);

    // 2. Analisar dados do webhook
    const rawData = webhook.raw_data;
    console.log('\n2️⃣ Analisando dados do webhook...');
    
    if (!rawData) {
      console.log('❌ Webhook não possui raw_data válido.');
      return;
    }

    console.log('📊 Dados da transação:');
    console.log(`   Código: ${rawData.code}`);
    console.log(`   Status: ${rawData.sale_status_detail}`);
    console.log(`   Valor: R$ ${rawData.sale_amount}`);
    console.log(`   Email do cliente: ${rawData.customer.email}`);
    console.log(`   Nome do cliente: ${rawData.customer.full_name}`);
    console.log(`   Data de aprovação: ${rawData.date_approved}`);
    
    if (rawData.subscription) {
      console.log('\n📊 Dados da assinatura:');
      console.log(`   Código: ${rawData.subscription.code}`);
      console.log(`   Status: ${rawData.subscription.status}`);
      console.log(`   Status Event: ${rawData.subscription.status_event}`);
      console.log(`   Próxima cobrança: ${rawData.subscription.next_charge_date}`);
      console.log(`   Cobranças feitas: ${rawData.subscription.charges_made}`);
    }

    // 3. Verificar se o email corresponde ao usuário
    if (rawData.customer.email !== 'mathewshq20@hotmail.com') {
      console.log(`⚠️ Email do webhook (${rawData.customer.email}) não corresponde ao usuário (mathewshq20@hotmail.com)`);
      console.log('💡 Este webhook pode ser de outro usuário.');
      return;
    }

    console.log('✅ Email corresponde ao usuário em questão!');

    // 4. Verificar se já existe assinatura para este código
    console.log('\n3️⃣ Verificando se já existe assinatura...');
    const { data: existingSub, error: existingError } = await supabase
      .from('user_payment_subscriptions')
      .select('*')
      .eq('perfect_pay_transaction_id', rawData.code);

    if (existingError) {
      console.error('❌ Erro ao verificar assinatura existente:', existingError.message);
      return;
    }

    if (existingSub && existingSub.length > 0) {
      console.log('⚠️ Já existe uma assinatura com este transaction_id:');
      existingSub.forEach(sub => {
        console.log(`   ID: ${sub.id}`);
        console.log(`   Status: ${sub.status}`);
        console.log(`   User ID: ${sub.user_id}`);
        console.log(`   Criado: ${sub.created_at}`);
      });
      return;
    }

    // 5. Buscar plano correspondente
    console.log('\n4️⃣ Buscando plano correspondente...');
    const { data: plans, error: plansError } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_cents', { ascending: true });

    if (plansError) {
      console.error('❌ Erro ao buscar planos:', plansError.message);
      return;
    }

    // Encontrar plano pelo código ou pelo valor
    let selectedPlan = null;
    const webhookAmount = rawData.sale_amount * 100; // Converter para centavos
    
    for (const plan of plans) {
      if (plan.codigo_perfect_pay === rawData.plan.code || 
          plan.price_cents === webhookAmount) {
        selectedPlan = plan;
        break;
      }
    }

    if (!selectedPlan) {
      console.log('❌ Plano não encontrado para este webhook.');
      console.log(`   Código do plano no webhook: ${rawData.plan.code}`);
      console.log(`   Valor do webhook: R$ ${rawData.sale_amount} (${webhookAmount} centavos)`);
      console.log('📊 Planos disponíveis:');
      plans.forEach(plan => {
        console.log(`   - ${plan.name}: R$ ${(plan.price_cents / 100).toFixed(2)} (código: ${plan.codigo_perfect_pay})`);
      });
      return;
    }

    console.log('✅ Plano encontrado:');
    console.log(`   Nome: ${selectedPlan.name}`);
    console.log(`   Display: ${selectedPlan.display_name}`);
    console.log(`   Preço: R$ ${(selectedPlan.price_cents / 100).toFixed(2)}`);
    console.log(`   Leads: ${selectedPlan.leads_included}`);

    // 6. Criar assinatura
    console.log('\n5️⃣ Criando assinatura...');
    
    const now = new Date();
    const nextChargeDate = new Date(rawData.subscription.next_charge_date);
    
    const subscriptionData = {
      user_id: userId,
      plan_id: selectedPlan.id,
      status: 'active',
      leads_balance: selectedPlan.leads_included,
      leads_bonus: 0,
      first_payment_date: rawData.date_approved,
      current_period_start: rawData.date_approved,
      current_period_end: nextChargeDate.toISOString(),
      is_refund_eligible: true,
      refund_deadline: nextChargeDate.toISOString(),
      perfect_pay_transaction_id: rawData.code,
      perfect_pay_cancelled: false,
      requires_manual_cancellation: false,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };

    const { data: newSubscription, error: subscriptionError } = await supabase
      .from('user_payment_subscriptions')
      .insert(subscriptionData)
      .select()
      .single();

    if (subscriptionError) {
      console.error('❌ Erro ao criar assinatura:', subscriptionError.message);
      return;
    }

    console.log('✅ Assinatura criada com sucesso!');
    console.log(`   ID: ${newSubscription.id}`);
    console.log(`   Status: ${newSubscription.status}`);
    console.log(`   Leads: ${newSubscription.leads_balance}`);
    console.log(`   Transaction ID: ${newSubscription.perfect_pay_transaction_id}`);

    // 7. Marcar webhook como processado
    console.log('\n6️⃣ Marcando webhook como processado...');
    const { error: updateError } = await supabase
      .from('payment_webhooks')
      .update({
        processed: true,
        processed_at: now.toISOString(),
        subscription_id: newSubscription.id,
        transaction_id: rawData.code,
        error_message: null
      })
      .eq('id', webhook.id);

    if (updateError) {
      console.error('❌ Erro ao marcar webhook como processado:', updateError.message);
    } else {
      console.log('✅ Webhook marcado como processado!');
    }

    console.log('\n🎉 PROCESSAMENTO CONCLUÍDO COM SUCESSO!');
    console.log('💡 A assinatura do usuário foi ativada e o webhook foi processado.');

  } catch (err) {
    console.error('❌ Erro inesperado durante o processamento:', err.message);
  }
}

processUnprocessedWebhook();



