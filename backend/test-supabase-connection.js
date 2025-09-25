const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔍 ===== TESTE DE CONEXÃO SUPABASE =====\n');

console.log('📋 Configurações carregadas:');
console.log('   SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('   SUPABASE_KEY length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length);
console.log('');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testConnection() {
  try {
    console.log('1️⃣ Testando conexão básica...');
    
    // Teste simples de conexão
    const { data, error } = await supabase
      .from('payment_plans')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Erro na conexão:', error.message);
      console.error('   Detalhes:', error.details);
      console.error('   Código:', error.code);
      return;
    }

    console.log('✅ Conexão funcionando!');
    console.log('   Dados recebidos:', data);

    console.log('\n2️⃣ Testando busca de planos...');
    
    const { data: plans, error: plansError } = await supabase
      .from('payment_plans')
      .select('id, name, display_name, price_cents, leads_included')
      .limit(5);

    if (plansError) {
      console.error('❌ Erro ao buscar planos:', plansError.message);
      return;
    }

    console.log(`✅ ${plans.length} planos encontrados:`);
    plans.forEach((plan, index) => {
      console.log(`   ${index + 1}. ${plan.name} (${plan.id}) - R$ ${plan.price_cents / 100} - ${plan.leads_included} leads`);
    });

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testConnection().catch(console.error);


