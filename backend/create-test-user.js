require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  try {
    console.log('👤 Criando usuário de teste para pagamento...');
    
    const testEmail = 'teste.pagamento@exemplo.com';
    const testPassword = 'Teste123!@#';
    const testName = 'Usuário Teste Pagamento';
    
    // 1. Criar usuário no auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: testName
      }
    });
    
    if (authError) {
      console.error('❌ Erro ao criar usuário no auth:', authError.message);
      return;
    }
    
    console.log('✅ Usuário criado no auth:');
    console.log('  - ID:', authData.user.id);
    console.log('  - Email:', authData.user.email);
    console.log('  - Nome:', authData.user.user_metadata.full_name);
    
    // 2. Criar perfil do usuário
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authData.user.id,
        email: testEmail,
        full_name: testName,
        bonus_leads: 30,
        bonus_leads_used: 0
      })
      .select()
      .single();
    
    if (profileError) {
      console.error('❌ Erro ao criar perfil:', profileError.message);
    } else {
      console.log('✅ Perfil criado:');
      console.log('  - ID:', profileData.id);
      console.log('  - Email:', profileData.email);
      console.log('  - Nome:', profileData.full_name);
      console.log('  - Bonus leads:', profileData.bonus_leads);
    }
    
    console.log('\n🎯 Usuário de teste criado com sucesso!');
    console.log('📝 Dados para teste:');
    console.log('  - User ID:', authData.user.id);
    console.log('  - Email:', testEmail);
    console.log('  - Senha:', testPassword);
    console.log('  - Nome:', testName);
    
    console.log('\n🚀 Agora você pode testar o pagamento com este usuário!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executar criação
createTestUser()
  .then(() => {
    console.log('✅ Criação concluída');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erro na criação:', error.message);
    process.exit(1);
  });









