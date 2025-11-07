// =====================================================
// VERIFICAR ESTRUTURA DA TABELA SUBSCRIPTION_PLANS
// =====================================================
// Este script verifica a estrutura real da tabela
// =====================================================

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verificarEstruturaTabela() {
  console.log('🔍 VERIFICANDO ESTRUTURA DA TABELA SUBSCRIPTION_PLANS');
  console.log('====================================================');
  
  try {
    // Verificar se a tabela existe
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'subscription_plans')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.log('❌ Erro ao verificar estrutura:', tablesError.message);
      return;
    }
    
    console.log('📋 Colunas encontradas na tabela subscription_plans:');
    tables.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Buscar dados da tabela para ver o que existe
    console.log('\n📊 Dados existentes na tabela:');
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*');
    
    if (plansError) {
      console.log('❌ Erro ao buscar planos:', plansError.message);
    } else {
      console.log(`✅ Total de planos encontrados: ${plans.length}`);
      plans.forEach((plan, index) => {
        console.log(`\n📋 Plano ${index + 1}:`);
        Object.entries(plan).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
      });
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

if (require.main === module) {
  verificarEstruturaTabela().catch(console.error);
}

module.exports = { verificarEstruturaTabela };


















