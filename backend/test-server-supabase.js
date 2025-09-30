const { createClient } = require('@supabase/supabase-js');

// Simular exatamente o que o servidor está fazendo
const supabaseUrl = process.env.SUPABASE_URL || 'https://lsvwjyhnnzeewuuuykmb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk';

console.log('🔍 ===== TESTE: SERVIDOR SUPABASE =====');
console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'DEFINIDA' : 'NÃO DEFINIDA');

const supabase = createClient(supabaseUrl, supabaseKey);

// Simular a função getPlanById do servidor
async function getPlanById(planId) {
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
    return null;
  }

  console.log('✅ Plano encontrado:', plan);
  return plan;
}

async function testServerSupabase() {
  try {
    // Testar getPlanById("1")
    const plan1 = await getPlanById('1');
    
    if (plan1) {
      console.log('\n🎉 SUCESSO! Servidor consegue buscar planos!');
    } else {
      console.log('\n❌ FALHA! Servidor não consegue buscar planos!');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testServerSupabase();









