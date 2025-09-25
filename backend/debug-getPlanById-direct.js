const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugGetPlanById() {
  console.log('🔍 ===== DEBUG: getPlanById DIRETO =====\n');

  const planId = '460a8b88-f828-4b18-9d42-4b8ad5333d61';
  
  console.log('📋 Testando busca direta do plano:', planId);
  
  try {
    // 1. Buscar plano por UUID
    console.log('1️⃣ Buscando por UUID...');
    const { data: planByUuid, error: uuidError } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('id', planId)
      .single();
      
    if (uuidError) {
      console.log('❌ Erro UUID:', uuidError.message);
    } else {
      console.log('✅ Plano encontrado por UUID:', planByUuid.name);
      console.log('   ID:', planByUuid.id);
      console.log('   Nome:', planByUuid.name);
      console.log('   Display:', planByUuid.display_name);
      console.log('   Preço:', planByUuid.price_cents / 100);
      console.log('   Leads:', planByUuid.leads_included);
      return;
    }

    // 2. Listar todos os planos
    console.log('\n2️⃣ Listando todos os planos...');
    const { data: allPlans, error: allError } = await supabase
      .from('payment_plans')
      .select('*');
      
    if (allError) {
      console.log('❌ Erro ao listar planos:', allError.message);
    } else {
      console.log(`✅ ${allPlans.length} planos encontrados:`);
      allPlans.forEach((plan, index) => {
        console.log(`   ${index + 1}. ${plan.name} (${plan.id})`);
        console.log(`      Display: ${plan.display_name}`);
        console.log(`      Preço: R$ ${plan.price_cents / 100}`);
        console.log(`      Leads: ${plan.leads_included}`);
        console.log('');
      });
    }

    // 3. Buscar por nome
    console.log('3️⃣ Buscando por nome "start"...');
    const { data: planByName, error: nameError } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('name', 'start')
      .single();
      
    if (nameError) {
      console.log('❌ Erro ao buscar por nome:', nameError.message);
    } else {
      console.log('✅ Plano encontrado por nome:', planByName.name);
      console.log('   ID:', planByName.id);
      console.log('   Nome:', planByName.name);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

debugGetPlanById().catch(console.error);

