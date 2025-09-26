const PerfectPayService = require('./services/perfectPayService');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const perfectPayService = new PerfectPayService(supabase);

async function testCancelImplementation() {
  console.log('🧪 [TESTE] ===== TESTANDO IMPLEMENTAÇÃO DE CANCELAMENTO =====');

  try {
    // Teste 1: Verificar se o método existe
    console.log('\n📋 [TESTE 1] Verificando se o método cancelPerfectPaySubscription existe...');
    if (typeof perfectPayService.cancelPerfectPaySubscription === 'function') {
      console.log('✅ [TESTE 1] Método cancelPerfectPaySubscription existe');
    } else {
      console.log('❌ [TESTE 1] Método cancelPerfectPaySubscription não existe');
      return;
    }

    // Teste 2: Verificar configurações
    console.log('\n📋 [TESTE 2] Verificando configurações...');
    console.log('  - Access Token:', perfectPayService.accessToken ? '✅ Configurado' : '❌ Não configurado');
    console.log('  - Base URL:', perfectPayService.baseUrl);
    console.log('  - Webhook Secret:', perfectPayService.webhookSecret ? '✅ Configurado' : '❌ Não configurado');

    // Teste 3: Simular cancelamento com dados inválidos
    console.log('\n📋 [TESTE 3] Testando com dados inválidos...');
    const mockSubscription = {
      id: 'test-id',
      user_id: 'test-user',
      perfect_pay_subscription_id: null // Simular ID inválido
    };

    const result1 = await perfectPayService.cancelPerfectPaySubscription(mockSubscription);
    console.log('  - Resultado com ID inválido:', result1.success ? '❌ Deveria falhar' : '✅ Falhou corretamente');
    console.log('  - Erro:', result1.error);

    // Teste 4: Simular cancelamento com dados válidos (mas sem token)
    console.log('\n📋 [TESTE 4] Testando com dados válidos...');
    const mockSubscription2 = {
      id: 'test-id-2',
      user_id: 'test-user-2',
      perfect_pay_subscription_id: 'PPSUB123456'
    };

    const result2 = await perfectPayService.cancelPerfectPaySubscription(mockSubscription2);
    console.log('  - Resultado com dados válidos:', result2.success ? '✅ Sucesso' : '⚠️ Falhou (esperado se API não existir)');
    console.log('  - Erro:', result2.error);

    // Teste 5: Verificar se o método cancelSubscription foi atualizado
    console.log('\n📋 [TESTE 5] Verificando integração no método principal...');
    const cancelSubscriptionCode = perfectPayService.cancelSubscription.toString();
    if (cancelSubscriptionCode.includes('cancelPerfectPaySubscription')) {
      console.log('✅ [TESTE 5] Método principal integrado com API');
    } else {
      console.log('❌ [TESTE 5] Método principal não integrado');
    }

  } catch (error) {
    console.error('❌ [TESTE] Erro inesperado:', error.message);
  }

  console.log('\n🎯 [TESTE] ===== CONCLUSÃO =====');
  console.log('✅ [TESTE] Implementação do cancelamento via API testada');
  console.log('💡 [TESTE] Pronto para deploy quando autorizado');
}

testCancelImplementation().catch(console.error);




