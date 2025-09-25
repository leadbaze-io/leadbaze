const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './config.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Simular dados do webhook que causaram o erro
const webhookData = {
  token: "5550029d92c8e727464111a087b6d903",
  code: "PPCPMTB5H384LL",
  sale_amount: 5,
  currency_enum: 1,
  currency_enum_key: "BRL",
  sale_status_enum: 2,
  sale_status_enum_key: "approved",
  product: {
    code: "PPPBDC49",
    name: "LeadBaze",
    external_reference: null
  },
  plan: {
    code: "PPLQQNGGM",
    name: "LeadBaze Teste Scale",
    quantity: 1
  },
  customer: {
    full_name: "Jean Lopes",
    email: "creaty123456@gmail.com"
  },
  subscription: {
    code: "PPSUB1O91FP1I",
    charges_made: 4,
    subscription_status_enum: 2,
    status: "active",
    status_event: "subscription_renewed"
  }
};

async function testWebhookFix() {
  try {
    console.log('🧪 Testando correção do webhook...');
    
    // 1. Verificar se a coluna existe
    console.log('📋 Verificando estrutura da tabela...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'user_payment_subscriptions')
      .eq('column_name', 'perfect_pay_subscription_id');
    
    if (columnsError) {
      console.error('❌ Erro ao verificar colunas:', columnsError.message);
      return;
    }
    
    if (columns && columns.length > 0) {
      console.log('✅ Coluna perfect_pay_subscription_id encontrada:', columns[0]);
    } else {
      console.log('❌ Coluna perfect_pay_subscription_id não encontrada');
      return;
    }
    
    // 2. Testar inserção de dados
    console.log('🔧 Testando inserção de dados...');
    
    const userId = 'f20ceb6a-0e59-477c-9a85-afc39ea90afe';
    const planId = 'e9004fad-85ab-41b8-9416-477e41e8bcc9'; // Scale
    
    // Buscar dados do plano
    const { data: plan, error: planError } = await supabase
      .from('payment_plans')
      .select('id, name, display_name, leads_included')
      .eq('id', planId)
      .single();
    
    if (planError) {
      console.error('❌ Erro ao buscar plano:', planError.message);
      return;
    }
    
    console.log('✅ Plano encontrado:', plan.display_name);
    
    // Dados da assinatura
    const currentDate = new Date();
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const subscriptionData = {
      user_id: userId,
      plan_id: plan.id,
      status: 'active',
      perfect_pay_transaction_id: webhookData.code,
      perfect_pay_subscription_id: webhookData.subscription?.code,
      leads_balance: plan.leads_included,
      current_period_start: currentDate.toISOString(),
      current_period_end: nextMonth.toISOString(),
      first_payment_date: currentDate.toISOString(),
      refund_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    console.log('📝 Dados da assinatura:', subscriptionData);
    
    // Testar inserção com retry
    let subscription = null;
    let subscriptionError = null;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries && !subscription) {
      try {
        console.log(`🔄 Tentativa ${retryCount + 1} de inserção...`);
        
        const result = await supabase
          .from('user_payment_subscriptions')
          .insert(subscriptionData)
          .select()
          .single();
        
        subscription = result.data;
        subscriptionError = result.error;
        
        if (subscription) {
          console.log('✅ Inserção bem-sucedida!');
          console.log('📋 Assinatura criada:', subscription);
          break;
        }
        
        if (subscriptionError && subscriptionError.message.includes('schema cache')) {
          console.log(`⚠️ Problema de cache do Supabase, tentando novamente...`);
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
        } else {
          console.log('❌ Erro não relacionado ao cache:', subscriptionError?.message);
          break;
        }
      } catch (err) {
        subscriptionError = err;
        console.log('❌ Erro na tentativa:', err.message);
        break;
      }
    }
    
    if (subscriptionError) {
      console.log('❌ Falha final:', subscriptionError.message);
    } else {
      console.log('🎉 Teste concluído com sucesso!');
    }
    
  } catch (err) {
    console.error('❌ Erro geral:', err.message);
  }
}

testWebhookFix();
