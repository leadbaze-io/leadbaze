const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://lsvwjyhnnzeewuuuykmb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('🔍 ===== VERIFICANDO ESTRUTURA DAS TABELAS =====\n');
  
  try {
    // 1. Verificar estrutura da tabela payment_plans
    console.log('1️⃣ Estrutura da tabela payment_plans:');
    const { data: plans, error: plansError } = await supabase
      .from('payment_plans')
      .select('*')
      .limit(1);

    if (plansError) {
      console.log('❌ Erro ao buscar payment_plans:', plansError.message);
    } else if (plans && plans.length > 0) {
      console.log('✅ Colunas encontradas em payment_plans:');
      Object.keys(plans[0]).forEach(key => {
        console.log(`   - ${key}: ${typeof plans[0][key]} = ${plans[0][key]}`);
      });
    } else {
      console.log('⚠️ Tabela payment_plans está vazia');
    }

    // 2. Verificar estrutura da tabela user_payment_subscriptions
    console.log('\n2️⃣ Estrutura da tabela user_payment_subscriptions:');
    const { data: subs, error: subsError } = await supabase
      .from('user_payment_subscriptions')
      .select('*')
      .limit(1);

    if (subsError) {
      console.log('❌ Erro ao buscar user_payment_subscriptions:', subsError.message);
    } else if (subs && subs.length > 0) {
      console.log('✅ Colunas encontradas em user_payment_subscriptions:');
      Object.keys(subs[0]).forEach(key => {
        console.log(`   - ${key}: ${typeof subs[0][key]} = ${subs[0][key]}`);
      });
    } else {
      console.log('⚠️ Tabela user_payment_subscriptions está vazia');
    }

    // 3. Listar todos os planos disponíveis
    console.log('\n3️⃣ Todos os planos disponíveis:');
    const { data: allPlans, error: allPlansError } = await supabase
      .from('payment_plans')
      .select('*');

    if (allPlansError) {
      console.log('❌ Erro ao buscar todos os planos:', allPlansError.message);
    } else {
      console.log(`📊 Total de planos: ${allPlans.length}`);
      allPlans.forEach((plan, index) => {
        console.log(`   ${index + 1}. ID: ${plan.id}`);
        console.log(`      Nome: ${plan.name || 'N/A'}`);
        console.log(`      Display: ${plan.display_name || 'N/A'}`);
        console.log(`      Ativo: ${plan.is_active || 'N/A'}`);
        console.log(`      Campos disponíveis: ${Object.keys(plan).join(', ')}`);
        console.log('      ---');
      });
    }

  } catch (err) {
    console.error('❌ Erro inesperado:', err.message);
  }
}

checkTableStructure();