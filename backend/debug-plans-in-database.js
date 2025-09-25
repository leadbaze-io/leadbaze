const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugPlansInDatabase() {
  console.log('🔍 ===== DEBUG: PLANOS NO BANCO =====\n');

  try {
    // 1. Listar todos os planos
    console.log('1️⃣ Listando todos os planos...');
    const { data: allPlans, error: allError } = await supabase
      .from('payment_plans')
      .select('*')
      .order('created_at', { ascending: true });

    if (allError) {
      console.error('❌ Erro ao buscar planos:', allError);
      return;
    }

    console.log(`✅ Total de planos encontrados: ${allPlans.length}\n`);

    allPlans.forEach((plan, index) => {
      console.log(`📋 Plano ${index + 1}:`);
      console.log(`   ID: ${plan.id}`);
      console.log(`   Nome: ${plan.name}`);
      console.log(`   Display Name: ${plan.display_name}`);
      console.log(`   Preço: R$ ${plan.price_cents / 100}`);
      console.log(`   Leads: ${plan.leads_included}`);
      console.log(`   Criado em: ${plan.created_at}`);
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
    } else {
      console.log('✅ Plano específico encontrado:');
      console.log(`   ID: ${specificPlan.id}`);
      console.log(`   Nome: ${specificPlan.name}`);
      console.log(`   Display Name: ${specificPlan.display_name}`);
    }

    // 3. Verificar se existe plano Start
    console.log('\n3️⃣ Verificando plano Start...');
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

    // 4. Verificar se existe plano com ID numérico
    console.log('\n4️⃣ Verificando plano com ID numérico...');
    const { data: numericPlan, error: numericError } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('id', '1')
      .single();

    if (numericError) {
      console.log('❌ Plano com ID numérico não encontrado:', numericError.message);
    } else {
      console.log('✅ Plano com ID numérico encontrado:');
      console.log(`   ID: ${numericPlan.id}`);
      console.log(`   Nome: ${numericPlan.name}`);
      console.log(`   Display Name: ${numericPlan.display_name}`);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar debug
debugPlansInDatabase().catch(console.error);


