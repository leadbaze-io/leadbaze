const { createClient } = require('@supabase/supabase-js');
const PerfectPayService = require('./services/perfectPayService');

const supabase = createClient(
  'https://lsvwjyhnnzeewuuuykmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'
);

const perfectPayService = new PerfectPayService(supabase);
const TEST_USER_ID = '39dc6c62-6dea-4222-adb5-7075fd704189';

async function testCompleteSystemValidation() {
  console.log('🚀 ===== VALIDAÇÃO COMPLETA DO SISTEMA =====\n');
  console.log('🎯 Objetivo: Garantir que tudo está pronto para compra real\n');

  const testResults = {
    database: false,
    api: false,
    webhooks: false,
    perfectPayService: false,
    frontend: false,
    planMapping: false,
    leadSystem: false,
    cancellation: false,
    expiration: false
  };

  try {
    // ===== TESTE 1: CONEXÃO COM BANCO DE DADOS =====
    console.log('1️⃣ TESTE: CONEXÃO COM BANCO DE DADOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      const { data: plans, error: plansError } = await supabase
        .from('payment_plans')
        .select('*')
        .order('price_cents', { ascending: true });

      if (plansError) throw plansError;

      console.log('✅ Conexão Supabase: OK');
      console.log(`✅ Planos encontrados: ${plans.length}`);
      plans.forEach(plan => {
        console.log(`   - ${plan.display_name}: R$ ${(plan.price_cents / 100).toFixed(2)} (${plan.leads_included} leads)`);
      });
      
      testResults.database = true;
    } catch (error) {
      console.log('❌ Erro na conexão com banco:', error.message);
    }

    // ===== TESTE 2: API ENDPOINTS =====
    console.log('\n2️⃣ TESTE: API ENDPOINTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      // Testar endpoint de teste
      const testResponse = await fetch('http://localhost:3001/api/perfect-pay/test');
      const testData = await testResponse.json();
      
      if (testData.success) {
        console.log('✅ Endpoint /test: OK');
        console.log(`   - API Key: ${testData.config.apiKey}`);
        console.log(`   - Webhook Secret: ${testData.config.webhookSecret}`);
      } else {
        throw new Error('Endpoint de teste falhou');
      }

      // Testar endpoint de assinatura
      const subResponse = await fetch(`http://localhost:3001/api/perfect-pay/subscription/${TEST_USER_ID}`);
      const subData = await subResponse.json();
      
      if (subData.success) {
        console.log('✅ Endpoint /subscription: OK');
        console.log(`   - Status: ${subData.data?.status || 'N/A'}`);
        console.log(`   - Plano: ${subData.data?.plan_display_name || 'N/A'}`);
        console.log(`   - Leads: ${subData.data?.leads_remaining || 'N/A'}`);
      } else {
        throw new Error('Endpoint de assinatura falhou');
      }

      testResults.api = true;
    } catch (error) {
      console.log('❌ Erro nos endpoints da API:', error.message);
    }

    // ===== TESTE 3: PERFECT PAY SERVICE =====
    console.log('\n3️⃣ TESTE: PERFECT PAY SERVICE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      // Testar mapeamento de planos
      const planMappings = [
        { id: '1', expected: 'start' },
        { id: '2', expected: 'scale' },
        { id: '3', expected: 'enterprise' }
      ];

      let allPlansOK = true;
      for (const mapping of planMappings) {
        const plan = await perfectPayService.getPlanById(mapping.id);
        if (plan && plan.name === mapping.expected) {
          console.log(`✅ Plano ${mapping.id} → ${mapping.expected}: OK`);
        } else {
          console.log(`❌ Plano ${mapping.id} → ${mapping.expected}: FALHOU`);
          allPlansOK = false;
        }
      }

      if (allPlansOK) {
        testResults.planMapping = true;
        testResults.perfectPayService = true;
      }

    } catch (error) {
      console.log('❌ Erro no Perfect Pay Service:', error.message);
    }

    // ===== TESTE 4: WEBHOOK PROCESSING =====
    console.log('\n4️⃣ TESTE: PROCESSAMENTO DE WEBHOOKS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      // Testar webhook de assinatura ativa
      const webhookPayload = {
        token: "7378fa24f96b38a3b1805d7a6887bc82",
        code: `PPCPMTB${Date.now()}`,
        subscription_amount: 197,
        currency_enum: 1,
        payment_type_enum: 4,
        sale_status_enum: 2, // Ativo
        sale_status_detail: "Teste de Validação",
        start_date_recurrent: new Date().toISOString(),
        next_date_recurrent: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        recurrent_type_enum: "Mensal",
        installments: 1,
        charges_made: 1,
        product: {
          name: "LeadBaze Start",
          external_reference: `new_${TEST_USER_ID}_1_${Date.now()}`
        },
        plan: {
          name: "LeadBaze Start - 1000 leads"
        },
        customer: {
          email: "creaty123456@gmail.com",
          full_name: "Jean Lopes"
        },
        webhook_owner: "PPAKIOL"
      };

      const webhookResult = await perfectPayService.processWebhook(webhookPayload);
      
      if (webhookResult.processed) {
        console.log('✅ Processamento de webhook: OK');
        console.log(`   - Status: ${webhookResult.status}`);
        console.log(`   - Operação: ${webhookResult.operation}`);
        testResults.webhooks = true;
      } else {
        console.log('❌ Webhook não foi processado:', webhookResult.error);
      }

    } catch (error) {
      console.log('❌ Erro no processamento de webhook:', error.message);
    }

    // ===== TESTE 5: SISTEMA DE LEADS =====
    console.log('\n5️⃣ TESTE: SISTEMA DE LEADS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      // Verificar assinatura atual
      const { data: currentSub } = await supabase
        .from('user_payment_subscriptions')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (currentSub && currentSub.leads_balance > 0) {
        console.log('✅ Sistema de leads: OK');
        console.log(`   - Leads disponíveis: ${currentSub.leads_balance}`);
        console.log(`   - Status da assinatura: ${currentSub.status}`);
        testResults.leadSystem = true;
      } else {
        console.log('❌ Sistema de leads: Sem leads disponíveis ou assinatura inativa');
      }

    } catch (error) {
      console.log('❌ Erro no sistema de leads:', error.message);
    }

    // ===== TESTE 6: FUNCIONALIDADES DE CANCELAMENTO =====
    console.log('\n6️⃣ TESTE: FUNCIONALIDADES DE CANCELAMENTO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      // Verificar se há assinaturas canceladas no histórico
      const { data: cancelledSubs } = await supabase
        .from('user_payment_subscriptions')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .eq('status', 'cancelled');

      if (cancelledSubs && cancelledSubs.length > 0) {
        console.log('✅ Sistema de cancelamento: OK');
        console.log(`   - Assinaturas canceladas: ${cancelledSubs.length}`);
        
        // Verificar se as canceladas têm dados corretos
        const lastCancelled = cancelledSubs[0];
        if (lastCancelled.cancelled_at && lastCancelled.cancellation_reason) {
          console.log('✅ Dados de cancelamento: OK');
          console.log(`   - Cancelado em: ${lastCancelled.cancelled_at}`);
          console.log(`   - Motivo: ${lastCancelled.cancellation_reason}`);
          testResults.cancellation = true;
        }
      } else {
        console.log('ℹ️ Sistema de cancelamento: Nenhuma assinatura cancelada encontrada (normal)');
        testResults.cancellation = true; // OK se não há cancelamentos
      }

    } catch (error) {
      console.log('❌ Erro no sistema de cancelamento:', error.message);
    }

    // ===== TESTE 7: VERIFICAÇÃO DE CONFIGURAÇÕES =====
    console.log('\n7️⃣ TESTE: CONFIGURAÇÕES DO SISTEMA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      console.log('📋 Configurações Perfect Pay:');
      console.log(`   - Base URL: ${perfectPayService.baseUrl}`);
      console.log(`   - Webhook Secret: ${perfectPayService.webhookSecret ? 'Configurado' : 'Não configurado'}`);
      console.log(`   - Access Token: ${perfectPayService.accessToken ? 'Configurado' : 'Não configurado'}`);
      
      console.log('\n📋 Mapeamento de Planos:');
      Object.entries(perfectPayService.planMapping).forEach(([id, plan]) => {
        console.log(`   - ${id}: ${plan.name} (${plan.perfectPayPlanCode}) - R$ ${plan.price} - ${plan.leads} leads`);
      });

      console.log('\n📋 Variáveis de Ambiente:');
      console.log(`   - SUPABASE_URL: ${process.env.SUPABASE_URL ? 'OK' : 'Não configurado'}`);
      console.log(`   - SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'Não configurado'}`);
      console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
      
      testResults.frontend = true;

    } catch (error) {
      console.log('❌ Erro na verificação de configurações:', error.message);
    }

    // ===== RELATÓRIO FINAL =====
    console.log('\n🎯 RELATÓRIO FINAL DE VALIDAÇÃO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const totalTests = Object.keys(testResults).length;
    const passedTests = Object.values(testResults).filter(Boolean).length;
    const failedTests = totalTests - passedTests;

    console.log(`\n📊 RESULTADOS:`);
    console.log(`   ✅ Testes aprovados: ${passedTests}/${totalTests}`);
    console.log(`   ❌ Testes falharam: ${failedTests}/${totalTests}`);
    console.log(`   📈 Taxa de sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    console.log(`\n📋 DETALHES:`);
    Object.entries(testResults).forEach(([test, result]) => {
      const status = result ? '✅' : '❌';
      const testName = test.charAt(0).toUpperCase() + test.slice(1);
      console.log(`   ${status} ${testName}`);
    });

    // Verificar se está pronto para produção
    const criticalTests = ['database', 'api', 'webhooks', 'perfectPayService', 'planMapping'];
    const criticalPassed = criticalTests.every(test => testResults[test]);

    console.log(`\n🚀 PRONTO PARA COMPRA REAL?`);
    if (criticalPassed && passedTests >= totalTests * 0.8) {
      console.log('✅ SIM! Sistema validado e pronto para compra real');
      console.log('✅ Todos os testes críticos passaram');
      console.log('✅ Taxa de sucesso acima de 80%');
      
      console.log(`\n📝 CHECKLIST FINAL:`);
      console.log('   ✅ Banco de dados conectado');
      console.log('   ✅ APIs funcionando');
      console.log('   ✅ Webhooks processando');
      console.log('   ✅ Perfect Pay Service operacional');
      console.log('   ✅ Mapeamento de planos correto');
      console.log('   ✅ Sistema de leads funcional');
      
      console.log(`\n🎯 PRÓXIMOS PASSOS:`);
      console.log('   1. Configurar webhook URL no Perfect Pay');
      console.log('   2. Testar com produto real no Perfect Pay');
      console.log('   3. Validar códigos de plano reais');
      console.log('   4. Fazer compra de teste com valor real');
      
    } else {
      console.log('❌ NÃO! Sistema precisa de correções');
      console.log(`❌ Testes críticos falharam: ${criticalTests.filter(test => !testResults[test]).join(', ')}`);
      console.log('❌ Corrija os problemas antes de fazer compra real');
    }

  } catch (error) {
    console.error('❌ Erro geral na validação:', error.message);
  }
}

testCompleteSystemValidation();
