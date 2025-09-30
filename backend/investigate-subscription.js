require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a8e49f2-b584-4516-aeea-f342e75686f9';

async function investigateSubscription() {
  console.log('🔍 ===== INVESTIGANDO ASSINATURA DO USUÁRIO =====\n');
  console.log(`👤 Usuário ID: ${userId}\n`);

  try {
    // 1. Verificar se o usuário existe
    console.log('1️⃣ Verificando se o usuário existe...');
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError) {
      console.error('❌ Erro ao buscar usuário:', userError.message);
      return;
    }

    if (!user.user) {
      console.error('❌ Usuário não encontrado');
      return;
    }

    console.log('✅ Usuário encontrado:', user.user.email);
    console.log('   Criado em:', user.user.created_at);
    console.log('   Último login:', user.user.last_sign_in_at);

    // 2. Verificar assinaturas existentes
    console.log('\n2️⃣ Verificando assinaturas existentes...');
    const { data: subscriptions, error: subsError } = await supabase
      .from('user_payment_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (subsError) {
      console.error('❌ Erro ao buscar assinaturas:', subsError.message);
      return;
    }

    console.log(`📊 Assinaturas encontradas: ${subscriptions.length}`);
    
    if (subscriptions.length === 0) {
      console.log('⚠️ Nenhuma assinatura encontrada para este usuário.');
      
      // Verificar se há webhooks pendentes
      console.log('\n3️⃣ Verificando webhooks pendentes...');
      const { data: webhooks, error: webhookError } = await supabase
        .from('perfect_pay_webhooks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (webhookError) {
        console.error('❌ Erro ao buscar webhooks:', webhookError.message);
      } else {
        console.log(`📊 Webhooks encontrados: ${webhooks.length}`);
        webhooks.forEach((webhook, index) => {
          console.log(`   ${index + 1}. Status: ${webhook.status}`);
          console.log(`      Transaction ID: ${webhook.transaction_id}`);
          console.log(`      Valor: R$ ${(webhook.amount / 100).toFixed(2)}`);
          console.log(`      Criado: ${webhook.created_at}`);
          console.log(`      Processado: ${webhook.processed_at || 'Não processado'}`);
          console.log(`      ---`);
        });
      }
      
      return;
    }

    // Mostrar detalhes das assinaturas
    subscriptions.forEach((sub, index) => {
      console.log(`\n📋 Assinatura ${index + 1}:`);
      console.log(`   ID: ${sub.id}`);
      console.log(`   Status: ${sub.status}`);
      console.log(`   Plano ID: ${sub.plan_id}`);
      console.log(`   Leads Balance: ${sub.leads_balance}`);
      console.log(`   Transaction ID: ${sub.perfect_pay_transaction_id}`);
      console.log(`   Criado: ${sub.created_at}`);
      console.log(`   Atualizado: ${sub.updated_at}`);
      console.log(`   Período: ${sub.current_period_start} até ${sub.current_period_end}`);
      console.log(`   Cancelado: ${sub.perfect_pay_cancelled}`);
      console.log(`   Refund Eligible: ${sub.is_refund_eligible}`);
    });

    // 3. Verificar detalhes do plano
    console.log('\n3️⃣ Verificando detalhes do plano...');
    const activeSub = subscriptions.find(sub => sub.status === 'active');
    if (activeSub) {
      const { data: plan, error: planError } = await supabase
        .from('payment_plans')
        .select('*')
        .eq('id', activeSub.plan_id)
        .single();

      if (planError) {
        console.error('❌ Erro ao buscar plano:', planError.message);
      } else {
        console.log('✅ Plano encontrado:');
        console.log(`   Nome: ${plan.name}`);
        console.log(`   Display: ${plan.display_name}`);
        console.log(`   Preço: R$ ${(plan.price_cents / 100).toFixed(2)}`);
        console.log(`   Leads: ${plan.leads_included}`);
        console.log(`   Ativo: ${plan.is_active}`);
        console.log(`   Código Perfect Pay: ${plan.codigo_perfect_pay}`);
      }
    }

    // 4. Verificar webhooks relacionados
    console.log('\n4️⃣ Verificando webhooks relacionados...');
    const { data: webhooks, error: webhookError } = await supabase
      .from('perfect_pay_webhooks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (webhookError) {
      console.error('❌ Erro ao buscar webhooks:', webhookError.message);
    } else {
      console.log(`📊 Webhooks encontrados: ${webhooks.length}`);
      webhooks.forEach((webhook, index) => {
        console.log(`\n📋 Webhook ${index + 1}:`);
        console.log(`   ID: ${webhook.id}`);
        console.log(`   Status: ${webhook.status}`);
        console.log(`   Transaction ID: ${webhook.transaction_id}`);
        console.log(`   Valor: R$ ${(webhook.amount / 100).toFixed(2)}`);
        console.log(`   Criado: ${webhook.created_at}`);
        console.log(`   Processado: ${webhook.processed_at || 'Não processado'}`);
        console.log(`   Erro: ${webhook.error_message || 'Nenhum'}`);
        console.log(`   Dados: ${JSON.stringify(webhook.webhook_data, null, 2)}`);
      });
    }

    // 5. Verificar se há problemas de processamento
    console.log('\n5️⃣ Análise de problemas...');
    const failedWebhooks = webhooks.filter(w => w.status === 'failed' || w.error_message);
    if (failedWebhooks.length > 0) {
      console.log(`⚠️ ${failedWebhooks.length} webhook(s) falharam:`);
      failedWebhooks.forEach(webhook => {
        console.log(`   - ${webhook.transaction_id}: ${webhook.error_message}`);
      });
    }

    const unprocessedWebhooks = webhooks.filter(w => !w.processed_at && w.status !== 'failed');
    if (unprocessedWebhooks.length > 0) {
      console.log(`⚠️ ${unprocessedWebhooks.length} webhook(s) não processados:`);
      unprocessedWebhooks.forEach(webhook => {
        console.log(`   - ${webhook.transaction_id}: Status ${webhook.status}`);
      });
    }

  } catch (err) {
    console.error('❌ Erro inesperado durante a investigação:', err.message);
  }
}

investigateSubscription();




