require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a8e49f2-b584-4516-aeea-f342e75686f9';

async function investigatePaymentProcess() {
  console.log('🔍 ===== INVESTIGANDO PROCESSO DE PAGAMENTO =====\n');
  console.log(`👤 Usuário ID: ${userId}\n`);

  try {
    // 1. Verificar estrutura da tabela payment_webhooks
    console.log('1️⃣ Verificando estrutura da tabela payment_webhooks...');
    const { data: webhookSample, error: webhookError } = await supabase
      .from('payment_webhooks')
      .select('*')
      .limit(1);

    if (webhookError) {
      console.error('❌ Erro ao buscar webhook sample:', webhookError.message);
    } else if (webhookSample && webhookSample.length > 0) {
      console.log('✅ Estrutura da tabela payment_webhooks:');
      const sample = webhookSample[0];
      for (const key in sample) {
        console.log(`   - ${key}: ${typeof sample[key]} = ${sample[key]}`);
      }
    } else {
      console.log('⚠️ Nenhum webhook encontrado para inferir estrutura.');
    }

    // 2. Buscar webhooks relacionados ao usuário (usando subscription_id)
    console.log('\n2️⃣ Verificando webhooks por subscription_id...');
    
    // Primeiro, buscar assinaturas do usuário para obter subscription_id
    const { data: subscriptions, error: subsError } = await supabase
      .from('user_payment_subscriptions')
      .select('id, perfect_pay_transaction_id')
      .eq('user_id', userId);

    if (subsError) {
      console.error('❌ Erro ao buscar assinaturas:', subsError.message);
    } else {
      console.log(`📊 Assinaturas encontradas: ${subscriptions.length}`);
      
      if (subscriptions.length > 0) {
        const subscriptionIds = subscriptions.map(sub => sub.id);
        const transactionIds = subscriptions.map(sub => sub.perfect_pay_transaction_id).filter(Boolean);
        
        console.log('🔍 Buscando webhooks por subscription_id...');
        const { data: webhooksBySub, error: webhookSubError } = await supabase
          .from('payment_webhooks')
          .select('*')
          .in('subscription_id', subscriptionIds)
          .order('created_at', { ascending: false });

        if (webhookSubError) {
          console.error('❌ Erro ao buscar webhooks por subscription_id:', webhookSubError.message);
        } else {
          console.log(`📊 Webhooks por subscription_id: ${webhooksBySub.length}`);
          webhooksBySub.forEach((webhook, index) => {
            console.log(`\n📋 Webhook ${index + 1}:`);
            console.log(`   ID: ${webhook.id}`);
            console.log(`   Subscription ID: ${webhook.subscription_id}`);
            console.log(`   Transaction ID: ${webhook.transaction_id}`);
            console.log(`   Webhook Type: ${webhook.webhook_type}`);
            console.log(`   Action: ${webhook.action}`);
            console.log(`   Processed: ${webhook.processed}`);
            console.log(`   Processed At: ${webhook.processed_at || 'Não processado'}`);
            console.log(`   Error: ${webhook.error_message || 'Nenhum'}`);
            console.log(`   Criado: ${webhook.created_at}`);
            console.log(`   Raw Data: ${JSON.stringify(webhook.raw_data, null, 2)}`);
          });
        }

        console.log('\n🔍 Buscando webhooks por transaction_id...');
        if (transactionIds.length > 0) {
          const { data: webhooksByTrans, error: webhookTransError } = await supabase
            .from('payment_webhooks')
            .select('*')
            .in('transaction_id', transactionIds)
            .order('created_at', { ascending: false });

          if (webhookTransError) {
            console.error('❌ Erro ao buscar webhooks por transaction_id:', webhookTransError.message);
          } else {
            console.log(`📊 Webhooks por transaction_id: ${webhooksByTrans.length}`);
            webhooksByTrans.forEach((webhook, index) => {
              console.log(`\n📋 Webhook ${index + 1}:`);
              console.log(`   ID: ${webhook.id}`);
              console.log(`   Transaction ID: ${webhook.transaction_id}`);
              console.log(`   Webhook Type: ${webhook.webhook_type}`);
              console.log(`   Action: ${webhook.action}`);
              console.log(`   Processed: ${webhook.processed}`);
              console.log(`   Processed At: ${webhook.processed_at || 'Não processado'}`);
              console.log(`   Error: ${webhook.error_message || 'Nenhum'}`);
              console.log(`   Criado: ${webhook.created_at}`);
            });
          }
        }
      }
    }

    // 3. Buscar webhooks recentes (últimos 24h) para ver se há algum relacionado
    console.log('\n3️⃣ Verificando webhooks recentes (últimas 24h)...');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: recentWebhooks, error: recentError } = await supabase
      .from('payment_webhooks')
      .select('*')
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) {
      console.error('❌ Erro ao buscar webhooks recentes:', recentError.message);
    } else {
      console.log(`📊 Webhooks recentes: ${recentWebhooks.length}`);
      recentWebhooks.forEach((webhook, index) => {
        console.log(`\n📋 Webhook Recente ${index + 1}:`);
        console.log(`   ID: ${webhook.id}`);
        console.log(`   Transaction ID: ${webhook.transaction_id}`);
        console.log(`   Subscription ID: ${webhook.subscription_id}`);
        console.log(`   Webhook Type: ${webhook.webhook_type}`);
        console.log(`   Action: ${webhook.action}`);
        console.log(`   Processed: ${webhook.processed}`);
        console.log(`   Criado: ${webhook.created_at}`);
        
        // Verificar se o raw_data contém informações do usuário
        if (webhook.raw_data && typeof webhook.raw_data === 'object') {
          const rawData = webhook.raw_data;
          if (rawData.customer_email === 'mathewshq20@hotmail.com' || 
              rawData.email === 'mathewshq20@hotmail.com' ||
              rawData.user_email === 'mathewshq20@hotmail.com') {
            console.log(`   🎯 ENCONTRADO! Este webhook é do usuário em questão!`);
            console.log(`   Raw Data: ${JSON.stringify(rawData, null, 2)}`);
          }
        }
      });
    }

    // 4. Verificar se há webhooks não processados
    console.log('\n4️⃣ Verificando webhooks não processados...');
    const { data: unprocessedWebhooks, error: unprocessedError } = await supabase
      .from('payment_webhooks')
      .select('*')
      .eq('processed', false)
      .order('created_at', { ascending: false })
      .limit(5);

    if (unprocessedError) {
      console.error('❌ Erro ao buscar webhooks não processados:', unprocessedError.message);
    } else {
      console.log(`📊 Webhooks não processados: ${unprocessedWebhooks.length}`);
      unprocessedWebhooks.forEach((webhook, index) => {
        console.log(`\n📋 Webhook Não Processado ${index + 1}:`);
        console.log(`   ID: ${webhook.id}`);
        console.log(`   Transaction ID: ${webhook.transaction_id}`);
        console.log(`   Subscription ID: ${webhook.subscription_id}`);
        console.log(`   Webhook Type: ${webhook.webhook_type}`);
        console.log(`   Action: ${webhook.action}`);
        console.log(`   Error: ${webhook.error_message || 'Nenhum'}`);
        console.log(`   Criado: ${webhook.created_at}`);
        console.log(`   Raw Data: ${JSON.stringify(webhook.raw_data, null, 2)}`);
      });
    }

  } catch (err) {
    console.error('❌ Erro inesperado durante a investigação:', err.message);
  }
}

investigatePaymentProcess();

