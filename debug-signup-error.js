// Script para debugar o erro de signup
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lsvwjyhnnzeewuuuykmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'
);

async function debugSignupError() {
  console.log('🔍 Debugando erro de signup...\n');

  try {
    // 1. Verificar se a função create_user_profile existe
    console.log('1️⃣ Verificando função create_user_profile...');
    const { data: profileFunctions, error: profileError } = await supabase
      .rpc('create_user_profile', {
        p_user_id: '00000000-0000-0000-0000-000000000003',
        p_tax_type: 'individual',
        p_full_name: 'Teste Debug',
        p_email: 'debug@teste.com',
        p_phone: '11999999999',
        p_billing_street: 'Rua Teste',
        p_billing_number: '123',
        p_billing_neighborhood: 'Centro',
        p_billing_city: 'São Paulo',
        p_billing_state: 'SP',
        p_billing_zip_code: '01234567'
      });

    if (profileError) {
      console.error('❌ Erro na função create_user_profile:', profileError);
    } else {
      console.log('✅ Função create_user_profile funcionando:', profileResult);
    }

    // 2. Verificar se a função create_free_trial_subscription existe
    console.log('\n2️⃣ Verificando função create_free_trial_subscription...');
    const { data: freeTrialResult, error: freeTrialError } = await supabase
      .rpc('create_free_trial_subscription', {
        p_user_id: '00000000-0000-0000-0000-000000000003'
      });

    if (freeTrialError) {
      console.error('❌ Erro na função create_free_trial_subscription:', freeTrialError);
    } else {
      console.log('✅ Função create_free_trial_subscription funcionando:', freeTrialResult);
    }

    // 3. Verificar se o plano gratuito existe
    console.log('\n3️⃣ Verificando plano gratuito...');
    const { data: freePlan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('name', 'free_trial')
      .single();

    if (planError) {
      console.error('❌ Erro ao buscar plano gratuito:', planError);
    } else {
      console.log('✅ Plano gratuito encontrado:', freePlan);
    }

    // 4. Testar criação de perfil sem leads gratuitos
    console.log('\n4️⃣ Testando criação de perfil sem leads gratuitos...');
    const testUserId = '00000000-0000-0000-0000-000000000004';
    
    // Simular apenas a criação do perfil (sem leads gratuitos)
    const { data: profileOnlyResult, error: profileOnlyError } = await supabase.rpc('create_user_profile', {
      p_user_id: testUserId,
      p_tax_type: 'individual',
      p_full_name: 'Teste Sem Leads',
      p_email: 'semleads@teste.com',
      p_phone: '11999999999',
      p_billing_street: 'Rua Teste',
      p_billing_number: '123',
      p_billing_neighborhood: 'Centro',
      p_billing_city: 'São Paulo',
      p_billing_state: 'SP',
      p_billing_zip_code: '01234567'
    });

    if (profileOnlyError) {
      console.error('❌ Erro ao criar perfil sem leads:', profileOnlyError);
    } else {
      console.log('✅ Perfil criado sem leads:', profileOnlyResult);
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar debug
debugSignupError();

