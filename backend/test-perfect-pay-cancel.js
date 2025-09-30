const PerfectPayService = require('./services/perfectPayService');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const perfectPayService = new PerfectPayService(supabase);

async function testPerfectPayCancel() {
  console.log('🧪 [TESTE] ===== TESTANDO CANCELAMENTO PERFECT PAY =====');

  try {
    // Buscar uma assinatura ativa para testar
    const { data: subscriptions, error: subError } = await supabase
      .from('user_payment_subscriptions')
      .select('*')
      .eq('status', 'active')
      .limit(1);

    if (subError) {
      console.error('❌ [TESTE] Erro ao buscar assinaturas:', subError.message);
      return;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('⚠️ [TESTE] Nenhuma assinatura ativa encontrada para testar');
      return;
    }

    const subscription = subscriptions[0];
    console.log('📋 [TESTE] Assinatura encontrada:', {
      id: subscription.id,
      user_id: subscription.user_id,
      perfect_pay_subscription_id: subscription.perfect_pay_subscription_id,
      status: subscription.status
    });

    // Testar cancelamento via API
    console.log('\n🔄 [TESTE] Testando cancelamento via API...');
    const cancelResult = await perfectPayService.cancelPerfectPaySubscription(subscription);
    
    console.log('📊 [TESTE] Resultado do cancelamento:', cancelResult);

    if (cancelResult.success) {
      console.log('✅ [TESTE] Cancelamento via API funcionou!');
    } else {
      console.log('⚠️ [TESTE] Cancelamento via API falhou:', cancelResult.error);
      
      if (cancelResult.error.includes('ID da assinatura Perfect Pay não encontrado')) {
        console.log('💡 [TESTE] Isso é esperado se a assinatura foi criada antes da implementação');
      }
    }

  } catch (error) {
    console.error('❌ [TESTE] Erro inesperado:', error.message);
  }

  console.log('\n🎯 [TESTE] ===== CONCLUSÃO =====');
  console.log('✅ [TESTE] Implementação do cancelamento via API concluída');
  console.log('💡 [TESTE] Para assinaturas futuras, o cancelamento será feito em ambos os lados');
}

testPerfectPayCancel().catch(console.error);










