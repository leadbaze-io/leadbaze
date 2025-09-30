const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lsvwjyhnnzeewuuuykmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'
);

const TEST_USER_ID = '39dc6c62-6dea-4222-adb5-7075fd704189';

async function testConnection() {
  console.log('🚀 ===== TESTE: CONEXÃO SIMPLES =====\n');

  try {
    // 1. Testar conexão básica
    console.log('1️⃣ Testando conexão básica...');
    const { data: plans, error: plansError } = await supabase
      .from('payment_plans')
      .select('*')
      .limit(1);

    if (plansError) {
      console.error('❌ Erro ao conectar:', plansError);
      return;
    }

    console.log('✅ Conexão funcionando!');
    console.log('✅ Planos encontrados:', plans.length);

    // 2. Buscar assinatura atual
    console.log('\n2️⃣ Buscando assinatura atual...');
    const { data: subscription, error: subError } = await supabase
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

    if (subError && subError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar assinatura:', subError);
      return;
    }

    if (!subscription) {
      console.log('❌ Nenhuma assinatura encontrada');
      return;
    }

    console.log('✅ Assinatura encontrada:');
    console.log(`   Status: ${subscription.status}`);
    console.log(`   Plano: ${subscription.payment_plans.display_name}`);
    console.log(`   Leads: ${subscription.leads_balance}`);

    // 3. Criar nova assinatura Scale diretamente
    console.log('\n3️⃣ Criando nova assinatura Scale...');
    
    // Buscar plano Scale
    const { data: scalePlan, error: scaleError } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('name', 'scale')
      .single();

    if (scaleError) {
      console.error('❌ Erro ao buscar plano Scale:', scaleError);
      return;
    }

    console.log('✅ Plano Scale encontrado:', scalePlan.display_name);

    // Criar nova assinatura
    const { data: newSubscription, error: newError } = await supabase
      .from('user_payment_subscriptions')
      .insert({
        user_id: TEST_USER_ID,
        plan_id: scalePlan.id,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        leads_balance: scalePlan.leads_included // Começar com leads do plano Scale
      })
      .select()
      .single();

    if (newError) {
      console.error('❌ Erro ao criar nova assinatura:', newError);
      return;
    }

    console.log('✅ Nova assinatura Scale criada!');
    console.log(`   ID: ${newSubscription.id}`);
    console.log(`   Plano: ${scalePlan.display_name}`);
    console.log(`   Leads: ${newSubscription.leads_balance}`);
    console.log(`   Status: ${newSubscription.status}`);

    // 4. Verificar todas as assinaturas
    console.log('\n4️⃣ Verificando todas as assinaturas...');
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
      console.error('❌ Erro ao buscar todas as assinaturas:', allError);
      return;
    }

    console.log(`✅ Total de assinaturas: ${allSubscriptions.length}`);
    allSubscriptions.forEach((sub, index) => {
      console.log(`   ${index + 1}. ${sub.payment_plans.display_name} - ${sub.status} - ${sub.leads_balance} leads - ${sub.created_at}`);
    });

    // 5. Testar API
    console.log('\n5️⃣ Testando API...');
    const apiResponse = await fetch(`http://localhost:3001/api/perfect-pay/subscription/${TEST_USER_ID}`);
    const apiData = await apiResponse.json();

    if (apiData.success && apiData.data) {
      console.log('✅ API retornando dados da nova assinatura:');
      console.log(`   Status: ${apiData.data.status}`);
      console.log(`   Plano: ${apiData.data.plan_display_name}`);
      console.log(`   Leads restantes: ${apiData.data.leads_remaining}`);
      console.log(`   Leads do plano: ${apiData.data.leads_limit}`);
      console.log(`   Próxima cobrança: ${apiData.data.current_period_end}`);
    } else {
      console.log('❌ API não retornou dados corretos');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testConnection();