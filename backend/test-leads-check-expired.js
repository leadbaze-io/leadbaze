const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lsvwjyhnnzeewuuuykmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'
);

const TEST_USER_ID = '39dc6c62-6dea-4222-adb5-7075fd704189';

async function testLeadsCheckExpired() {
  console.log('🚀 ===== TESTE: VERIFICAÇÃO DE LEADS COM ACESSO EXPIRADO =====\n');

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

    // 2. Verificar se o acesso expirou
    const accessUntil = new Date(subscription.current_period_end);
    const now = new Date();
    const isAccessExpired = now > accessUntil;
    
    console.log('\n2️⃣ Verificando expiração:');
    console.log(`   Data atual: ${now.toISOString()}`);
    console.log(`   Acesso até: ${accessUntil.toISOString()}`);
    console.log(`   Acesso expirado: ${isAccessExpired ? 'SIM' : 'NÃO'}`);

    // 3. Testar verificação de leads via API
    console.log('\n3️⃣ Testando verificação de leads...');
    
    // Simular a lógica do LeadsControlService
    if (isAccessExpired) {
      console.log('⚠️ Acesso expirado - verificando apenas leads bônus');
      
      // Verificar leads bônus
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('bonus_leads, bonus_leads_used')
        .eq('user_id', TEST_USER_ID)
        .single();

      if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError);
        return;
      }

      const bonusLeadsRemaining = (profile.bonus_leads || 0) - (profile.bonus_leads_used || 0);
      
      console.log('✅ Leads bônus:');
      console.log(`   Total bônus: ${profile.bonus_leads || 0}`);
      console.log(`   Usados: ${profile.bonus_leads_used || 0}`);
      console.log(`   Restantes: ${bonusLeadsRemaining}`);
      
      if (bonusLeadsRemaining > 0) {
        console.log('✅ Usuário pode gerar leads usando leads bônus');
      } else {
        console.log('❌ Usuário não pode gerar leads - sem leads bônus');
      }
    } else {
      console.log('✅ Acesso ativo - pode usar leads da assinatura');
      console.log(`   Leads disponíveis: ${subscription.leads_balance}`);
    }

    // 4. Testar consumo de leads
    console.log('\n4️⃣ Testando consumo de leads...');
    
    if (isAccessExpired) {
      console.log('⚠️ Acesso expirado - não é possível consumir leads da assinatura');
      console.log('✅ Apenas leads bônus podem ser consumidos');
    } else {
      console.log('✅ Acesso ativo - pode consumir leads da assinatura');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testLeadsCheckExpired();
