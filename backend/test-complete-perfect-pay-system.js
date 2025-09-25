require('dotenv').config({ path: './config.env' });
const PerfectPayService = require('./services/perfectPayService');
const { createClient } = require('@supabase/supabase-js');

class PerfectPayTestSuite {
  constructor() {
    this.perfectPayService = new PerfectPayService();
    this.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    this.testResults = [];
    this.testUsers = [];
    this.testPlans = [];
    
    console.log('🧪 INICIANDO TESTE EXTREMAMENTE COMPLETO DO PERFECT PAY');
    console.log('======================================================\n');
  }

  // Criar dados de teste
  async setupTestData() {
    console.log('🔧 Configurando dados de teste...\n');

    // Buscar planos reais
    const { data: plans, error: plansError } = await this.supabase
      .from('payment_plans')
      .select('*')
      .order('price_cents', { ascending: true });

    if (plansError || !plans || plans.length === 0) {
      throw new Error('Erro ao buscar planos: ' + plansError?.message);
    }

    this.testPlans = plans;
    console.log(`✅ Planos encontrados: ${plans.length}`);
    plans.forEach(plan => {
      console.log(`   - ${plan.display_name}: R$ ${(plan.price_cents/100).toFixed(2)} (${plan.leads_included.toLocaleString()} leads)`);
    });

    // Criar usuários de teste com UUID válido fornecido
    this.testUsers = [
      {
        id: 'c7f5c454-36fb-4a39-8460-620a09169f50',
        email: 'test-new@example.com',
        scenario: 'Usuário completamente novo'
      },
      {
        id: 'c7f5c454-36fb-4a39-8460-620a09169f51',
        email: 'test-existing@example.com', 
        scenario: 'Usuário com assinatura existente'
      },
      {
        id: 'c7f5c454-36fb-4a39-8460-620a09169f52',
        email: 'test-cancelled@example.com',
        scenario: 'Usuário com assinatura cancelada'
      }
    ];

    console.log(`✅ Usuários de teste criados: ${this.testUsers.length}\n`);
  }

  // Limpar dados de teste
  async cleanupTestData() {
    console.log('🧹 Limpando dados de teste...');
    
    for (const user of this.testUsers) {
      // Remover assinaturas de teste
      await this.supabase
        .from('user_payment_subscriptions')
        .delete()
        .eq('user_id', user.id);

      // Remover webhooks de teste
      await this.supabase
        .from('payment_webhooks')
        .delete()
        .like('perfect_pay_id', 'test_%');
    }
    
    console.log('✅ Dados de teste removidos\n');
  }

  // Executar teste individual
  async runTest(testName, testFunction) {
    console.log(`🧪 TESTE: ${testName}`);
    console.log('─'.repeat(60));
    
    const startTime = Date.now();
    
    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        name: testName,
        status: 'PASSOU',
        duration,
        result
      });
      
      console.log(`✅ PASSOU (${duration}ms)`);
      console.log(`📊 Resultado:`, JSON.stringify(result, null, 2));
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        name: testName,
        status: 'FALHOU',
        duration,
        error: error.message
      });
      
      console.log(`❌ FALHOU (${duration}ms)`);
      console.log(`💥 Erro:`, error.message);
    }
    
    console.log('\n');
  }

  // TESTE 1: Nova assinatura - usuário completamente novo
  async testNewSubscriptionCleanUser() {
    const user = this.testUsers[0];
    const plan = this.testPlans[0]; // Plano mais barato
    
    const webhookData = {
      transaction_id: `test_new_${Date.now()}`,
      status: 'approved',
      external_reference: `new_${user.id}_${plan.id}_${Date.now()}`,
      amount: plan.price_cents / 100
    };

    const result = await this.perfectPayService.processApprovedPayment(
      user.id, plan.id, 'new', webhookData
    );

    // Verificações
    if (!result.processed) throw new Error('Pagamento não foi processado');
    if (result.operation !== 'new_subscription') throw new Error('Operação incorreta');
    if (result.leads_added !== plan.leads_included) throw new Error('Leads incorretos');

    return result;
  }

  // TESTE 2: Renovação - mesmo plano
  async testRenewalSamePlan() {
    const user = this.testUsers[0];
    const plan = this.testPlans[0];
    
    // Buscar assinatura criada no teste anterior
    const { data: existingSubscription } = await this.supabase
      .from('user_payment_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!existingSubscription) throw new Error('Assinatura anterior não encontrada');

    const previousLeads = existingSubscription.leads_balance;
    
    const webhookData = {
      transaction_id: `test_renewal_${Date.now()}`,
      status: 'approved',
      external_reference: `renewal_${user.id}_${plan.id}_${Date.now()}`,
      amount: plan.price_cents / 100
    };

    const result = await this.perfectPayService.processApprovedPayment(
      user.id, plan.id, 'renewal', webhookData
    );

    // Verificações
    if (!result.processed) throw new Error('Renovação não foi processada');
    if (result.operation !== 'renewal') throw new Error('Operação incorreta');
    if (result.leads_total !== previousLeads + plan.leads_included) {
      throw new Error(`Leads incorretos: esperado ${previousLeads + plan.leads_included}, recebido ${result.leads_total}`);
    }

    return result;
  }

  // TESTE 3: Upgrade de plano
  async testUpgradePlan() {
    const user = this.testUsers[0];
    const currentPlan = this.testPlans[0];
    const upgradePlan = this.testPlans[1]; // Plano mais caro
    
    if (!upgradePlan || upgradePlan.price_cents <= currentPlan.price_cents) {
      throw new Error('Plano de upgrade não disponível');
    }

    // Buscar assinatura atual
    const { data: existingSubscription } = await this.supabase
      .from('user_payment_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    const previousLeads = existingSubscription.leads_balance;
    
    const webhookData = {
      transaction_id: `test_upgrade_${Date.now()}`,
      status: 'approved',
      external_reference: `upgrade_${user.id}_${upgradePlan.id}_${Date.now()}`,
      amount: upgradePlan.price_cents / 100
    };

    const result = await this.perfectPayService.processApprovedPayment(
      user.id, upgradePlan.id, 'upgrade', webhookData
    );

    // Verificações
    if (!result.processed) throw new Error('Upgrade não foi processado');
    if (result.operation !== 'upgrade') throw new Error('Operação incorreta');
    if (result.leads_total !== previousLeads + upgradePlan.leads_included) {
      throw new Error(`Leads incorretos no upgrade: esperado ${previousLeads + upgradePlan.leads_included}, recebido ${result.leads_total}`);
    }

    return result;
  }

  // TESTE 4: Downgrade de plano
  async testDowngradePlan() {
    const user = this.testUsers[0];
    const currentPlan = this.testPlans[1]; // Plano atual (após upgrade)
    const downgradePlan = this.testPlans[0]; // Plano mais barato
    
    // Buscar assinatura atual
    const { data: existingSubscription } = await this.supabase
      .from('user_payment_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    const previousLeads = existingSubscription.leads_balance;
    
    const webhookData = {
      transaction_id: `test_downgrade_${Date.now()}`,
      status: 'approved',
      external_reference: `downgrade_${user.id}_${downgradePlan.id}_${Date.now()}`,
      amount: downgradePlan.price_cents / 100
    };

    const result = await this.perfectPayService.processApprovedPayment(
      user.id, downgradePlan.id, 'downgrade', webhookData
    );

    // Verificações
    if (!result.processed) throw new Error('Downgrade não foi processado');
    if (result.operation !== 'downgrade') throw new Error('Operação incorreta');
    if (result.leads_added !== 0) throw new Error('Downgrade não deveria adicionar leads');
    if (result.leads_total !== previousLeads) {
      throw new Error(`Leads incorretos no downgrade: esperado ${previousLeads}, recebido ${result.leads_total}`);
    }

    return result;
  }

  // TESTE 5: Cancelamento de assinatura
  async testCancellation() {
    const user = this.testUsers[0];
    
    // Buscar assinatura antes do cancelamento
    const { data: beforeCancellation } = await this.supabase
      .from('user_payment_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!beforeCancellation) throw new Error('Assinatura ativa não encontrada');

    const result = await this.perfectPayService.cancelSubscription(user.id, 'test_cancellation');

    // Verificações
    if (!result.success) throw new Error('Cancelamento falhou: ' + result.error);
    if (result.leads_remaining !== beforeCancellation.leads_balance) {
      throw new Error('Leads restantes incorretos');
    }

    // Verificar se foi marcado como cancelado no banco
    const { data: afterCancellation } = await this.supabase
      .from('user_payment_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'cancelled')
      .single();

    if (!afterCancellation) throw new Error('Assinatura não foi marcada como cancelada');
    if (!afterCancellation.cancelled_at) throw new Error('Data de cancelamento não foi registrada');
    if (afterCancellation.cancellation_reason !== 'test_cancellation') {
      throw new Error('Motivo do cancelamento incorreto');
    }

    return result;
  }

  // TESTE 6: Elegibilidade para reembolso - dentro do prazo
  async testRefundEligibilityEligible() {
    // Criar nova assinatura para teste de reembolso
    const user = this.testUsers[1];
    const plan = this.testPlans[0];
    
    const currentDate = new Date();
    const subscriptionData = {
      user_id: user.id,
      plan_id: plan.id,
      status: 'active',
      perfect_pay_transaction_id: `test_refund_${Date.now()}`,
      leads_balance: plan.leads_included,
      current_period_start: currentDate.toISOString(),
      current_period_end: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      first_payment_date: currentDate.toISOString(), // Hoje (dentro do prazo)
      refund_deadline: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    await this.supabase
      .from('user_payment_subscriptions')
      .insert(subscriptionData);

    const result = await this.perfectPayService.checkRefundEligibility(user.id);

    // Verificações
    if (!result.eligible) throw new Error('Deveria ser elegível para reembolso');
    if (result.days_since_purchase < 0 || result.days_since_purchase > 7) {
      throw new Error('Dias desde compra incorretos');
    }

    return result;
  }

  // TESTE 7: Elegibilidade para reembolso - fora do prazo
  async testRefundEligibilityNotEligible() {
    const user = this.testUsers[2];
    const plan = this.testPlans[0];
    
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10); // 10 dias atrás (fora do prazo)
    
    const subscriptionData = {
      user_id: user.id,
      plan_id: plan.id,
      status: 'active',
      perfect_pay_transaction_id: `test_no_refund_${Date.now()}`,
      leads_balance: plan.leads_included,
      current_period_start: oldDate.toISOString(),
      current_period_end: new Date(oldDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      first_payment_date: oldDate.toISOString(), // 10 dias atrás (fora do prazo)
      refund_deadline: new Date(oldDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    await this.supabase
      .from('user_payment_subscriptions')
      .insert(subscriptionData);

    const result = await this.perfectPayService.checkRefundEligibility(user.id);

    // Verificações
    if (result.eligible) throw new Error('NÃO deveria ser elegível para reembolso');
    if (result.days_since_purchase !== 10) {
      throw new Error(`Dias incorretos: esperado 10, recebido ${result.days_since_purchase}`);
    }

    return result;
  }

  // TESTE 8: Detecção automática inteligente
  async testSmartDetection() {
    const user = 'c7f5c454-36fb-4a39-8460-620a09169f53';
    const plan = this.testPlans[0];
    
    // Teste 1: Sem assinatura = nova assinatura
    const webhookData1 = {
      transaction_id: `test_smart_new_${Date.now()}`,
      status: 'approved',
      external_reference: `auto_${user}_${plan.id}_${Date.now()}`, // Sem tipo específico
      amount: plan.price_cents / 100
    };

    const result1 = await this.perfectPayService.processApprovedPayment(
      user, plan.id, null, webhookData1 // null = detecção automática
    );

    if (result1.operation !== 'new_subscription') {
      throw new Error('Detecção automática falhou para nova assinatura');
    }

    // Teste 2: Mesmo plano = renovação
    const webhookData2 = {
      transaction_id: `test_smart_renewal_${Date.now()}`,
      status: 'approved',
      external_reference: `auto_${user}_${plan.id}_${Date.now()}`,
      amount: plan.price_cents / 100
    };

    const result2 = await this.perfectPayService.processApprovedPayment(
      user, plan.id, null, webhookData2
    );

    if (result2.operation !== 'renewal') {
      throw new Error('Detecção automática falhou para renovação');
    }

    return { result1, result2 };
  }

  // TESTE 9: Webhooks duplicados
  async testDuplicateWebhooks() {
    const user = 'c7f5c454-36fb-4a39-8460-620a09169f54';
    const plan = this.testPlans[0];
    
    const webhookData = {
      transaction_id: `test_duplicate_${Date.now()}`,
      status: 'approved',
      external_reference: `new_${user}_${plan.id}_${Date.now()}`,
      amount: plan.price_cents / 100
    };

    // Primeiro processamento
    const result1 = await this.perfectPayService.processApprovedPayment(
      user, plan.id, 'new', webhookData
    );

    if (!result1.processed) throw new Error('Primeiro webhook não foi processado');

    // Marcar webhook como processado manualmente
    await this.supabase
      .from('payment_webhooks')
      .update({ processed: true })
      .eq('perfect_pay_id', webhookData.transaction_id);

    // Segundo processamento (duplicado)
    const isDuplicate = await this.perfectPayService.checkDuplicateWebhook(webhookData);
    
    if (!isDuplicate) throw new Error('Webhook duplicado não foi detectado');

    return { result1, isDuplicate };
  }

  // TESTE 10: Pagamentos pendentes e rejeitados
  async testOtherPaymentStatuses() {
    const user = 'c7f5c454-36fb-4a39-8460-620a09169f55';
    const plan = this.testPlans[0];
    
    // Teste pagamento pendente
    const pendingResult = await this.perfectPayService.processPendingPayment(
      user, plan.id, 'new', { status: 'pending' }
    );

    if (!pendingResult.processed || pendingResult.status !== 'pending') {
      throw new Error('Processamento de pagamento pendente falhou');
    }

    // Teste pagamento rejeitado
    const rejectedResult = await this.perfectPayService.processRejectedPayment(
      user, plan.id, 'new', { status: 'rejected' }
    );

    if (!rejectedResult.processed || rejectedResult.status !== 'rejected') {
      throw new Error('Processamento de pagamento rejeitado falhou');
    }

    return { pendingResult, rejectedResult };
  }

  // Executar todos os testes
  async runAllTests() {
    console.log('🚀 EXECUTANDO BATERIA COMPLETA DE TESTES\n');
    
    try {
      await this.setupTestData();

      // Executar cada teste 3 vezes como solicitado
      for (let round = 1; round <= 3; round++) {
        console.log(`🔄 RODADA ${round}/3`);
        console.log('='.repeat(50));

        await this.runTest(`R${round} - Nova Assinatura (Usuário Limpo)`, () => this.testNewSubscriptionCleanUser());
        await this.runTest(`R${round} - Renovação (Mesmo Plano)`, () => this.testRenewalSamePlan());
        await this.runTest(`R${round} - Upgrade de Plano`, () => this.testUpgradePlan());
        await this.runTest(`R${round} - Downgrade de Plano`, () => this.testDowngradePlan());
        await this.runTest(`R${round} - Cancelamento`, () => this.testCancellation());
        await this.runTest(`R${round} - Reembolso Elegível`, () => this.testRefundEligibilityEligible());
        await this.runTest(`R${round} - Reembolso Não Elegível`, () => this.testRefundEligibilityNotEligible());
        await this.runTest(`R${round} - Detecção Automática`, () => this.testSmartDetection());
        await this.runTest(`R${round} - Webhooks Duplicados`, () => this.testDuplicateWebhooks());
        await this.runTest(`R${round} - Status Pendente/Rejeitado`, () => this.testOtherPaymentStatuses());

        console.log(`✅ RODADA ${round} CONCLUÍDA\n`);
      }

      await this.cleanupTestData();
      this.printFinalReport();

    } catch (error) {
      console.error('💥 ERRO CRÍTICO NO TESTE:', error.message);
      console.error(error.stack);
    }
  }

  // Relatório final
  printFinalReport() {
    console.log('📊 RELATÓRIO FINAL DOS TESTES');
    console.log('='.repeat(60));
    
    const passed = this.testResults.filter(t => t.status === 'PASSOU').length;
    const failed = this.testResults.filter(t => t.status === 'FALHOU').length;
    const total = this.testResults.length;
    
    console.log(`📈 RESULTADOS:`);
    console.log(`   ✅ Passou: ${passed}/${total} (${((passed/total)*100).toFixed(1)}%)`);
    console.log(`   ❌ Falhou: ${failed}/${total} (${((failed/total)*100).toFixed(1)}%)`);
    
    const totalTime = this.testResults.reduce((sum, test) => sum + test.duration, 0);
    console.log(`   ⏱️  Tempo total: ${(totalTime/1000).toFixed(2)}s`);
    
    if (failed > 0) {
      console.log('\n❌ TESTES QUE FALHARAM:');
      this.testResults
        .filter(t => t.status === 'FALHOU')
        .forEach(test => {
          console.log(`   - ${test.name}: ${test.error}`);
        });
    }
    
    console.log('\n🎯 CENÁRIOS TESTADOS:');
    console.log('   ✅ Nova assinatura (usuário limpo)');
    console.log('   ✅ Renovação automática (soma leads)');
    console.log('   ✅ Upgrade (atualiza plano + adiciona leads)');
    console.log('   ✅ Downgrade (atualiza plano sem adicionar leads)');
    console.log('   ✅ Cancelamento (mantém acesso até expirar)');
    console.log('   ✅ Reembolso elegível (dentro de 7 dias)');
    console.log('   ✅ Reembolso não elegível (após 7 dias)');
    console.log('   ✅ Detecção automática inteligente');
    console.log('   ✅ Proteção contra webhooks duplicados');
    console.log('   ✅ Status pendente e rejeitado');
    
    if (failed === 0) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM!');
      console.log('🚀 SISTEMA PERFECT PAY 100% FUNCIONAL!');
    } else {
      console.log('\n⚠️  ALGUNS TESTES FALHARAM - VERIFICAR IMPLEMENTAÇÃO');
    }
  }
}

// Executar testes
const testSuite = new PerfectPayTestSuite();
testSuite.runAllTests().then(() => {
  console.log('🏁 TESTES CONCLUÍDOS');
}).catch(error => {
  console.error('💥 ERRO FATAL:', error.message);
  process.exit(1);
});
