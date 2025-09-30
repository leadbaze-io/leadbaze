const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lsvwjyhnnzeewuuuykmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'
);

async function upgradeToScale() {
  console.log('🚀 ===== UPGRADE PARA PLANO SCALE =====\n');

  try {
    const userId = '39dc6c62-6dea-4222-adb5-7075fd704189';
    const currentPlanId = '460a8b88-f828-4b18-9d42-4b8ad5333d61'; // Start
    const newPlanId = 'e9004fad-85ab-41b8-9416-477e41e8bcc9'; // Scale

    // 1. Verificar assinatura atual
    console.log('1️⃣ Verificando assinatura atual...');
    const { data: currentSubscription, error: subError } = await supabase
      .from('user_payment_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (subError) {
      console.error('❌ Erro ao buscar assinatura:', subError);
      return;
    }

    console.log('✅ Assinatura atual:');
    console.log('   ID:', currentSubscription.id);
    console.log('   Plano atual:', currentSubscription.plan_id);
    console.log('   Leads restantes:', currentSubscription.leads_balance);
    console.log('   Status:', currentSubscription.status);

    // 2. Verificar plano Scale
    console.log('\n2️⃣ Verificando plano Scale...');
    const { data: scalePlan, error: planError } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('id', newPlanId)
      .single();

    if (planError) {
      console.error('❌ Erro ao buscar plano Scale:', planError);
      return;
    }

    console.log('✅ Plano Scale:');
    console.log('   ID:', scalePlan.id);
    console.log('   Nome:', scalePlan.name);
    console.log('   Display Name:', scalePlan.display_name);
    console.log('   Preço:', scalePlan.price_cents / 100);
    console.log('   Leads incluídos:', scalePlan.leads_included);

    // 3. Calcular novos leads (manter leads anteriores + adicionar diferença)
    const currentLeads = currentSubscription.leads_balance;
    const scaleLeads = scalePlan.leads_included;
    const leadsToAdd = scaleLeads - 1000; // Scale tem 4000, Start tem 1000, então adiciona 3000
    const newLeadsBalance = currentLeads + leadsToAdd;

    console.log('\n3️⃣ Calculando upgrade de leads:');
    console.log('   Leads atuais (Start):', currentLeads);
    console.log('   Leads do plano Scale:', scaleLeads);
    console.log('   Leads a adicionar:', leadsToAdd);
    console.log('   Novo saldo de leads:', newLeadsBalance);

    // 4. Fazer o upgrade
    console.log('\n4️⃣ Executando upgrade...');
    const { data: updatedSubscription, error: updateError } = await supabase
      .from('user_payment_subscriptions')
      .update({
        plan_id: newPlanId,
        leads_balance: newLeadsBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentSubscription.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erro ao fazer upgrade:', updateError);
      return;
    }

    console.log('✅ Upgrade realizado com sucesso!');
    console.log('   Nova assinatura:');
    console.log('   ID:', updatedSubscription.id);
    console.log('   Novo plano:', updatedSubscription.plan_id);
    console.log('   Novo saldo de leads:', updatedSubscription.leads_balance);
    console.log('   Atualizado em:', updatedSubscription.updated_at);

    // 5. Verificar resultado final
    console.log('\n5️⃣ Verificando resultado final...');
    const { data: finalSubscription, error: finalError } = await supabase
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
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (finalError) {
      console.error('❌ Erro ao verificar resultado final:', finalError);
      return;
    }

    console.log('🎉 UPGRADE CONCLUÍDO COM SUCESSO!');
    console.log('   Plano:', finalSubscription.payment_plans.display_name);
    console.log('   Preço:', `R$ ${finalSubscription.payment_plans.price_cents / 100}`);
    console.log('   Leads restantes:', finalSubscription.leads_balance);
    console.log('   Leads incluídos:', finalSubscription.payment_plans.leads_included);
    console.log('   Status:', finalSubscription.status);

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

upgradeToScale();











