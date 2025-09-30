// Script para testar a criação de perfil
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testProfileCreation() {
  console.log('🧪 Testando criação de perfil...\n');

  try {
    // 1. Verificar se a função existe
    console.log('1️⃣ Verificando se a função create_user_profile existe...');
    const { data: functions, error: functionsError } = await supabase
      .from('pg_proc')
      .select('proname, proargtypes')
      .eq('proname', 'create_user_profile');

    if (functionsError) {
      console.error('❌ Erro ao verificar funções:', functionsError);
    } else {
      console.log('✅ Funções encontradas:', functions);
    }

    // 2. Testar a função com dados de exemplo
    console.log('\n2️⃣ Testando função create_user_profile...');
    const testUserId = '00000000-0000-0000-0000-000000000002';
    
    const { data: profileResult, error: profileError } = await supabase.rpc('create_user_profile', {
      p_user_id: testUserId,
      p_tax_type: 'individual',
      p_full_name: 'Teste Usuário',
      p_email: 'teste@exemplo.com',
      p_phone: '11999999999',
      p_billing_street: 'Rua Teste',
      p_billing_number: '123',
      p_billing_neighborhood: 'Centro',
      p_billing_city: 'São Paulo',
      p_billing_state: 'SP',
      p_billing_zip_code: '01234567',
      p_cpf: '12345678901',
      p_birth_date: '1990-01-01',
      p_company_name: 'Empresa Teste',
      p_billing_complement: 'Apto 1',
      p_billing_country: 'BR',
      p_accepted_payment_methods: ['credit_card', 'pix'],
      p_billing_cycle: 'monthly',
      p_auto_renewal: true,
      p_lgpd_consent: true,
      p_lgpd_consent_ip: '127.0.0.1',
      p_lgpd_consent_user_agent: 'Test Script'
    });

    if (profileError) {
      console.error('❌ Erro ao criar perfil:', profileError);
      console.error('Detalhes do erro:', JSON.stringify(profileError, null, 2));
    } else {
      console.log('✅ Perfil criado com sucesso:', profileResult);
    }

    // 3. Verificar se o perfil foi criado na tabela
    console.log('\n3️⃣ Verificando perfil na tabela...');
    const { data: profile, error: profileCheckError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', testUserId)
      .single();

    if (profileCheckError) {
      console.error('❌ Erro ao verificar perfil:', profileCheckError);
    } else {
      console.log('✅ Perfil encontrado na tabela:', profile);
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar teste
testProfileCreation();
