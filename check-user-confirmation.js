import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserConfirmation() {
  console.log('🔍 Verificando confirmação do usuário creaty1234567@gmail.com...\n');
  
  try {
    // Buscar o usuário pelo email
    const { data: users, error: searchError } = await supabase.auth.admin.listUsers();
    
    if (searchError) {
      console.error('❌ Erro ao buscar usuários:', searchError);
      return;
    }
    
    // Encontrar o usuário específico
    const user = users.users.find(u => u.email === 'creaty1234567@gmail.com');
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    console.log('✅ Usuário encontrado:');
    console.log('📧 Email:', user.email);
    console.log('🆔 ID:', user.id);
    console.log('📅 Criado em:', user.created_at);
    console.log('📧 Email confirmado em:', user.email_confirmed_at);
    console.log('🔐 Último sign in:', user.last_sign_in_at);
    console.log('📱 Telefone confirmado:', user.phone_confirmed_at);
    console.log('🎯 Status:', user.email_confirmed_at ? 'CONFIRMADO' : 'NÃO CONFIRMADO');
    
    // Verificar se tem perfil
    console.log('\n🔍 Verificando perfil...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) {
      console.log('❌ Perfil não encontrado:', profileError.message);
    } else {
      console.log('✅ Perfil encontrado:');
      console.log('👤 Nome:', profile.full_name);
      console.log('📧 Email:', profile.email);
      console.log('📱 Telefone:', profile.phone);
    }
    
    // Tentar fazer login para testar
    console.log('\n🧪 Testando login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'creaty1234567@gmail.com',
      password: '@@DeusGod975432'
    });
    
    if (loginError) {
      console.log('❌ Erro no login:', loginError.message);
    } else {
      console.log('✅ Login bem-sucedido!');
      console.log('👤 Usuário logado:', loginData.user.email);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkUserConfirmation();

