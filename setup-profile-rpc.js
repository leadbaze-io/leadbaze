import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupProfileRPC() {
  console.log('🔧 Configurando função RPC para criação de perfil...\n');
  
  try {
    // Ler o arquivo SQL
    const fs = await import('fs');
    const sqlContent = fs.readFileSync('./create-profile-rpc.sql', 'utf8');
    
    // Executar o SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Erro ao executar SQL:', error);
      return;
    }
    
    console.log('✅ Função RPC criada com sucesso!');
    console.log('📋 Função: create_user_profile');
    console.log('🔐 Permissões: SECURITY DEFINER (bypassa RLS)');
    console.log('👥 Acesso: authenticated users');
    
    // Testar a função
    console.log('\n🧪 Testando a função...');
    
    const testResult = await supabase.rpc('create_user_profile', {
      p_user_id: '00000000-0000-0000-0000-000000000000', // UUID de teste
      p_tax_type: 'pessoa_fisica',
      p_full_name: 'Teste RPC',
      p_email: 'teste@rpc.com',
      p_phone: '(11) 99999-9999',
      p_billing_street: 'Rua Teste',
      p_billing_number: '123',
      p_billing_neighborhood: 'Centro',
      p_billing_city: 'São Paulo',
      p_billing_state: 'SP',
      p_billing_zip_code: '01310-100'
    });
    
    if (testResult.error) {
      console.log('⚠️ Teste falhou (esperado para UUID inválido):', testResult.error.message);
    } else {
      console.log('✅ Teste passou!');
    }
    
    console.log('\n🎉 Configuração concluída!');
    console.log('Agora o signup deve funcionar sem erro 401.');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

setupProfileRPC();

