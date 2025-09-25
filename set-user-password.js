import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setUserPassword() {
  console.log('🔧 Definindo senha para o usuário creaty1234567@gmail.com...\n');
  
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
    
    console.log('👤 Usuário encontrado:', user.email);
    console.log('🆔 ID:', user.id);
    
    // Definir a senha
    console.log('\n🔐 Definindo senha: @@DeusGod@@975432');
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        password: '@@DeusGod@@975432'
      }
    );
    
    if (updateError) {
      console.error('❌ Erro ao definir senha:', updateError);
      return;
    }
    
    console.log('✅ Senha definida com sucesso!');
    
    // Testar login
    console.log('\n🧪 Testando login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'creaty1234567@gmail.com',
      password: '@@DeusGod@@975432'
    });
    
    if (loginError) {
      console.log('❌ Erro no login:', loginError.message);
    } else {
      console.log('✅ Login bem-sucedido!');
      console.log('👤 Usuário logado:', loginData.user.email);
      console.log('🎯 Status:', loginData.user.email_confirmed_at ? 'CONFIRMADO' : 'NÃO CONFIRMADO');
      console.log('🆔 ID do usuário:', loginData.user.id);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

setUserPassword();

