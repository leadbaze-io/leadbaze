const { createClient } = require('@supabase/supabase-js');

// Usar credenciais hardcoded (as mesmas do PerfectPayService)
const supabase = createClient(
  'https://lsvwjyhnnzeewuuuykmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'
);

async function testHardcodedCredentials() {
  console.log('🔍 ===== TESTE: CREDENCIAIS HARDCODED =====\n');

  try {
    // 1. Listar todos os planos
    console.log('1️⃣ Listando todos os planos...');
    const { data: allPlans, error: allError } = await supabase
      .from('payment_plans')
      .select('*');
      
    if (allError) {
      console.log('❌ Erro ao listar planos:', allError.message);
      return;
    }

    console.log(`✅ ${allPlans.length} planos encontrados:`);
    allPlans.forEach((plan, index) => {
      console.log(`   ${index + 1}. ${plan.name} (${plan.id})`);
      console.log(`      Display: ${plan.display_name}`);
      console.log(`      Preço: R$ ${plan.price_cents / 100}`);
      console.log(`      Leads: ${plan.leads_included}`);
      console.log('');
    });

    // 2. Buscar plano específico
    console.log('2️⃣ Buscando plano específico...');
    const planId = '460a8b88-f828-4b18-9d42-4b8ad5333d61';
    const { data: specificPlan, error: specificError } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('id', planId)
      .single();
      
    if (specificError) {
      console.log('❌ Erro ao buscar plano específico:', specificError.message);
    } else {
      console.log('✅ Plano específico encontrado:', specificPlan.name);
      console.log('   ID:', specificPlan.id);
      console.log('   Nome:', specificPlan.name);
      console.log('   Display:', specificPlan.display_name);
      console.log('   Preço:', specificPlan.price_cents / 100);
      console.log('   Leads:', specificPlan.leads_included);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testHardcodedCredentials().catch(console.error);

