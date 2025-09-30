const { createClient } = require('@supabase/supabase-js');

// Configurar Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://lsvwjyhnnzeewuuuykmb.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rd21namxndmRtcmpxZ3p3c3F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5NjUyMzIsImV4cCI6MjA0NzU0MTIzMn0.UNtOHtpLGJqOFKVJ4-Zt6P6HGzHy5y1Kfm0yb8KxSAY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugGetPlanById() {
  console.log('🔍 ===== DEBUG: getPlanById =====');
  
  // Simular a função getPlanById do serviço
  const getPlanById = async (planId) => {
    console.log(`\n🔍 Buscando plano com ID: "${planId}"`);
    
    // Se planId é numérico (1, 2, 3), mapear para nome
    const planNameMap = {
      '1': 'start',
      '2': 'scale', 
      '3': 'enterprise'
    };

    const planName = planNameMap[planId] || planId;
    console.log(`📝 Mapeamento: "${planId}" -> "${planName}"`);
    
    const { data: plan, error } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('name', planName)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar plano:', error);
      console.error('   Código:', error.code);
      console.error('   Mensagem:', error.message);
      console.error('   Detalhes:', error.details);
      return null;
    }

    console.log('✅ Plano encontrado:', plan);
    return plan;
  };

  // Testar diferentes inputs
  console.log('\n1️⃣ Testando getPlanById("1")...');
  const plan1 = await getPlanById('1');
  
  console.log('\n2️⃣ Testando getPlanById("start")...');
  const planStart = await getPlanById('start');
  
  console.log('\n3️⃣ Testando getPlanById("scale")...');
  const planScale = await getPlanById('scale');
  
  console.log('\n4️⃣ Testando getPlanById("enterprise")...');
  const planEnterprise = await getPlanById('enterprise');

  // Verificar se todos os planos existem
  console.log('\n📋 RESUMO:');
  console.log(`   Plano 1 (start): ${plan1 ? '✅' : '❌'}`);
  console.log(`   Plano start: ${planStart ? '✅' : '❌'}`);
  console.log(`   Plano scale: ${planScale ? '✅' : '❌'}`);
  console.log(`   Plano enterprise: ${planEnterprise ? '✅' : '❌'}`);

  // Testar busca direta no Supabase
  console.log('\n5️⃣ Testando busca direta no Supabase...');
  const { data: allPlans, error: allError } = await supabase
    .from('payment_plans')
    .select('*');

  if (allError) {
    console.error('❌ Erro ao buscar todos os planos:', allError);
  } else {
    console.log('✅ Todos os planos encontrados:');
    allPlans.forEach((plan, index) => {
      console.log(`   ${index + 1}. ID: ${plan.id} | Nome: "${plan.name}" | Display: "${plan.display_name}"`);
    });
  }
}

debugGetPlanById();
