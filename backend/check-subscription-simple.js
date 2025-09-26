const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lsvwjyhnnzeewuuuykmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'
);

async function checkSubscriptionData() {
  console.log('🔍 ===== VERIFICANDO DADOS DA ASSINATURA =====\n');

  try {
    // 1. Verificar assinatura do usuário
    console.log('1️⃣ Verificando assinatura do usuário...');
    const { data: subscription, error: subError } = await supabase
      .from('user_payment_subscriptions')
      .select('*')
      .eq('user_id', '39dc6c62-6dea-4222-adb5-7075fd704189')
      .order('created_at', { ascending: false })
      .limit(1);

    if (subError) {
      console.error('❌ Erro ao buscar assinatura:', subError);
      return;
    }

    if (subscription && subscription.length > 0) {
      console.log('✅ Assinatura encontrada:');
      console.log('   ID:', subscription[0].id);
      console.log('   Status:', subscription[0].status);
      console.log('   Plano ID:', subscription[0].plan_id);
      console.log('   Leads Balance:', subscription[0].leads_balance);
      console.log('   Leads Bonus:', subscription[0].leads_bonus);
      console.log('   Período Start:', subscription[0].current_period_start);
      console.log('   Período End:', subscription[0].current_period_end);
      console.log('   Próxima Cobrança:', subscription[0].next_billing_date);
      console.log('   Criado em:', subscription[0].created_at);
    } else {
      console.log('❌ Nenhuma assinatura encontrada!');
      return;
    }

    // 2. Verificar dados do plano
    console.log('\n2️⃣ Verificando dados do plano...');
    const { data: plan, error: planError } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('id', subscription[0].plan_id);

    if (planError) {
      console.error('❌ Erro ao buscar plano:', planError);
      return;
    }

    if (plan && plan.length > 0) {
      console.log('✅ Plano encontrado:');
      console.log('   ID:', plan[0].id);
      console.log('   Nome:', plan[0].name);
      console.log('   Display Name:', plan[0].display_name);
      console.log('   Preço (Reais):', plan[0].price_reais);
      console.log('   Leads Incluídos:', plan[0].leads_included);
      console.log('   Ativo:', plan[0].is_active);
    } else {
      console.log('❌ Plano não encontrado!');
    }

    // 3. Verificar dados do usuário
    console.log('\n3️⃣ Verificando dados do usuário...');
    const { data: user, error: userError } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('id', '39dc6c62-6dea-4222-adb5-7075fd704189');

    if (userError) {
      console.error('❌ Erro ao buscar usuário:', userError);
      return;
    }

    if (user && user.length > 0) {
      console.log('✅ Usuário encontrado:');
      console.log('   ID:', user[0].id);
      console.log('   Email:', user[0].email);
    } else {
      console.log('❌ Usuário não encontrado!');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkSubscriptionData();




