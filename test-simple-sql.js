import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSimpleSQL() {
  console.log('🧪 Testando execução de SQL simples...\n');
  
  try {
    // Testar uma consulta simples
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Erro na consulta simples:', error.message);
    } else {
      console.log('✅ Conexão com banco funcionando');
      console.log('📊 Dados:', data);
    }
    
    // Tentar executar a função RPC
    console.log('\n🔧 Testando função RPC...');
    const { data: rpcData, error: rpcError } = await supabase.rpc('create_user_profile', {
      p_user_id: '00000000-0000-0000-0000-000000000000',
      p_tax_type: 'pessoa_fisica',
      p_full_name: 'Teste',
      p_email: 'teste@teste.com',
      p_phone: '(11) 99999-9999',
      p_billing_street: 'Rua Teste',
      p_billing_number: '123',
      p_billing_neighborhood: 'Centro',
      p_billing_city: 'São Paulo',
      p_billing_state: 'SP',
      p_billing_zip_code: '01310-100'
    });
    
    if (rpcError) {
      if (rpcError.code === 'PGRST202') {
        console.log('❌ Função RPC não existe');
        console.log('📋 Você precisa executar o SQL no Supabase Dashboard');
        console.log('🔗 Link: https://supabase.com/dashboard/project/lsvwjyhnnzeewuuuykmb/sql');
        console.log('\n📄 SQL para executar:');
        console.log('=====================================');
        
        // Mostrar o SQL
        const fs = await import('fs');
        const sqlContent = fs.readFileSync('./create-profile-rpc.sql', 'utf8');
        console.log(sqlContent);
        console.log('=====================================');
        
      } else {
        console.log('⚠️ Erro diferente (função pode existir):', rpcError.message);
      }
    } else {
      console.log('✅ Função RPC existe e funcionando!');
      console.log('📊 Resultado:', rpcData);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testSimpleSQL();

