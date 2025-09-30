require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetUserToStart(userId = '4b518881-21e6-42d5-9958-c794b63d460e') {
  try {
    const startPlanId = '460a8b88-f828-4b18-9d42-4b8ad5333d61'; // Start plan ID
    
    console.log('🔄 Resetando usuário para plano Start...');
    console.log('👤 Usuário:', userId);
    console.log('📋 Plano:', 'Start');
    
    console.log('✅ Processando reset para usuário:', userId);
    
    // Resetar assinatura para Start
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_payment_subscriptions')
      .update({
        plan_id: startPlanId,
        status: 'active',
        leads_balance: 1000, // Leads do plano Start
        perfect_pay_transaction_id: `RESET_START_${Date.now()}`,
        updated_at: new Date().toISOString(),
        perfect_pay_cancelled: false,
        requires_manual_cancellation: false,
        cancelled_at: null,
        cancellation_reason: null
      })
      .eq('user_id', userId)
      .select()
      .single();
      
    if (subscriptionError) {
      throw new Error(`Erro ao resetar assinatura: ${subscriptionError.message}`);
    }
    
    console.log('✅ Assinatura resetada para Start com sucesso!');
    console.log('📊 Leads disponíveis:', subscription.leads_balance);
    console.log('🆔 Transaction ID:', subscription.perfect_pay_transaction_id);
    
    return subscription;
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const userId = process.argv[2] || '4b518881-21e6-42d5-9958-c794b63d460e';
  resetUserToStart(userId);
}

module.exports = { resetUserToStart };







