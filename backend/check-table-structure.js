const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lsvwjyhnnzeewuuuykmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'
);

async function checkTableStructure() {
  console.log('🔍 ===== VERIFICANDO ESTRUTURA DA TABELA PAYMENT_PLANS =====\n');

  try {
    // Buscar todos os planos para ver a estrutura
    const { data: plans, error } = await supabase
      .from('payment_plans')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Erro ao buscar planos:', error);
      return;
    }

    if (plans && plans.length > 0) {
      console.log('✅ Estrutura da tabela payment_plans:');
      console.log('Colunas disponíveis:');
      Object.keys(plans[0]).forEach(column => {
        console.log(`   - ${column}: ${typeof plans[0][column]} = ${plans[0][column]}`);
      });
      
      console.log('\n📋 Dados do primeiro plano:');
      console.log(JSON.stringify(plans[0], null, 2));
    } else {
      console.log('❌ Nenhum plano encontrado!');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkTableStructure();
