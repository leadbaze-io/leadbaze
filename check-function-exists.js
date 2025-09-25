import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkFunctionExists() {
  console.log('🔍 Verificando se a função RPC existe...\n');
  
  try {
    // Verificar se a função existe consultando o catálogo do PostgreSQL
    const { data, error } = await supabase
      .from('pg_proc')
      .select('proname, proargnames, proargtypes')
      .eq('proname', 'create_user_profile');
    
    if (error) {
      console.log('❌ Erro ao consultar catálogo:', error.message);
      console.log('📋 Tentando método alternativo...\n');
      
      // Método alternativo: tentar executar a função
      const { data: testData, error: testError } = await supabase.rpc('create_user_profile', {
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
      
      if (testError) {
        if (testError.code === 'PGRST202') {
          console.log('❌ Função RPC não existe');
          console.log('📋 Você precisa executar o SQL no Supabase Dashboard');
          console.log('🔗 Link: https://supabase.com/dashboard/project/lsvwjyhnnzeewuuuykmb/sql');
        } else {
          console.log('✅ Função RPC existe! (erro esperado para UUID inválido)');
          console.log('📝 Erro:', testError.message);
        }
      } else {
        console.log('✅ Função RPC existe e funcionando!');
      }
    } else {
      if (data && data.length > 0) {
        console.log('✅ Função RPC encontrada no catálogo!');
        console.log('📋 Dados:', data[0]);
      } else {
        console.log('❌ Função RPC não encontrada no catálogo');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkFunctionExists();

