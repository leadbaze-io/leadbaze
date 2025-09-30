const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lsvwjyhnnzeewuuuykmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'
);

async function checkLeadsUsage() {
  console.log('🔍 ===== VERIFICANDO USO DE LEADS =====\n');

  try {
    const userId = '39dc6c62-6dea-4222-adb5-7075fd704189';

    // 1. Verificar assinatura atual
    console.log('1️⃣ Verificando assinatura atual...');
    const { data: subscription, error: subError } = await supabase
      .from('user_payment_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (subError) {
      console.error('❌ Erro ao buscar assinatura:', subError);
      return;
    }

    if (subscription) {
      console.log('✅ Assinatura encontrada:');
      console.log('   ID:', subscription.id);
      console.log('   Leads Balance:', subscription.leads_balance);
      console.log('   Leads Bonus:', subscription.leads_bonus);
      console.log('   Criado em:', subscription.created_at);
      console.log('   Atualizado em:', subscription.updated_at);
    }

    // 2. Verificar se há tabela de histórico de leads
    console.log('\n2️⃣ Verificando tabelas relacionadas a leads...');
    
    // Tentar buscar de diferentes tabelas possíveis
    const tablesToCheck = [
      'leads_usage_history',
      'user_leads_usage', 
      'leads_consumption',
      'user_leads_consumption',
      'leads_transactions'
    ];

    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('user_id', userId)
          .limit(5);

        if (!error && data) {
          console.log(`✅ Tabela ${tableName} encontrada:`, data.length, 'registros');
          if (data.length > 0) {
            console.log('   Primeiro registro:', data[0]);
          }
        }
      } catch (e) {
        // Tabela não existe, continuar
      }
    }

    // 3. Calcular leads utilizados baseado no saldo
    console.log('\n3️⃣ Calculando leads utilizados...');
    const { data: plan, error: planError } = await supabase
      .from('payment_plans')
      .select('leads_included')
      .eq('id', subscription.plan_id)
      .single();

    if (plan) {
      const leadsIncluded = plan.leads_included;
      const leadsRemaining = subscription.leads_balance;
      const leadsUsed = leadsIncluded - leadsRemaining;
      
      console.log('✅ Cálculo de leads:');
      console.log('   Leads incluídos:', leadsIncluded);
      console.log('   Leads restantes:', leadsRemaining);
      console.log('   Leads utilizados:', leadsUsed);
      console.log('   Porcentagem:', ((leadsUsed / leadsIncluded) * 100).toFixed(1) + '%');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkLeadsUsage();








