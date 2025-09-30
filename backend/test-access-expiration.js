const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lsvwjyhnnzeewuuuykmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'
);

const TEST_USER_ID = '39dc6c62-6dea-4222-adb5-7075fd704189';

async function testAccessExpiration() {
  console.log('🚀 ===== TESTE: EXPIRAÇÃO DE ACESSO =====\n');

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
    console.log(`   Acesso até: ${subscription.current_period_end}`);
    console.log(`   Data atual: ${new Date().toISOString()}`);

    // 2. Simular expiração do acesso (definir current_period_end para ontem)
    console.log('\n2️⃣ Simulando expiração do acesso...');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: updateResult, error: updateError } = await supabase
      .from('user_payment_subscriptions')
      .update({
        current_period_end: yesterday.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erro ao atualizar assinatura:', updateError);
      return;
    }

    console.log('✅ Acesso expirado simulado!');
    console.log(`   Novo current_period_end: ${updateResult.current_period_end}`);

    // 3. Verificar estado após expiração
    console.log('\n3️⃣ Verificando estado após expiração...');
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
      console.error('❌ Erro ao buscar assinatura após expiração:', subAfterError);
      return;
    }

    console.log('✅ Estado após expiração:');
    console.log(`   Status: ${subscriptionAfter.status}`);
    console.log(`   Leads disponíveis: ${subscriptionAfter.leads_balance}`);
    console.log(`   Acesso até: ${subscriptionAfter.current_period_end}`);

    // 4. Testar API para verificar comportamento
    console.log('\n4️⃣ Testando API após expiração...');
    const apiResponse = await fetch(`http://localhost:3001/api/perfect-pay/subscription/${TEST_USER_ID}`);
    const apiData = await apiResponse.json();

    if (apiData.success && apiData.data) {
      console.log('✅ API retornando dados:');
      console.log(`   Status: ${apiData.data.status}`);
      console.log(`   Leads restantes: ${apiData.data.leads_remaining}`);
      console.log(`   Acesso até: ${apiData.data.access_until}`);
      console.log(`   É cancelada: ${apiData.data.is_cancelled}`);
      
      // Verificar se o acesso expirou
      const accessUntil = new Date(apiData.data.access_until);
      const now = new Date();
      const isExpired = now > accessUntil;
      
      console.log(`\n📊 Análise de expiração:`);
      console.log(`   Data atual: ${now.toISOString()}`);
      console.log(`   Acesso até: ${accessUntil.toISOString()}`);
      console.log(`   Acesso expirado: ${isExpired ? 'SIM' : 'NÃO'}`);
      
      if (isExpired) {
        console.log('\n🎯 COMPORTAMENTO ESPERADO:');
        console.log('   • Usuário deve voltar para conta gratuita');
        console.log('   • Leads da assinatura devem ser zerados');
        console.log('   • Apenas leads bônus devem estar disponíveis');
        console.log('   • Interface deve mostrar "Sem assinatura ativa"');
      }
    } else {
      console.log('❌ API não retornou dados corretos');
    }

    // 5. Verificar leads bônus do usuário
    console.log('\n5️⃣ Verificando leads bônus...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('bonus_leads, bonus_leads_used')
      .eq('user_id', TEST_USER_ID)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
    } else {
      const bonusLeadsRemaining = (profile.bonus_leads || 0) - (profile.bonus_leads_used || 0);
      console.log('✅ Leads bônus:');
      console.log(`   Total bônus: ${profile.bonus_leads || 0}`);
      console.log(`   Usados: ${profile.bonus_leads_used || 0}`);
      console.log(`   Restantes: ${bonusLeadsRemaining}`);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testAccessExpiration();









