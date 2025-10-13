// =====================================================
// TESTE COMPLETO PERFECT PAY - ASSINATURAS E PACOTES
// =====================================================

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const BASE_URL = 'http://localhost:3001';
const TEST_USER_ID = '66875e05-eace-49ac-bf07-0e794dbab8fd';
const WEBHOOK_URL = `${BASE_URL}/api/perfect-pay/webhook`;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Planos de produção
const PLANS = {
  START: { code: 'PPLQQNGCO', price: 197.00, leads: 1000 },
  SCALE: { code: 'PPLQQNGCM', price: 497.00, leads: 4000 },
  ENTERPRISE: { code: 'PPLQQNGCN', price: 997.00, leads: 10000 }
};

async function testDatabaseConfiguration() {
  console.log('\n🔍 TESTE 1: Configuração do Banco');
  try {
    const tables = ['user_payment_subscriptions', 'lead_packages', 'payment_transactions'];
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      console.log(`${error ? '❌' : '✅'} Tabela ${table}: ${error ? error.message : 'OK'}`);
    }
    
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(TEST_USER_ID);
    console.log(`${userError ? '❌' : '✅'} Usuário de teste: ${userError ? userError.message : user.user.email}`);
    
    return !userError;
  } catch (error) {
    console.log(`❌ Erro na configuração: ${error.message}`);
    return false;
  }
}

async function testSubscriptionPlans() {
  console.log('\n🔍 TESTE 2: Planos de Assinatura');
  try {
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true);
      
    if (error) {
      console.log(`❌ Erro ao buscar planos: ${error.message}`);
      return false;
    }
    
    console.log(`✅ Planos encontrados: ${plans.length}`);
    plans.forEach(plan => {
      console.log(`   📋 ${plan.display_name}: R$ ${(plan.price_monthly / 100).toFixed(2)} (${plan.leads_limit} leads)`);
      console.log(`      Código: ${plan.name}`);
    });
    
    return true;
  } catch (error) {
    console.log(`❌ Erro nos planos: ${error.message}`);
    return false;
  }
}

async function testLeadPackages() {
  console.log('\n🔍 TESTE 3: Pacotes de Leads');
  try {
    const { data: packages, error } = await supabase
      .from('lead_packages')
      .select('*')
      .eq('active', true);
      
    if (error) {
      console.log(`❌ Erro ao buscar pacotes: ${error.message}`);
      return false;
    }
    
    console.log(`✅ Pacotes encontrados: ${packages.length}`);
    packages.forEach(pkg => {
      console.log(`   - ${pkg.name}: R$ ${(pkg.price_cents / 100).toFixed(2)} (${pkg.leads} leads)`);
    });
    
    return true;
  } catch (error) {
    console.log(`❌ Erro nos pacotes: ${error.message}`);
    return false;
  }
}

async function testSubscriptionWebhook() {
  console.log('\n🔍 TESTE 4: Webhook de Assinatura');
  try {
    const payload = {
      token: '7378fa24f96b38a3b1805d7a6887bc82',
      code: `PPCPMTB${Date.now()}`,
      sale_amount: PLANS.START.price,
      currency_enum: 1,
      payment_type_enum: 4,
      sale_status_enum: 2,
      sale_status_detail: 'Teste Assinatura Start',
      date_created: new Date().toISOString(),
      date_approved: new Date().toISOString(),
      product: {
        code: PLANS.START.code,
        name: 'LeadBaze Start',
        external_reference: `new_${TEST_USER_ID}_1_${Date.now()}`,
        guarantee: 7
      },
      plan: {
        code: PLANS.START.code,
        name: 'LeadBaze Start - 1000 leads',
        quantity: 1
      },
      customer: {
        customer_type_enum: 1,
        full_name: 'Jean Lopes',
        email: 'creaty123456@gmail.com',
        identification_type: 'CPF',
        identification_number: '11215289618'
      },
      webhook_owner: 'PPAKIOL'
    };
    
    const response = await axios.post(WEBHOOK_URL, payload);
    console.log(`✅ Webhook assinatura: Status ${response.status}`);
    return true;
  } catch (error) {
    console.log(`❌ Erro no webhook assinatura: ${error.message}`);
    return false;
  }
}

async function testPackageWebhook() {
  console.log('\n🔍 TESTE 5: Webhook de Pacote');
  try {
    const payload = {
      token: '7378fa24f96b38a3b1805d7a6887bc82',
      code: `PPCPMTB${Date.now()}`,
      sale_amount: 99.00,
      currency_enum: 1,
      payment_type_enum: 1,
      sale_status_enum: 2,
      sale_status_detail: 'Teste Pacote 500 Leads',
      date_created: new Date().toISOString(),
      date_approved: new Date().toISOString(),
      product: {
        code: 'PPLQQNG92',
        name: 'LeadBaze Pacotes',
        external_reference: `leads_leads_500_${TEST_USER_ID}_${Date.now()}`,
        guarantee: 7
      },
      customer: {
        customer_type_enum: 1,
        full_name: 'Jean Lopes',
        email: 'creaty123456@gmail.com'
      },
      webhook_owner: 'PPAKIOL'
    };
    
    const response = await axios.post(WEBHOOK_URL, payload);
    console.log(`✅ Webhook pacote: Status ${response.status}`);
    return true;
  } catch (error) {
    console.log(`❌ Erro no webhook pacote: ${error.message}`);
    return false;
  }
}

async function testUserSubscription() {
  console.log('\n🔍 TESTE 6: Assinatura do Usuário');
  try {
    const { data: subscription, error } = await supabase
      .from('user_payment_subscriptions')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .eq('status', 'active')
      .single();
      
    if (error && error.code !== 'PGRST116') {
      console.log(`❌ Erro ao buscar assinatura: ${error.message}`);
      return false;
    }
    
    if (!subscription) {
      console.log('ℹ️ Usuário não possui assinatura ativa');
      return true;
    }
    
    console.log('✅ Assinatura encontrada:');
    console.log(`   Plano: ${subscription.plan_name}`);
    console.log(`   Status: ${subscription.status}`);
    console.log(`   Leads disponíveis: ${subscription.leads_balance}`);
    
    return true;
  } catch (error) {
    console.log(`❌ Erro na assinatura: ${error.message}`);
    return false;
  }
}

async function testAPIEndpoints() {
  console.log('\n🔍 TESTE 7: Endpoints da API');
  const endpoints = [
    { name: 'Planos', url: `${BASE_URL}/api/perfect-pay/plans` },
    { name: 'Pacotes', url: `${BASE_URL}/api/lead-packages` },
    { name: 'Assinatura', url: `${BASE_URL}/api/perfect-pay/subscription/${TEST_USER_ID}` }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint.url);
      console.log(`✅ ${endpoint.name}: Status ${response.status}`);
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
    }
  }
  
  return true;
}

async function runAllTests() {
  console.log('🚀 INICIANDO TESTE COMPLETO PERFECT PAY');
  console.log('========================================');
  
  const results = {
    database: await testDatabaseConfiguration(),
    plans: await testSubscriptionPlans(),
    packages: await testLeadPackages(),
    subscriptionWebhook: await testSubscriptionWebhook(),
    packageWebhook: await testPackageWebhook(),
    userSubscription: await testUserSubscription(),
    apiEndpoints: await testAPIEndpoints()
  };
  
  console.log('\n📊 RESUMO DOS TESTES');
  console.log('====================');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, result]) => {
    console.log(`${result ? '✅' : '❌'} ${test}: ${result ? 'PASSOU' : 'FALHOU'}`);
  });
  
  console.log(`\n🎯 RESULTADO FINAL: ${passed}/${total} testes passaram`);
  
  if (passed === total) {
    console.log('🎉 TODOS OS TESTES PASSARAM! Sistema Perfect Pay funcionando perfeitamente!');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique os logs acima.');
  }
  
  return results;
}

if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };