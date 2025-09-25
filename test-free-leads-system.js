// Script para testar o sistema de leads gratuitos
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testFreeLeadsSystem() {
  console.log('🧪 Testando sistema de leads gratuitos...\n');

  try {
    // 1. Verificar se o plano gratuito existe
    console.log('1️⃣ Verificando plano gratuito...');
    const { data: freePlan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('name', 'free_trial')
      .single();

    if (planError) {
      console.error('❌ Erro ao buscar plano gratuito:', planError);
      return;
    }

    console.log('✅ Plano gratuito encontrado:', {
      id: freePlan.id,
      name: freePlan.name,
      display_name: freePlan.display_name,
      leads_limit: freePlan.leads_limit,
      price_monthly: freePlan.price_monthly
    });

    // 2. Testar função de criação de assinatura gratuita
    console.log('\n2️⃣ Testando criação de assinatura gratuita...');
    const testUserId = '00000000-0000-0000-0000-000000000001'; // UUID de teste
    
    const { data: createResult, error: createError } = await supabase.rpc('create_free_trial_subscription', {
      p_user_id: testUserId
    });

    if (createError) {
      console.error('❌ Erro ao criar assinatura gratuita:', createError);
    } else {
      console.log('✅ Assinatura gratuita criada:', createResult);
    }

    // 3. Testar verificação de disponibilidade de leads
    console.log('\n3️⃣ Testando verificação de leads...');
    const { data: availabilityResult, error: availabilityError } = await supabase.rpc('check_leads_availability_updated', {
      p_user_id: testUserId,
      p_leads_needed: 5
    });

    if (availabilityError) {
      console.error('❌ Erro ao verificar disponibilidade:', availabilityError);
    } else {
      console.log('✅ Disponibilidade verificada:', availabilityResult);
    }

    // 4. Testar consumo de leads
    console.log('\n4️⃣ Testando consumo de leads...');
    const { data: consumeResult, error: consumeError } = await supabase.rpc('consume_leads_updated', {
      p_user_id: testUserId,
      p_leads_consumed: 3,
      p_operation_reason: 'test_consumption'
    });

    if (consumeError) {
      console.error('❌ Erro ao consumir leads:', consumeError);
    } else {
      console.log('✅ Leads consumidos:', consumeResult);
    }

    // 5. Verificar status final da assinatura
    console.log('\n5️⃣ Verificando status final...');
    const { data: statusResult, error: statusError } = await supabase.rpc('get_user_subscription_with_free_trial', {
      p_user_id: testUserId
    });

    if (statusError) {
      console.error('❌ Erro ao verificar status:', statusError);
    } else {
      console.log('✅ Status final:', statusResult);
    }

    console.log('\n🎉 Teste do sistema de leads gratuitos concluído!');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar teste
testFreeLeadsSystem();

