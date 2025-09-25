const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Configuração robusta do Supabase
const supabaseUrl = 'https://kof6cn.easypanel.host';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZjZjbiIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MzUwNzQ4MDAsImV4cCI6MjA1MDY1MDgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Dados do webhook real que causaram o erro
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

async function testWebhookRobust() {
  console.log('🧪 TESTE ROBUSTO DO WEBHOOK');
  console.log('================================');
  
  try {
    // 1. Verificar conexão com Supabase
    console.log('🔌 Testando conexão com Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('payment_plans')
      .select('id, name')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro de conexão:', testError.message);
      return;
    }
    console.log('✅ Conexão com Supabase OK');
    
    // 2. Verificar estrutura da tabela
    console.log('\n📋 Verificando estrutura da tabela...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'user_payment_subscriptions')
      .in('column_name', ['perfect_pay_subscription_id', 'perfect_pay_transaction_id', 'user_id', 'plan_id', 'status']);
    
    if (columnsError) {
      console.error('❌ Erro ao verificar colunas:', columnsError.message);
      return;
    }
    
    console.log('✅ Colunas encontradas:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // 3. Verificar se usuário existe
    console.log('\n👤 Verificando usuário...');
    const userId = 'f20ceb6a-0e59-477c-9a85-afc39ea90afe';
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError) {
      console.log('⚠️ Usuário não encontrado no auth, tentando por email...');
      const { data: userByEmail, error: emailError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('email', 'creaty123456@gmail.com')
        .single();
      
      if (emailError) {
        console.error('❌ Usuário não encontrado:', emailError.message);
        return;
      }
      console.log('✅ Usuário encontrado por email:', userByEmail.user_id);
    } else {
      console.log('✅ Usuário encontrado no auth:', user.user.email);
    }
    
    // 4. Verificar plano
    console.log('\n📦 Verificando plano...');
    const planId = 'e9004fad-85ab-41b8-9416-477e41e8bcc9'; // Scale
    const { data: plan, error: planError } = await supabase
      .from('payment_plans')
      .select('id, name, display_name, leads_included')
      .eq('id', planId)
      .single();
    
    if (planError) {
      console.error('❌ Erro ao buscar plano:', planError.message);
      return;
    }
    console.log('✅ Plano encontrado:', plan.display_name, `(${plan.leads_included} leads)`);
    
    // 5. Verificar assinaturas existentes
    console.log('\n📋 Verificando assinaturas existentes...');
    const { data: existingSubs, error: subsError } = await supabase
      .from('user_payment_subscriptions')
      .select('id, status, plan_id, payment_plans(display_name)')
      .eq('user_id', userId);
    
    if (subsError) {
      console.error('❌ Erro ao buscar assinaturas:', subsError.message);
      return;
    }
    
    if (existingSubs && existingSubs.length > 0) {
      console.log('⚠️ Assinaturas existentes encontradas:');
      existingSubs.forEach(sub => {
        console.log(`   - ID: ${sub.id}, Status: ${sub.status}, Plano: ${sub.payment_plans?.display_name || 'N/A'}`);
      });
    } else {
      console.log('✅ Nenhuma assinatura existente (usuário limpo)');
    }
    
    // 6. Simular criação de assinatura
    console.log('\n🆕 Simulando criação de assinatura...');
    
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
    
    console.log('📝 Dados da assinatura:');
    console.log(JSON.stringify(subscriptionData, null, 2));
    
    // 7. Testar inserção com retry robusto
    console.log('\n🔄 Testando inserção com retry...');
    
    let subscription = null;
    let subscriptionError = null;
    let retryCount = 0;
    const maxRetries = 5;
    
    while (retryCount < maxRetries && !subscription) {
      try {
        console.log(`   Tentativa ${retryCount + 1}/${maxRetries}...`);
        
        const result = await supabase
          .from('user_payment_subscriptions')
          .insert(subscriptionData)
          .select(`
            id,
            user_id,
            plan_id,
            status,
            perfect_pay_transaction_id,
            perfect_pay_subscription_id,
            leads_balance,
            current_period_start,
            current_period_end,
            payment_plans(display_name)
          `)
          .single();
        
        subscription = result.data;
        subscriptionError = result.error;
        
        if (subscription) {
          console.log('✅ Inserção bem-sucedida!');
          console.log('📋 Assinatura criada:');
          console.log(JSON.stringify(subscription, null, 2));
          break;
        }
        
        if (subscriptionError) {
          console.log(`❌ Erro na tentativa ${retryCount + 1}:`, subscriptionError.message);
          
          if (subscriptionError.message.includes('schema cache')) {
            console.log('🔄 Problema de cache do Supabase, tentando novamente...');
            retryCount++;
            const delay = 1000 * retryCount; // 1s, 2s, 3s, 4s, 5s
            console.log(`⏳ Aguardando ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            console.log('❌ Erro não relacionado ao cache, parando tentativas');
            break;
          }
        }
      } catch (err) {
        subscriptionError = err;
        console.log(`❌ Exceção na tentativa ${retryCount + 1}:`, err.message);
        break;
      }
    }
    
    // 8. Resultado final
    console.log('\n🎯 RESULTADO FINAL:');
    console.log('==================');
    
    if (subscription) {
      console.log('🎉 SUCESSO! Assinatura criada com sucesso!');
      console.log(`✅ ID: ${subscription.id}`);
      console.log(`✅ Usuário: ${subscription.user_id}`);
      console.log(`✅ Plano: ${subscription.payment_plans?.display_name}`);
      console.log(`✅ Status: ${subscription.status}`);
      console.log(`✅ Leads: ${subscription.leads_balance}`);
      console.log(`✅ Transaction ID: ${subscription.perfect_pay_transaction_id}`);
      console.log(`✅ Subscription ID: ${subscription.perfect_pay_subscription_id}`);
    } else {
      console.log('❌ FALHA! Não foi possível criar a assinatura');
      console.log(`❌ Erro final: ${subscriptionError?.message || 'Erro desconhecido'}`);
    }
    
  } catch (err) {
    console.error('❌ Erro geral no teste:', err.message);
    console.error('Stack trace:', err.stack);
  }
}

// Executar teste
testWebhookRobust();

