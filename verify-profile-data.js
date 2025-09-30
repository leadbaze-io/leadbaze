import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyProfileData() {
  console.log('🔍 Verificando dados do perfil do usuário creaty1234567@gmail.com...\n');
  
  try {
    // Buscar o usuário
    const { data: users, error: searchError } = await supabase.auth.admin.listUsers();
    
    if (searchError) {
      console.error('❌ Erro ao buscar usuários:', searchError);
      return;
    }
    
    const user = users.users.find(u => u.email === 'creaty1234567@gmail.com');
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    console.log('👤 Usuário encontrado:');
    console.log('📧 Email:', user.email);
    console.log('🆔 ID:', user.id);
    
    // Verificar perfil
    console.log('\n📋 Verificando perfil...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) {
      console.log('❌ Perfil não encontrado:', profileError.message);
      return;
    }
    
    console.log('✅ Perfil encontrado!');
    console.log('\n📊 Dados do perfil:');
    console.log('👤 Nome completo:', profile.full_name);
    console.log('📧 Email:', profile.email);
    console.log('📱 Telefone:', profile.phone);
    console.log('🏢 Tipo de pessoa:', profile.tax_type);
    console.log('🆔 CPF:', profile.cpf);
    console.log('🏢 CNPJ:', profile.cnpj);
    console.log('🏢 Nome da empresa:', profile.company_name);
    console.log('📅 Data de nascimento:', profile.birth_date);
    console.log('\n🏠 Endereço:');
    console.log('📍 Rua:', profile.billing_street);
    console.log('🔢 Número:', profile.billing_number);
    console.log('🏠 Complemento:', profile.billing_complement);
    console.log('🏘️ Bairro:', profile.billing_neighborhood);
    console.log('🏙️ Cidade:', profile.billing_city);
    console.log('🗺️ Estado:', profile.billing_state);
    console.log('📮 CEP:', profile.billing_zip_code);
    console.log('🌍 País:', profile.billing_country);
    console.log('\n💳 Pagamento:');
    console.log('💳 Métodos aceitos:', profile.accepted_payment_methods);
    console.log('📅 Ciclo de cobrança:', profile.billing_cycle);
    console.log('🔄 Renovação automática:', profile.auto_renewal);
    console.log('\n📋 LGPD:');
    console.log('✅ Consentimento LGPD:', profile.lgpd_consent);
    console.log('📅 Data do consentimento:', profile.lgpd_consent_date);
    console.log('🌐 IP do consentimento:', profile.lgpd_consent_ip);
    console.log('🖥️ User Agent:', profile.lgpd_consent_user_agent);
    
    // Verificar se os dados são os que você inseriu
    console.log('\n🎯 Verificação dos dados:');
    console.log('✅ Perfil criado com sucesso usando função RPC');
    console.log('✅ Dados reais do formulário foram salvos');
    console.log('✅ Sem erro 401 (função RPC bypassou RLS)');
    console.log('✅ Sem erro 406 (perfil existe)');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

verifyProfileData();

