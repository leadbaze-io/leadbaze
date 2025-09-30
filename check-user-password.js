import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserPassword() {
  console.log('🔍 Verificando senha do usuário creaty1234567@gmail.com...\n');
  
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
    console.log('📅 Criado em:', user.created_at);
    console.log('📧 Email confirmado em:', user.email_confirmed_at);
    console.log('🔐 Último sign in:', user.last_sign_in_at);
    console.log('🔑 Tem senha:', user.encrypted_password ? 'SIM' : 'NÃO');
    console.log('🔑 Hash da senha:', user.encrypted_password ? '***' + user.encrypted_password.slice(-10) : 'NENHUM');
    
    // Testar diferentes senhas
    const testPasswords = [
      '@@DeusGod975432',
      '123456',
      'creaty1234567',
      'DeusGod975432',
      '975432'
    ];
    
    console.log('\n🧪 Testando diferentes senhas...');
    
    for (const password of testPasswords) {
      console.log(`\n🔐 Testando senha: ${password}`);
      
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'creaty1234567@gmail.com',
        password: password
      });
      
      if (loginError) {
        console.log(`❌ Falhou: ${loginError.message}`);
      } else {
        console.log(`✅ SUCESSO! Senha correta: ${password}`);
        console.log('👤 Usuário logado:', loginData.user.email);
        break;
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkUserPassword();

