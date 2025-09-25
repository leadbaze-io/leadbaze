const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lsvwjyhnnzeewuuuykmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'
);

const TEST_USER_ID = '39dc6c62-6dea-4222-adb5-7075fd704189';

async function testLeadsAvailability() {
  console.log('🚀 ===== TESTE: VERIFICAÇÃO DE DISPONIBILIDADE DE LEADS =====\n');

  try {
    // 1. Verificar assinatura atual
    console.log('1️⃣ Verificando assinatura atual...');
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

    if (subError) {
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
    console.log(`   Leads disponíveis: ${subscription.leads_balance}`);
    console.log(`   Leads do plano: ${subscription.payment_plans.leads_included}`);

    // 2. Testar função RPC
    console.log('\n2️⃣ Testando função RPC check_leads_availability_simple...');
    const { data: rpcResult, error: rpcError } = await supabase.rpc('check_leads_availability_simple', {
      p_user_id: TEST_USER_ID,
      p_leads_to_generate: 1
    });

    if (rpcError) {
      console.error('❌ Erro na função RPC:', rpcError);
    } else {
      console.log('✅ Resultado da função RPC:');
      console.log(JSON.stringify(rpcResult, null, 2));
    }

    // 3. Verificar se a função RPC existe
    console.log('\n3️⃣ Verificando se a função RPC existe...');
    const { data: functions, error: funcError } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'check_leads_availability_simple');

    if (funcError) {
      console.log('ℹ️ Não foi possível verificar funções (normal para usuário não-admin)');
    } else {
      console.log('✅ Funções encontradas:', functions);
    }

    // 4. Testar com diferentes quantidades
    console.log('\n4️⃣ Testando com diferentes quantidades...');
    for (const quantity of [1, 10, 100, 1000]) {
      const { data: testResult, error: testError } = await supabase.rpc('check_leads_availability_simple', {
        p_user_id: TEST_USER_ID,
        p_leads_to_generate: quantity
      });

      if (testError) {
        console.log(`❌ Quantidade ${quantity}: Erro - ${testError.message}`);
      } else {
        console.log(`✅ Quantidade ${quantity}:`, {
          can_generate: testResult.can_generate,
          reason: testResult.reason,
          leads_remaining: testResult.leads_remaining
        });
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testLeadsAvailability();
