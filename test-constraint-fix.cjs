// Script para testar a correção da constraint
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lsvwjyhnnzeewuuuykmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'
);

async function testConstraintFix() {
  console.log('🔧 Testando correção da constraint...\n');

  try {
    // 1. Executar SQL para corrigir constraint
    console.log('1️⃣ Executando correção da constraint...');
    const { data: constraintResult, error: constraintError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Remover constraint antiga se existir
        ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_tax_type_check;
        
        -- Criar nova constraint com valores corretos
        ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_tax_type_check 
        CHECK (tax_type IN ('individual', 'company', 'pessoa_fisica', 'pessoa_juridica'));
      `
    });

    if (constraintError) {
      console.error('❌ Erro ao corrigir constraint:', constraintError);
    } else {
      console.log('✅ Constraint corrigida:', constraintResult);
    }

    // 2. Testar criação de perfil com pessoa_fisica
    console.log('\n2️⃣ Testando criação com pessoa_fisica...');
    const { data: profileResult, error: profileError } = await supabase.rpc('create_user_profile', {
      p_user_id: '00000000-0000-0000-0000-000000000005',
      p_tax_type: 'pessoa_fisica',
      p_full_name: 'Teste Pessoa Física',
      p_email: 'pessoafisica@teste.com',
      p_phone: '11999999999',
      p_billing_street: 'Rua Teste',
      p_billing_number: '123',
      p_billing_neighborhood: 'Centro',
      p_billing_city: 'São Paulo',
      p_billing_state: 'SP',
      p_billing_zip_code: '01234567',
      p_cpf: '12345678901',
      p_birth_date: '1990-01-01'
    });

    if (profileError) {
      console.error('❌ Erro ao criar perfil pessoa_fisica:', profileError);
    } else {
      console.log('✅ Perfil pessoa_fisica criado:', profileResult);
    }

    // 3. Testar criação de perfil com pessoa_juridica
    console.log('\n3️⃣ Testando criação com pessoa_juridica...');
    const { data: profileResult2, error: profileError2 } = await supabase.rpc('create_user_profile', {
      p_user_id: '00000000-0000-0000-0000-000000000006',
      p_tax_type: 'pessoa_juridica',
      p_full_name: 'Teste Pessoa Jurídica',
      p_email: 'pessoajuridica@teste.com',
      p_phone: '11999999999',
      p_billing_street: 'Rua Teste',
      p_billing_number: '123',
      p_billing_neighborhood: 'Centro',
      p_billing_city: 'São Paulo',
      p_billing_state: 'SP',
      p_billing_zip_code: '01234567',
      p_cnpj: '12345678000195',
      p_company_name: 'Empresa Teste'
    });

    if (profileError2) {
      console.error('❌ Erro ao criar perfil pessoa_juridica:', profileError2);
    } else {
      console.log('✅ Perfil pessoa_juridica criado:', profileResult2);
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar teste
testConstraintFix();

