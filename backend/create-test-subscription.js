const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createTestSubscription() {
  console.log('🧪 [TESTE] ===== CRIANDO ASSINATURA DE TESTE =====\n');

  try {
    const userId = '4b518881-21e6-42d5-9958-c794b63d460e';
    
    // PASSO 1: Verificar se o usuário existe
    console.log('📋 [PASSO 1] Verificando se o usuário existe...');
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError) {
      console.error('❌ [PASSO 1] Erro ao buscar usuário:', userError.message);
      return;
    }
    
    if (!userData?.user) {
      console.error('❌ [PASSO 1] Usuário não encontrado:', userId);
      return;
    }
    
    console.log('✅ [PASSO 1] Usuário encontrado:', userData.user.email);

    // PASSO 2: Buscar um plano real
    console.log('\n📋 [PASSO 2] Buscando plano real...');
    const { data: plans, error: plansError } = await supabase
      .from('payment_plans')
      .select('*')
      .limit(1);

    if (plansError || !plans || plans.length === 0) {
      console.error('❌ [PASSO 2] Erro ao buscar planos:', plansError?.message);
      return;
    }
    const plan = plans[0];
    console.log('✅ [PASSO 2] Plano encontrado:', plan.display_name);

    // PASSO 3: Verificar se já existe assinatura ativa
    console.log('\n📋 [PASSO 3] Verificando assinaturas existentes...');
    const { data: existingSubs, error: subError } = await supabase
      .from('user_payment_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (subError) {
      console.error('❌ [PASSO 3] Erro ao buscar assinaturas:', subError.message);
      return;
    }

    if (existingSubs && existingSubs.length > 0) {
      console.log('⚠️ [PASSO 3] Usuário já possui assinatura ativa:', existingSubs[0].id);
      console.log('📋 [PASSO 3] Status:', existingSubs[0].status);
      console.log('📋 [PASSO 3] Leads restantes:', existingSubs[0].leads_balance);
      console.log('📋 [PASSO 3] Acesso até:', existingSubs[0].current_period_end);
      return;
    }

    // PASSO 4: Criar assinatura de teste
    console.log('\n📋 [PASSO 4] Criando assinatura de teste...');
    const currentDate = new Date();
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const subscriptionData = {
      user_id: userId,
      plan_id: plan.id,
      status: 'active',
      perfect_pay_transaction_id: 'TEST_TXN_' + Date.now(),
      leads_balance: plan.leads_included,
      current_period_start: currentDate.toISOString(),
      current_period_end: nextMonth.toISOString(),
      first_payment_date: currentDate.toISOString(),
      refund_deadline: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    const { data: newSubscription, error: createError } = await supabase
      .from('user_payment_subscriptions')
      .insert(subscriptionData)
      .select()
      .single();

    if (createError) {
      console.error('❌ [PASSO 4] Erro ao criar assinatura:', createError.message);
      return;
    }

    console.log('✅ [PASSO 4] Assinatura criada com sucesso!');
    console.log('📋 [PASSO 4] ID da assinatura:', newSubscription.id);
    console.log('📋 [PASSO 4] Plano:', plan.display_name);
    console.log('📋 [PASSO 4] Leads incluídos:', plan.leads_included);
    console.log('📋 [PASSO 4] Acesso até:', new Date(newSubscription.current_period_end).toLocaleDateString('pt-BR'));
    console.log('📋 [PASSO 4] Status:', newSubscription.status);

    console.log('\n🎉 [TESTE] ===== ASSINATURA DE TESTE CRIADA! =====');
    console.log('✅ [TESTE] Usuário pode agora testar a interface de cancelamento');
    console.log('✅ [TESTE] Acesse o perfil do usuário para ver os botões de cancelamento');
    console.log('✅ [TESTE] Teste o modal de cancelamento com os novos avisos');

  } catch (error) {
    console.error('❌ [TESTE] Erro inesperado:', error.message);
  }
}

createTestSubscription().catch(console.error);
