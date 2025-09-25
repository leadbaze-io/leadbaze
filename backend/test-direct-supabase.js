const { createClient } = require('@supabase/supabase-js');

// Usar as mesmas variáveis que o servidor está usando
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDirectSupabase() {
  console.log('🔍 ===== TESTE DIRETO SUPABASE =====');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseKey.substring(0, 20) + '...');
  
  try {
    // Testar conexão básica
    console.log('\n1️⃣ Testando conexão básica...');
    const { data, error } = await supabase
      .from('payment_plans')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error);
      return;
    }
    
    console.log('✅ Conexão OK!');
    
    // Listar todos os planos
    console.log('\n2️⃣ Listando todos os planos...');
    const { data: plans, error: plansError } = await supabase
      .from('payment_plans')
      .select('*');
    
    if (plansError) {
      console.error('❌ Erro ao buscar planos:', plansError);
      return;
    }
    
    console.log(`✅ Encontrados ${plans.length} planos:`);
    plans.forEach((plan, index) => {
      console.log(`   ${index + 1}. ID: ${plan.id} | Nome: "${plan.name}" | Display: "${plan.display_name}"`);
    });
    
    // Buscar plano específico
    console.log('\n3️⃣ Buscando plano "start"...');
    const { data: startPlan, error: startError } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('name', 'start')
      .single();
    
    if (startError) {
      console.error('❌ Erro ao buscar plano start:', startError);
    } else if (startPlan) {
      console.log('✅ Plano start encontrado:');
      console.log('   ID:', startPlan.id);
      console.log('   Nome:', startPlan.name);
      console.log('   Display:', startPlan.display_name);
      console.log('   Preço:', `R$ ${(startPlan.price_cents / 100).toFixed(2)}`);
    } else {
      console.log('⚠️ Plano start não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testDirectSupabase();
