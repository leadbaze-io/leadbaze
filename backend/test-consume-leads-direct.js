const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lsvwjyhnnzeewuuuykmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'
);

const TEST_USER_ID = '39dc6c62-6dea-4222-adb5-7075fd704189';

async function testConsumeLeadsDirect() {
  console.log('🚀 ===== TESTE: CONSUMO DIRETO DE LEADS =====\n');

  try {
    // 1. Verificar estado atual
    console.log('1️⃣ Verificando estado atual...');
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

    console.log('✅ Estado atual:');
    console.log(`   Status: ${subscription.status}`);
    console.log(`   Plano: ${subscription.payment_plans.display_name}`);
    console.log(`   Leads disponíveis: ${subscription.leads_balance}`);
    console.log(`   Leads do plano: ${subscription.payment_plans.leads_included}`);

    const leadsToConsume = 10; // Consumir 10 leads para teste
    console.log(`\n2️⃣ Consumindo ${leadsToConsume} leads...`);

    // 2. Consumir leads diretamente
    const { data: updateResult, error: updateError } = await supabase
      .from('user_payment_subscriptions')
      .update({
        leads_balance: subscription.leads_balance - leadsToConsume,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erro ao atualizar leads:', updateError);
      return;
    }

    console.log('✅ Leads consumidos com sucesso!');
    console.log(`   Leads consumidos: ${leadsToConsume}`);
    console.log(`   Novo saldo: ${updateResult.leads_balance}`);
    console.log(`   Diferença: ${subscription.leads_balance - updateResult.leads_balance} leads`);

    // 3. Verificar estado após consumo
    console.log('\n3️⃣ Verificando estado após consumo...');
    const { data: subscriptionAfter, error: subAfterError } = await supabase
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

    if (subAfterError) {
      console.error('❌ Erro ao buscar assinatura após consumo:', subAfterError);
      return;
    }

    console.log('✅ Estado após consumo:');
    console.log(`   Leads disponíveis: ${subscriptionAfter.leads_balance}`);
    console.log(`   Diferença total: ${subscription.leads_balance - subscriptionAfter.leads_balance} leads consumidos`);

    // 4. Testar API para verificar se está retornando dados corretos
    console.log('\n4️⃣ Testando API...');
    const apiResponse = await fetch(`http://localhost:3001/api/perfect-pay/subscription/${TEST_USER_ID}`);
    const apiData = await apiResponse.json();

    if (apiData.success && apiData.data) {
      console.log('✅ API retornando dados corretos:');
      console.log(`   Leads restantes: ${apiData.data.leads_remaining}`);
      console.log(`   Leads utilizados: ${apiData.data.leads_used}`);
      console.log(`   Status: ${apiData.data.status}`);
    } else {
      console.log('❌ API não retornou dados corretos');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testConsumeLeadsDirect();

