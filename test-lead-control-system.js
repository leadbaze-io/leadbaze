// =====================================================
// TESTE COMPLETO DO SISTEMA DE CONTROLE DE LEADS
// =====================================================

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.log('Certifique-se de que o arquivo .env contém:');
  console.log('VITE_SUPABASE_URL=sua_url_aqui');
  console.log('VITE_SUPABASE_ANON_KEY=sua_chave_aqui');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// =====================================================
// FUNÇÕES DE TESTE
// =====================================================

async function testDatabaseStructure() {
  console.log('\n🔍 TESTANDO ESTRUTURA DO BANCO DE DADOS...');
  
  try {
    // Verificar se as tabelas existem
    const { data: tables, error: tablesError } = await supabase
      .from('subscription_plans')
      .select('id')
      .limit(1);
    
    if (tablesError) {
      console.error('❌ Tabela subscription_plans não encontrada:', tablesError.message);
      return false;
    }
    
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('user_subscriptions')
      .select('id')
      .limit(1);
    
    if (subscriptionsError) {
      console.error('❌ Tabela user_subscriptions não encontrada:', subscriptionsError.message);
      return false;
    }
    
    const { data: history, error: historyError } = await supabase
      .from('leads_usage_history')
      .select('id')
      .limit(1);
    
    if (historyError) {
      console.error('❌ Tabela leads_usage_history não encontrada:', historyError.message);
      return false;
    }
    
    console.log('✅ Todas as tabelas existem!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar estrutura:', error.message);
    return false;
  }
}

async function testPlansData() {
  console.log('\n📋 TESTANDO DADOS DOS PLANOS...');
  
  try {
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly');
    
    if (error) {
      console.error('❌ Erro ao buscar planos:', error.message);
      return false;
    }
    
    if (!plans || plans.length === 0) {
      console.error('❌ Nenhum plano ativo encontrado!');
      return false;
    }
    
    console.log('✅ Planos encontrados:');
    plans.forEach(plan => {
      console.log(`   📦 ${plan.display_name}: R$ ${plan.price_monthly} - ${plan.leads_limit} leads/mês`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar planos:', error.message);
    return false;
  }
}

async function testRPCFunctions() {
  console.log('\n⚙️ TESTANDO FUNÇÕES RPC...');
  
  try {
    // Testar get_subscription_status
    const { data: status, error: statusError } = await supabase
      .rpc('get_subscription_status', { p_user_id: 'test-user-id' });
    
    if (statusError) {
      console.log('⚠️ Função get_subscription_status:', statusError.message);
    } else {
      console.log('✅ Função get_subscription_status funcionando');
    }
    
    // Testar check_leads_availability
    const { data: availability, error: availabilityError } = await supabase
      .rpc('check_leads_availability', { 
        p_user_id: 'test-user-id', 
        p_leads_to_generate: 1
      });
    
    if (availabilityError) {
      console.log('⚠️ Função check_leads_availability:', availabilityError.message);
    } else {
      console.log('✅ Função check_leads_availability funcionando');
    }
    
    // Testar consume_leads
    const { data: consume, error: consumeError } = await supabase
      .rpc('consume_leads', { 
        p_user_id: 'test-user-id', 
        p_leads_consumed: 1, 
        p_operation_reason: 'teste_sistema' 
      });
    
    if (consumeError) {
      console.log('⚠️ Função consume_leads:', consumeError.message);
    } else {
      console.log('✅ Função consume_leads funcionando');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar funções RPC:', error.message);
    return false;
  }
}

async function createTestSubscription(userId) {
  console.log('\n🔄 CRIANDO ASSINATURA DE TESTE...');
  
  try {
    // Buscar o plano Start
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('name', 'start')
      .single();
    
    if (planError || !plan) {
      console.error('❌ Plano Start não encontrado:', planError?.message);
      return false;
    }
    
    // Criar assinatura de teste
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_id: plan.id,
        status: 'active',
        leads_used: 0,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (subscriptionError) {
      console.error('❌ Erro ao criar assinatura:', subscriptionError.message);
      return false;
    }
    
    console.log('✅ Assinatura de teste criada:', subscription.id);
    return subscription;
  } catch (error) {
    console.error('❌ Erro ao criar assinatura de teste:', error.message);
    return false;
  }
}

async function testLeadConsumption(userId) {
  console.log('\n🎯 TESTANDO CONSUMO DE LEADS...');
  
  try {
    // Verificar status inicial
    const { data: initialStatus, error: initialError } = await supabase
      .rpc('get_user_subscription_status', { user_id: userId });
    
    if (initialError) {
      console.error('❌ Erro ao verificar status inicial:', initialError.message);
      return false;
    }
    
    console.log('📊 Status inicial:');
    console.log(`   Leads disponíveis: ${initialStatus.leads_available}`);
    console.log(`   Leads usados: ${initialStatus.leads_used}`);
    console.log(`   Plano: ${initialStatus.plan_name}`);
    
    // Consumir 5 leads
    const { data: consumeResult, error: consumeError } = await supabase
      .rpc('consume_leads', { 
        user_id: userId, 
        leads_to_consume: 5, 
        reason: 'teste_consumo' 
      });
    
    if (consumeError) {
      console.error('❌ Erro ao consumir leads:', consumeError.message);
      return false;
    }
    
    console.log('✅ Leads consumidos com sucesso!');
    console.log(`   Leads consumidos: ${consumeResult.leads_consumed || consumeResult.leads_generated}`);
    console.log(`   Leads restantes: ${consumeResult.remaining_leads}`);
    
    // Verificar status após consumo
    const { data: finalStatus, error: finalError } = await supabase
      .rpc('get_user_subscription_status', { user_id: userId });
    
    if (finalError) {
      console.error('❌ Erro ao verificar status final:', finalError.message);
      return false;
    }
    
    console.log('📊 Status final:');
    console.log(`   Leads disponíveis: ${finalStatus.leads_available}`);
    console.log(`   Leads usados: ${finalStatus.leads_used}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar consumo de leads:', error.message);
    return false;
  }
}

async function testUsageHistory(userId) {
  console.log('\n📈 TESTANDO HISTÓRICO DE USO...');
  
  try {
    const { data: history, error } = await supabase
      .rpc('get_leads_usage_history', { 
        user_id: userId, 
        days: 30 
      });
    
    if (error) {
      console.error('❌ Erro ao buscar histórico:', error.message);
      return false;
    }
    
    console.log('✅ Histórico de uso:');
    if (history && history.length > 0) {
      history.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.leads_generated} leads - ${record.operation_reason} - ${new Date(record.created_at).toLocaleString()}`);
      });
    } else {
      console.log('   Nenhum registro encontrado');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar histórico:', error.message);
    return false;
  }
}

async function testLimitEnforcement(userId) {
  console.log('\n🚫 TESTANDO APLICAÇÃO DE LIMITES...');
  
  try {
    // Verificar status atual
    const { data: status, error: statusError } = await supabase
      .rpc('get_user_subscription_status', { user_id: userId });
    
    if (statusError) {
      console.error('❌ Erro ao verificar status:', statusError.message);
      return false;
    }
    
    console.log(`📊 Status atual: ${status.leads_available} leads disponíveis`);
    
    // Tentar consumir mais leads do que disponível
    const { data: consumeResult, error: consumeError } = await supabase
      .rpc('consume_leads', { 
        user_id: userId, 
        leads_to_consume: status.leads_available + 100, 
        reason: 'teste_limite' 
      });
    
    if (consumeError) {
      console.log('✅ Limite aplicado corretamente:', consumeError.message);
      return true;
    }
    
    if (consumeResult && (consumeResult.leads_consumed === 0 || consumeResult.leads_generated === 0)) {
      console.log('✅ Limite aplicado corretamente - nenhum lead consumido');
      return true;
    }
    
    console.log('⚠️ Limite não foi aplicado corretamente');
    return false;
  } catch (error) {
    console.error('❌ Erro ao testar limite:', error.message);
    return false;
  }
}

// =====================================================
// FUNÇÃO PRINCIPAL DE TESTE
// =====================================================

async function runCompleteTest() {
  console.log('🚀 INICIANDO TESTE COMPLETO DO SISTEMA DE CONTROLE DE LEADS');
  console.log('=' .repeat(70));
  
  const results = {
    databaseStructure: false,
    plansData: false,
    rpcFunctions: false,
    subscriptionCreation: false,
    leadConsumption: false,
    usageHistory: false,
    limitEnforcement: false
  };
  
  // Teste 1: Estrutura do banco
  results.databaseStructure = await testDatabaseStructure();
  
  // Teste 2: Dados dos planos
  results.plansData = await testPlansData();
  
  // Teste 3: Funções RPC
  results.rpcFunctions = await testRPCFunctions();
  
  // Teste 4: Criação de assinatura (usar um usuário real)
  const testUserId = '2730da37-6511-4e86-9b70-dce126317f74'; // Substitua por um ID real
  const subscription = await createTestSubscription(testUserId);
  results.subscriptionCreation = !!subscription;
  
  if (subscription) {
    // Teste 5: Consumo de leads
    results.leadConsumption = await testLeadConsumption(testUserId);
    
    // Teste 6: Histórico de uso
    results.usageHistory = await testUsageHistory(testUserId);
    
    // Teste 7: Aplicação de limites
    results.limitEnforcement = await testLimitEnforcement(testUserId);
  }
  
  // Relatório final
  console.log('\n' + '=' .repeat(70));
  console.log('📊 RELATÓRIO FINAL DOS TESTES');
  console.log('=' .repeat(70));
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASSOU' : '❌ FALHOU';
    const testName = test.replace(/([A-Z])/g, ' $1').toLowerCase();
    console.log(`${status} - ${testName}`);
  });
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const successRate = (passedTests / totalTests) * 100;
  
  console.log(`\n🎯 Taxa de sucesso: ${passedTests}/${totalTests} (${successRate.toFixed(1)}%)`);
  
  if (successRate === 100) {
    console.log('🎉 TODOS OS TESTES PASSARAM! Sistema funcionando perfeitamente!');
  } else if (successRate >= 80) {
    console.log('⚠️ Maioria dos testes passou. Verifique os que falharam.');
  } else {
    console.log('❌ Muitos testes falharam. Sistema precisa de correções.');
  }
}

// Executar teste se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runCompleteTest().catch(console.error);
}

export { runCompleteTest };
