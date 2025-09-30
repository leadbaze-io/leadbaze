const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://lsvwjyhnnzeewuuuykmb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addTestSubscription() {
  const userId = '66875e05-eace-49ac-bf07-0e794dbab8fd';
  
  console.log('🎯 ===== ADICIONANDO ASSINATURA DE TESTE =====');
  console.log(`👤 Usuário ID: ${userId}\n`);
  
  try {
    // 1. Verificar se o usuário existe
    console.log('1️⃣ Verificando se o usuário existe...');
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError) {
      console.log('❌ Erro ao buscar usuário:', userError.message);
      return;
    }

    if (!user.user) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    console.log('✅ Usuário encontrado:', user.user.email);

    // 2. Verificar planos disponíveis
    console.log('\n2️⃣ Verificando planos disponíveis...');
    const { data: plans, error: plansError } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_cents', { ascending: true });

    if (plansError) {
      console.log('❌ Erro ao buscar planos:', plansError.message);
      return;
    }

    console.log(`📊 Planos encontrados: ${plans.length}`);
    plans.forEach((plan, index) => {
      const priceInReais = (plan.price_cents / 100).toFixed(2);
      console.log(`   ${index + 1}. ${plan.display_name} - R$ ${priceInReais}/mês - ${plan.leads_included} leads`);
    });

    // 3. Escolher o plano START (primeiro da lista)
    const selectedPlan = plans[0];
    if (!selectedPlan) {
      console.log('❌ Nenhum plano encontrado');
      return;
    }

    console.log(`\n🎯 Plano selecionado: ${selectedPlan.display_name}`);

    // 4. Verificar se já existe assinatura ativa
    console.log('\n3️⃣ Verificando assinaturas existentes...');
    const { data: existingSubs, error: existingError } = await supabase
      .from('user_payment_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (existingError) {
      console.log('❌ Erro ao verificar assinaturas existentes:', existingError.message);
      return;
    }

    if (existingSubs && existingSubs.length > 0) {
      console.log(`⚠️ Usuário já possui ${existingSubs.length} assinatura(s) ativa(s):`);
      existingSubs.forEach(sub => {
        console.log(`   - ${sub.plan_display_name} (${sub.status})`);
      });
      console.log('\n💡 Continuando mesmo assim para criar uma nova assinatura...');
    }

    // 5. Criar assinatura de teste
    console.log('\n4️⃣ Criando assinatura de teste...');
    
    const now = new Date();
    const nextMonth = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 dias

    const subscriptionData = {
      user_id: userId,
      plan_id: selectedPlan.id,
      status: 'active',
      leads_balance: selectedPlan.leads_included,
      leads_bonus: 0,
      first_payment_date: now.toISOString(),
      current_period_start: now.toISOString(),
      current_period_end: nextMonth.toISOString(),
      is_refund_eligible: true,
      refund_deadline: nextMonth.toISOString(),
      perfect_pay_transaction_id: `TEST_${Date.now()}`,
      perfect_pay_cancelled: false,
      requires_manual_cancellation: false,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };

    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_payment_subscriptions')
      .insert(subscriptionData)
      .select()
      .single();

    if (subscriptionError) {
      console.log('❌ Erro ao criar assinatura:', subscriptionError.message);
      return;
    }

    console.log('✅ Assinatura criada com sucesso!');
    console.log(`   ID: ${subscription.id}`);
    console.log(`   Plano: ${selectedPlan.display_name}`);
    console.log(`   Status: ${subscription.status}`);
    console.log(`   Leads: ${subscription.leads_balance}`);
    console.log(`   Período: ${subscription.current_period_start} até ${subscription.current_period_end}`);

    // 6. Verificar resultado final
    console.log('\n5️⃣ Verificando assinatura criada...');
    const { data: finalCheck, error: checkError } = await supabase
      .from('user_payment_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (checkError) {
      console.log('❌ Erro ao verificar assinatura:', checkError.message);
      return;
    }

    console.log(`📊 Assinaturas ativas encontradas: ${finalCheck.length}`);
    finalCheck.forEach((sub, index) => {
      console.log(`   ${index + 1}. Plano ID: ${sub.plan_id} - ${sub.leads_balance} leads restantes`);
    });

    console.log('\n🎉 ASSINATURA DE TESTE CRIADA COM SUCESSO!');
    console.log('💡 Agora você pode testar a funcionalidade no Dashboard e UserProfile');

  } catch (err) {
    console.error('❌ Erro inesperado:', err.message);
  }
}

addTestSubscription();
