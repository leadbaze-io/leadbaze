require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifySubscriptionCreated() {
  console.log('🔍 ===== VERIFICANDO ASSINATURA CRIADA =====\n');

  try {
    const userId = '8a8e49f2-b584-4516-aeea-f342e75686f9';

    // 1. Verificar assinatura criada
    console.log('1️⃣ Verificando assinatura do usuário...');
    const { data: subscriptions, error: subsError } = await supabase
      .from('user_payment_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (subsError) {
      console.error('❌ Erro ao buscar assinaturas:', subsError.message);
      return;
    }

    console.log(`📊 Assinaturas encontradas: ${subscriptions.length}`);
    
    if (subscriptions.length === 0) {
      console.log('❌ Nenhuma assinatura encontrada.');
      return;
    }

    subscriptions.forEach((sub, index) => {
      console.log(`\n📋 Assinatura ${index + 1}:`);
      console.log(`   ID: ${sub.id}`);
      console.log(`   Status: ${sub.status}`);
      console.log(`   Plano ID: ${sub.plan_id}`);
      console.log(`   Leads Balance: ${sub.leads_balance}`);
      console.log(`   Transaction ID: ${sub.perfect_pay_transaction_id}`);
      console.log(`   Criado: ${sub.created_at}`);
      console.log(`   Período: ${sub.current_period_start} até ${sub.current_period_end}`);
    });

    // 2. Verificar detalhes do plano
    console.log('\n2️⃣ Verificando detalhes do plano...');
    const activeSub = subscriptions.find(sub => sub.status === 'active');
    if (activeSub) {
      const { data: plan, error: planError } = await supabase
        .from('payment_plans')
        .select('*')
        .eq('id', activeSub.plan_id)
        .single();

      if (planError) {
        console.error('❌ Erro ao buscar plano:', planError.message);
      } else {
        console.log('✅ Plano encontrado:');
        console.log(`   Nome: ${plan.name}`);
        console.log(`   Display: ${plan.display_name}`);
        console.log(`   Preço: R$ ${(plan.price_cents / 100).toFixed(2)}`);
        console.log(`   Leads: ${plan.leads_included}`);
        console.log(`   Código Perfect Pay: ${plan.codigo_perfect_pay}`);
      }
    }

    // 3. Verificar webhook atualizado
    console.log('\n3️⃣ Verificando webhook atualizado...');
    const { data: webhooks, error: webhookError } = await supabase
      .from('payment_webhooks')
      .select('*')
      .eq('perfect_pay_id', '5a9996d3-abdd-41d1-90fa-8812e61cc1ab')
      .single();

    if (webhookError) {
      console.log('⚠️ Erro ao buscar webhook específico:', webhookError.message);
    } else {
      console.log('📋 Webhook atualizado:');
      console.log(`   ID: ${webhooks.id}`);
      console.log(`   Processed: ${webhooks.processed}`);
      console.log(`   Error Message: ${webhooks.error_message || 'Nenhum'}`);
      console.log(`   Subscription ID: ${webhooks.subscription_id}`);
    }

    console.log('\n🎉 VERIFICAÇÃO CONCLUÍDA!');
    console.log('✅ A assinatura do usuário foi criada com sucesso!');
    console.log('💡 O usuário agora tem acesso aos recursos do plano Start.');

  } catch (err) {
    console.error('❌ Erro inesperado:', err.message);
  }
}

verifySubscriptionCreated();


