import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function manualConfirmUser() {
  console.log('🔧 Confirmando manualmente o usuário creaty1234567@gmail.com...\n');
  
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
    
    // Confirmar o email manualmente
    console.log('\n📧 Confirmando email...');
    const { data: confirmData, error: confirmError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        email_confirm: true
      }
    );
    
    if (confirmError) {
      console.error('❌ Erro ao confirmar email:', confirmError);
      return;
    }
    
    console.log('✅ Email confirmado com sucesso!');
    console.log('📧 Email confirmado em:', confirmData.user.email_confirmed_at);
    
    // Testar login novamente
    console.log('\n🧪 Testando login após confirmação...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'creaty1234567@gmail.com',
      password: '@@DeusGod975432'
    });
    
    if (loginError) {
      console.log('❌ Erro no login:', loginError.message);
    } else {
      console.log('✅ Login bem-sucedido!');
      console.log('👤 Usuário logado:', loginData.user.email);
      console.log('🎯 Status:', loginData.user.email_confirmed_at ? 'CONFIRMADO' : 'NÃO CONFIRMADO');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

manualConfirmUser();

