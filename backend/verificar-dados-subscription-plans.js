// =====================================================
// VERIFICAR DADOS DA TABELA SUBSCRIPTION_PLANS
// =====================================================
// Este script verifica os dados reais da tabela
// =====================================================

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verificarDadosTabela() {
  console.log('🔍 VERIFICANDO DADOS DA TABELA SUBSCRIPTION_PLANS');
  console.log('================================================');
  
  try {
    // Buscar dados da tabela para ver o que existe
    console.log('📊 Buscando dados da tabela subscription_plans...');
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*');
    
    if (plansError) {
      console.log('❌ Erro ao buscar planos:', plansError.message);
      return;
    }
    
    console.log(`✅ Total de planos encontrados: ${plans.length}`);
    
    if (plans.length > 0) {
      console.log('\n📋 ESTRUTURA DA TABELA (baseada no primeiro registro):');
      const firstPlan = plans[0];
      Object.entries(firstPlan).forEach(([key, value]) => {
        console.log(`   ${key}: ${value} (tipo: ${typeof value})`);
      });
      
      console.log('\n📊 TODOS OS PLANOS:');
      plans.forEach((plan, index) => {
        console.log(`\n📋 Plano ${index + 1}:`);
        Object.entries(plan).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
      });
    } else {
      console.log('ℹ️ Nenhum plano encontrado na tabela');
    }
    
    // Tentar buscar com diferentes filtros para entender a estrutura
    console.log('\n🔍 TESTANDO DIFERENTES FILTROS:');
    
    // Teste 1: Sem filtro
    console.log('1. Sem filtro:');
    const { data: allPlans } = await supabase.from('subscription_plans').select('*');
    console.log(`   Total: ${allPlans?.length || 0}`);
    
    // Teste 2: Com filtro 'active' (se existir)
    console.log('2. Com filtro "active":');
    const { data: activePlans, error: activeError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('active', true);
    console.log(`   Resultado: ${activeError ? 'ERRO - ' + activeError.message : 'OK - ' + (activePlans?.length || 0)}`);
    
    // Teste 3: Com filtro 'status' (se existir)
    console.log('3. Com filtro "status":');
    const { data: statusPlans, error: statusError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('status', 'active');
    console.log(`   Resultado: ${statusError ? 'ERRO - ' + statusError.message : 'OK - ' + (statusPlans?.length || 0)}`);
    
    // Teste 4: Com filtro 'enabled' (se existir)
    console.log('4. Com filtro "enabled":');
    const { data: enabledPlans, error: enabledError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('enabled', true);
    console.log(`   Resultado: ${enabledError ? 'ERRO - ' + enabledError.message : 'OK - ' + (enabledPlans?.length || 0)}`);
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

if (require.main === module) {
  verificarDadosTabela().catch(console.error);
}

module.exports = { verificarDadosTabela };




















