const { createClient } = require('@supabase/supabase-js');

// Usar a mesma URL que o servidor está usando
const SUPABASE_URL = 'https://lsvwjyhnnzeewuuuykmb.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk';

console.log('🔍 ===== TESTE COM URL DO SERVIDOR =====\n');

console.log('📋 URL do servidor:');
console.log('   SUPABASE_URL:', SUPABASE_URL);
console.log('   SUPABASE_KEY length:', SUPABASE_SERVICE_ROLE_KEY.length);
console.log('');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testWithServerUrl() {
  try {
    console.log('1️⃣ Testando conexão com URL do servidor...');
    
    const { data: plans, error } = await supabase
      .from('payment_plans')
      .select('id, name, display_name, price_cents, leads_included')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Erro:', error.message);
      return;
    }

    console.log(`✅ ${plans.length} planos encontrados:`);
    plans.forEach((plan, index) => {
      console.log(`   ${index + 1}. ${plan.name} (${plan.id})`);
      console.log(`      Display: ${plan.display_name}`);
      console.log(`      Preço: R$ ${plan.price_cents / 100}`);
      console.log(`      Leads: ${plan.leads_included}`);
      console.log('');
    });

    // 2. Buscar especificamente o plano que está falhando
    console.log('2️⃣ Buscando plano específico que está falhando...');
    const failingPlanId = '460a8b88-f828-4b18-9d42-4b8ad5333d61';
    
    const { data: specificPlan, error: specificError } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('id', failingPlanId)
      .single();

    if (specificError) {
      console.log('❌ Plano específico não encontrado:', specificError.message);
      console.log('   Vamos usar o primeiro plano Start disponível...');
      
      const { data: startPlan, error: startError } = await supabase
        .from('payment_plans')
        .select('*')
        .eq('name', 'start')
        .single();

      if (startError) {
        console.log('❌ Plano Start não encontrado:', startError.message);
      } else {
        console.log('✅ Plano Start encontrado:');
        console.log(`   ID: ${startPlan.id}`);
        console.log(`   Nome: ${startPlan.name}`);
        console.log(`   Display Name: ${startPlan.display_name}`);
        console.log(`   Preço: R$ ${startPlan.price_cents / 100}`);
        console.log(`   Leads: ${startPlan.leads_included}`);
      }
    } else {
      console.log('✅ Plano específico encontrado:');
      console.log(`   ID: ${specificPlan.id}`);
      console.log(`   Nome: ${specificPlan.name}`);
      console.log(`   Display Name: ${specificPlan.display_name}`);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testWithServerUrl().catch(console.error);











