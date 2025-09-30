require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function reprocessFailedWebhooks() {
  console.log('🔍 ===== REPROCESSANDO WEBHOOKS FALHADOS =====\n');

  try {
    // 1. Buscar webhooks com erro "Plano não encontrado"
    console.log('1️⃣ Buscando webhooks com erro "Plano não encontrado"...');
    const { data: failedWebhooks, error: failedError } = await supabase
      .from('payment_webhooks')
      .select('*')
      .eq('error_message', 'Plano não encontrado')
      .order('created_at', { ascending: false });

    if (failedError) {
      console.error('❌ Erro ao buscar webhooks falhados:', failedError.message);
      return;
    }

    console.log(`📊 Webhooks com erro "Plano não encontrado": ${failedWebhooks.length}`);

    if (failedWebhooks.length === 0) {
      console.log('✅ Nenhum webhook com erro encontrado!');
      return;
    }

    // 2. Mapeamento correto dos códigos
    const planUuidMap = {
      'PPLQQNGCO': '460a8b88-f828-4b18-9d42-4b8ad5333d61', // Start
      'PPLQQNGCM': 'e9004fad-85ab-41b8-9416-477e41e8bcc9', // Scale
      'PPLQQNGCN': 'a961e361-75d0-40cf-9461-62a7802a1948'  // Enterprise
    };

    // 3. Processar cada webhook falhado
    for (let i = 0; i < failedWebhooks.length; i++) {
      const webhook = failedWebhooks[i];
      console.log(`\n📋 Processando webhook ${i + 1}/${failedWebhooks.length}:`);
      console.log(`   ID: ${webhook.id}`);
      console.log(`   Transaction Code: ${webhook.raw_data.code}`);
      console.log(`   Customer Email: ${webhook.raw_data.customer?.email}`);
      console.log(`   Plan Code: ${webhook.raw_data.plan?.code}`);
      console.log(`   Sale Amount: R$ ${webhook.raw_data.sale_amount}`);

      try {
        // Verificar se o webhook tem dados válidos
        if (!webhook.raw_data || !webhook.raw_data.customer?.email) {
          console.log('⚠️ Webhook sem dados válidos - pulando');
          continue;
        }

        const customerEmail = webhook.raw_data.customer.email;
        const planCode = webhook.raw_data.plan?.code;
        const transactionCode = webhook.raw_data.code;

        // Buscar usuário por email
        const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
        if (usersError) {
          console.log('❌ Erro ao buscar usuários:', usersError.message);
          continue;
        }

        const user = users.users.find(u => u.email === customerEmail);
        if (!user) {
          console.log(`❌ Usuário não encontrado: ${customerEmail}`);
          continue;
        }

        console.log(`✅ Usuário encontrado: ${user.id}`);

        // Verificar se já existe assinatura com este transaction_id
        const { data: existingSubs, error: subsError } = await supabase
          .from('user_payment_subscriptions')
          .select('*')
          .eq('perfect_pay_transaction_id', transactionCode);

        if (subsError) {
          console.log('❌ Erro ao verificar assinaturas existentes:', subsError.message);
          continue;
        }

        if (existingSubs && existingSubs.length > 0) {
          console.log('⚠️ Já existe assinatura com este transaction_id - pulando');
          continue;
        }

        // Mapear código do plano
        const planId = planUuidMap[planCode];
        if (!planId) {
          console.log(`❌ Código do plano não encontrado: ${planCode}`);
          continue;
        }

        console.log(`✅ Plano mapeado: ${planCode} -> ${planId}`);

        // Buscar dados do plano
        const { data: plan, error: planError } = await supabase
          .from('payment_plans')
          .select('*')
          .eq('id', planId)
          .single();

        if (planError || !plan) {
          console.log('❌ Erro ao buscar plano:', planError?.message);
          continue;
        }

        console.log(`✅ Plano encontrado: ${plan.name} (${plan.display_name})`);

        // Criar assinatura
        const now = new Date();
        const nextChargeDate = webhook.raw_data.subscription?.next_charge_date ? 
          new Date(webhook.raw_data.subscription.next_charge_date) :
          new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 dias se não houver subscription

        const subscriptionData = {
          user_id: user.id,
          plan_id: planId,
          status: 'active',
          leads_balance: plan.leads_included,
          leads_bonus: 0,
          first_payment_date: webhook.raw_data.date_approved,
          current_period_start: webhook.raw_data.date_approved,
          current_period_end: nextChargeDate.toISOString(),
          is_refund_eligible: true,
          refund_deadline: nextChargeDate.toISOString(),
          perfect_pay_transaction_id: transactionCode,
          perfect_pay_cancelled: false,
          requires_manual_cancellation: false,
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        };

        const { data: newSubscription, error: subscriptionError } = await supabase
          .from('user_payment_subscriptions')
          .insert(subscriptionData)
          .select()
          .single();

        if (subscriptionError) {
          console.log('❌ Erro ao criar assinatura:', subscriptionError.message);
          continue;
        }

        console.log('✅ Assinatura criada com sucesso!');
        console.log(`   ID: ${newSubscription.id}`);
        console.log(`   Status: ${newSubscription.status}`);
        console.log(`   Leads: ${newSubscription.leads_balance}`);

        // Atualizar webhook para remover erro
        const { error: updateError } = await supabase
          .from('payment_webhooks')
          .update({
            subscription_id: newSubscription.id,
            transaction_id: transactionCode,
            error_message: null
          })
          .eq('id', webhook.id);

        if (updateError) {
          console.log('⚠️ Erro ao atualizar webhook:', updateError.message);
        } else {
          console.log('✅ Webhook atualizado com sucesso!');
        }

      } catch (err) {
        console.log('❌ Erro ao processar webhook:', err.message);
      }
    }

    console.log('\n🎉 REPROCESSAMENTO CONCLUÍDO!');
    console.log('💡 Todos os webhooks falhados foram reprocessados com os códigos corrigidos.');

  } catch (err) {
    console.error('❌ Erro inesperado:', err.message);
  }
}

reprocessFailedWebhooks();

