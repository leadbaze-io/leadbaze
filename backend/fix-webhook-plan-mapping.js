require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixWebhookPlanMapping() {
  console.log('🔍 ===== CORRIGINDO MAPEAMENTO DE PLANO DO WEBHOOK =====\n');

  try {
    // 1. Buscar webhook com erro "Plano não encontrado" do usuário
    console.log('1️⃣ Buscando webhook com erro do usuário...');
    const { data: errorWebhooks, error: errorError } = await supabase
      .from('payment_webhooks')
      .select('*')
      .eq('error_message', 'Plano não encontrado')
      .contains('raw_data', { customer: { email: 'mathewshq20@hotmail.com' } })
      .order('created_at', { ascending: false })
      .limit(1);

    if (errorError) {
      console.error('❌ Erro ao buscar webhook:', errorError.message);
      return;
    }

    if (!errorWebhooks || errorWebhooks.length === 0) {
      console.log('❌ Nenhum webhook com erro encontrado para este usuário.');
      return;
    }

    const webhook = errorWebhooks[0];
    console.log('📋 Webhook com erro encontrado:');
    console.log(`   ID: ${webhook.id}`);
    console.log(`   Transaction Code: ${webhook.raw_data.code}`);
    console.log(`   Sale Amount: R$ ${webhook.raw_data.sale_amount}`);
    console.log(`   Plan Code: ${webhook.raw_data.plan.code}`);
    console.log(`   Plan Name: ${webhook.raw_data.plan.name}`);

    // 2. Verificar planos disponíveis
    console.log('\n2️⃣ Verificando planos disponíveis...');
    const { data: plans, error: plansError } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_cents', { ascending: true });

    if (plansError) {
      console.error('❌ Erro ao buscar planos:', plansError.message);
      return;
    }

    console.log(`📊 Planos disponíveis: ${plans.length}`);
    plans.forEach((plan, index) => {
      console.log(`   ${index + 1}. ${plan.name}`);
      console.log(`      Display: ${plan.display_name}`);
      console.log(`      Preço: R$ ${(plan.price_cents / 100).toFixed(2)}`);
      console.log(`      Leads: ${plan.leads_included}`);
      console.log(`      Código Perfect Pay: ${plan.codigo_perfect_pay}`);
      console.log(`      ---`);
    });

    // 3. Encontrar plano correspondente
    console.log('\n3️⃣ Procurando plano correspondente...');
    const webhookAmount = webhook.raw_data.sale_amount * 100; // Converter para centavos
    const webhookPlanCode = webhook.raw_data.plan.code;
    
    console.log(`🔍 Buscando plano com:`);
    console.log(`   - Código Perfect Pay: ${webhookPlanCode}`);
    console.log(`   - Valor: R$ ${webhook.raw_data.sale_amount} (${webhookAmount} centavos)`);

    let selectedPlan = null;
    
    // Primeiro, tentar por código
    selectedPlan = plans.find(plan => plan.codigo_perfect_pay === webhookPlanCode);
    
    if (selectedPlan) {
      console.log(`✅ Plano encontrado por código: ${selectedPlan.name}`);
    } else {
      // Se não encontrar por código, tentar por valor
      selectedPlan = plans.find(plan => plan.price_cents === webhookAmount);
      if (selectedPlan) {
        console.log(`✅ Plano encontrado por valor: ${selectedPlan.name}`);
      } else {
        // Se não encontrar por valor exato, procurar o mais próximo
        const closestPlan = plans.reduce((closest, plan) => {
          const diff = Math.abs(plan.price_cents - webhookAmount);
          const closestDiff = Math.abs(closest.price_cents - webhookAmount);
          return diff < closestDiff ? plan : closest;
        });
        
        console.log(`⚠️ Plano exato não encontrado. Plano mais próximo:`);
        console.log(`   - ${closestPlan.name}: R$ ${(closestPlan.price_cents / 100).toFixed(2)}`);
        console.log(`   - Diferença: R$ ${Math.abs(closestPlan.price_cents - webhookAmount) / 100}`);
        
        // Se a diferença for pequena (menos de R$ 1), usar o plano mais próximo
        if (Math.abs(closestPlan.price_cents - webhookAmount) <= 100) {
          selectedPlan = closestPlan;
          console.log(`✅ Usando plano mais próximo (diferença aceitável)`);
        }
      }
    }

    if (!selectedPlan) {
      console.log('❌ Nenhum plano correspondente encontrado.');
      console.log('💡 Possíveis soluções:');
      console.log('   1. Adicionar o código do plano na tabela payment_plans');
      console.log('   2. Verificar se o código está correto no Perfect Pay');
      console.log('   3. Criar um novo plano com este código');
      return;
    }

    console.log(`\n✅ Plano selecionado: ${selectedPlan.name}`);
    console.log(`   ID: ${selectedPlan.id}`);
    console.log(`   Preço: R$ ${(selectedPlan.price_cents / 100).toFixed(2)}`);
    console.log(`   Leads: ${selectedPlan.leads_included}`);

    // 4. Criar assinatura manualmente
    console.log('\n4️⃣ Criando assinatura manualmente...');
    
    const userId = '8a8e49f2-b584-4516-aeea-f342e75686f9';
    const now = new Date();
    const nextChargeDate = webhook.raw_data.subscription ? 
      new Date(webhook.raw_data.subscription.next_charge_date) : 
      new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 dias se não houver subscription
    
    const subscriptionData = {
      user_id: userId,
      plan_id: selectedPlan.id,
      status: 'active',
      leads_balance: selectedPlan.leads_included,
      leads_bonus: 0,
      first_payment_date: webhook.raw_data.date_approved,
      current_period_start: webhook.raw_data.date_approved,
      current_period_end: nextChargeDate.toISOString(),
      is_refund_eligible: true,
      refund_deadline: nextChargeDate.toISOString(),
      perfect_pay_transaction_id: webhook.raw_data.code,
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

    // 5. Atualizar webhook para remover erro
    console.log('\n5️⃣ Atualizando webhook para remover erro...');
    const { error: updateError } = await supabase
      .from('payment_webhooks')
      .update({
        subscription_id: newSubscription.id,
        transaction_id: webhook.raw_data.code,
        error_message: null
      })
      .eq('id', webhook.id);

    if (updateError) {
      console.error('❌ Erro ao atualizar webhook:', updateError.message);
    } else {
      console.log('✅ Webhook atualizado com sucesso!');
    }

    console.log('\n🎉 PROBLEMA RESOLVIDO!');
    console.log('💡 A assinatura do usuário foi criada e o webhook foi corrigido.');

  } catch (err) {
    console.error('❌ Erro inesperado:', err.message);
  }
}

fixWebhookPlanMapping();

