const { createClient } = require('@supabase/supabase-js');

// Configurar Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://lsvwjyhnnzeewuuuykmb.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rd21namxndmRtcmpxZ3p3c3F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5NjUyMzIsImV4cCI6MjA0NzU0MTIzMn0.UNtOHtpLGJqOFKVJ4-Zt6P6HGzHy5y1Kfm0yb8KxSAY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugPlanSearch() {
  console.log('🔍 ===== DEBUG: BUSCA DE PLANOS =====');
  
  // 1. Verificar se conseguimos conectar no Supabase
  console.log('\n1️⃣ Testando conexão Supabase...');
  try {
    const { data, error } = await supabase.from('payment_plans').select('count');
    if (error) {
      console.error('❌ Erro na conexão:', error.message);
      return;
    }
    console.log('✅ Conexão OK');
  } catch (err) {
    console.error('❌ Erro de conexão:', err.message);
    return;
  }

  // 2. Listar TODOS os planos
  console.log('\n2️⃣ Listando TODOS os planos...');
  try {
    const { data: allPlans, error } = await supabase
      .from('payment_plans')
      .select('*')
      .order('created_at');

    if (error) {
      console.error('❌ Erro ao buscar planos:', error.message);
      return;
    }

    console.log(`📋 Encontrados ${allPlans.length} planos:`);
    allPlans.forEach((plan, index) => {
      console.log(`   ${index + 1}. ID: ${plan.id} | Nome: "${plan.name}" | Display: "${plan.display_name}" | Preço: R$ ${(plan.price_cents / 100).toFixed(2)}`);
    });

  } catch (err) {
    console.error('❌ Erro:', err.message);
  }

  // 3. Testar busca específica por nome "start"
  console.log('\n3️⃣ Buscando plano "start" especificamente...');
  try {
    const { data: startPlan, error } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('name', 'start')
      .single();

    if (error) {
      console.error('❌ Erro ao buscar plano start:', error.message);
      console.error('   Código do erro:', error.code);
      console.error('   Detalhes:', error.details);
    } else if (startPlan) {
      console.log('✅ Plano "start" encontrado:');
      console.log('   ID:', startPlan.id);
      console.log('   Nome:', startPlan.name);
      console.log('   Display:', startPlan.display_name);
      console.log('   Preço:', `R$ ${(startPlan.price_cents / 100).toFixed(2)}`);
      console.log('   Leads:', startPlan.leads_included);
    } else {
      console.log('⚠️ Plano "start" não encontrado (resultado null)');
    }

  } catch (err) {
    console.error('❌ Erro na busca:', err.message);
  }

  // 4. Testar a função getPlanById do serviço
  console.log('\n4️⃣ Testando função getPlanById...');
  try {
    const PerfectPayService = require('./services/perfectPayService');
    const service = new PerfectPayService();
    
    console.log('   Testando getPlanById("1")...');
    const plan1 = await service.getPlanById('1');
    if (plan1) {
      console.log('✅ getPlanById("1") retornou:', plan1.name, '-', plan1.display_name);
    } else {
      console.log('❌ getPlanById("1") retornou null');
    }

    console.log('   Testando getPlanById("start")...');
    const planStart = await service.getPlanById('start');
    if (planStart) {
      console.log('✅ getPlanById("start") retornou:', planStart.name, '-', planStart.display_name);
    } else {
      console.log('❌ getPlanById("start") retornou null');
    }

  } catch (err) {
    console.error('❌ Erro ao testar serviço:', err.message);
  }

  console.log('\n🏁 Debug concluído!');
}

debugPlanSearch();
