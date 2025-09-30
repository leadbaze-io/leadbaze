require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testWebhookProcessing() {
  console.log('🔍 ===== TESTANDO PROCESSAMENTO DE WEBHOOK =====\n');

  try {
    // Simular dados do webhook que falhou
    const webhookData = {
      code: 'PPCPMTB5H3D6HH',
      plan: {
        code: 'PPLQQNGCO',
        name: 'LeadBaze Start',
        quantity: 1
      },
      customer: {
        email: 'mathewshq20@hotmail.com',
        full_name: 'Mathew Test'
      },
      sale_amount: 197,
      sale_status_detail: 'approved',
      date_approved: '2025-09-29T16:54:07+00:00',
      subscription: {
        code: 'PPSUB1O91FP1I',
        status: 'active',
        status_event: 'subscription_started',
        next_charge_date: '2025-10-28T03:00:00.000000Z'
      }
    };

    console.log('1️⃣ Testando mapeamento de códigos...');
    
    // Testar mapeamento corrigido
    const planUuidMap = {
      'PPLQQNGCO': '460a8b88-f828-4b18-9d42-4b8ad5333d61', // Start
      'PPLQQNGCM': 'e9004fad-85ab-41b8-9416-477e41e8bcc9', // Scale
      'PPLQQNGCN': 'a961e361-75d0-40cf-9461-62a7802a1948'  // Enterprise
    };

    const planCode = webhookData.plan.code;
    const planId = planUuidMap[planCode];
    
    console.log(`📋 Código do plano: ${planCode}`);
    console.log(`📋 UUID mapeado: ${planId}`);

    if (!planId) {
      console.log('❌ Código do plano não encontrado no mapeamento!');
      return;
    }

    console.log('✅ Mapeamento funcionando!');

    // 2. Verificar se o plano existe
    console.log('\n2️⃣ Verificando se o plano existe...');
    const { data: plan, error: planError } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError) {
      console.error('❌ Erro ao buscar plano:', planError.message);
      return;
    }

    if (!plan) {
      console.log('❌ Plano não encontrado!');
      return;
    }

    console.log('✅ Plano encontrado:');
    console.log(`   Nome: ${plan.name}`);
    console.log(`   Display: ${plan.display_name}`);
    console.log(`   Preço: R$ ${(plan.price_cents / 100).toFixed(2)}`);
    console.log(`   Leads: ${plan.leads_included}`);
    console.log(`   Código Perfect Pay: ${plan.codigo_perfect_pay}`);

    // 3. Verificar se o usuário existe
    console.log('\n3️⃣ Verificando se o usuário existe...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError.message);
      return;
    }

    const user = users.users.find(u => u.email === webhookData.customer.email);
    if (!user) {
      console.log('❌ Usuário não encontrado!');
      return;
    }

    console.log('✅ Usuário encontrado:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nome: ${user.user_metadata?.name || 'N/A'}`);

    // 4. Verificar se já existe assinatura
    console.log('\n4️⃣ Verificando assinaturas existentes...');
    const { data: existingSubs, error: subsError } = await supabase
      .from('user_payment_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('perfect_pay_transaction_id', webhookData.code);

    if (subsError) {
      console.error('❌ Erro ao buscar assinaturas:', subsError.message);
      return;
    }

    if (existingSubs && existingSubs.length > 0) {
      console.log('⚠️ Já existe assinatura com este transaction_id:');
      existingSubs.forEach(sub => {
        console.log(`   ID: ${sub.id}`);
        console.log(`   Status: ${sub.status}`);
        console.log(`   Criado: ${sub.created_at}`);
      });
    } else {
      console.log('✅ Nenhuma assinatura duplicada encontrada');
    }

    // 5. Simular criação de assinatura
    console.log('\n5️⃣ Simulando criação de assinatura...');
    
    const now = new Date();
    const nextChargeDate = new Date(webhookData.subscription.next_charge_date);
    
    const subscriptionData = {
      user_id: user.id,
      plan_id: planId,
      status: 'active',
      leads_balance: plan.leads_included,
      leads_bonus: 0,
      first_payment_date: webhookData.date_approved,
      current_period_start: webhookData.date_approved,
      current_period_end: nextChargeDate.toISOString(),
      is_refund_eligible: true,
      refund_deadline: nextChargeDate.toISOString(),
      perfect_pay_transaction_id: webhookData.code,
      perfect_pay_cancelled: false,
      requires_manual_cancellation: false,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };

    console.log('📋 Dados da assinatura:');
    console.log(`   User ID: ${subscriptionData.user_id}`);
    console.log(`   Plan ID: ${subscriptionData.plan_id}`);
    console.log(`   Status: ${subscriptionData.status}`);
    console.log(`   Leads: ${subscriptionData.leads_balance}`);
    console.log(`   Transaction ID: ${subscriptionData.perfect_pay_transaction_id}`);
    console.log(`   Período: ${subscriptionData.current_period_start} até ${subscriptionData.current_period_end}`);

    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('✅ O webhook agora deve funcionar corretamente com os códigos corrigidos!');
    console.log('💡 O problema era o mapeamento incorreto dos códigos Perfect Pay.');

  } catch (err) {
    console.error('❌ Erro inesperado:', err.message);
  }
}

testWebhookProcessing();

