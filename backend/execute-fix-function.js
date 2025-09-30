const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://lsvwjyhnnzeewuuuykmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'
);

async function executeFixFunction() {
  console.log('🚀 ===== EXECUTANDO CORREÇÃO DA FUNÇÃO RPC =====\n');

  try {
    // Ler o arquivo SQL
    const sql = fs.readFileSync('fix-leads-availability-function.sql', 'utf8');
    console.log('📝 SQL carregado com sucesso');

    // Executar o SQL diretamente
    const { data, error } = await supabase.rpc('exec', { sql });
    
    if (error) {
      console.error('❌ Erro ao executar SQL:', error);
      return;
    }

    console.log('✅ Função RPC corrigida com sucesso!');
    console.log('📊 Resultado:', data);

    // Testar a função corrigida
    console.log('\n🧪 Testando função corrigida...');
    const { data: testResult, error: testError } = await supabase.rpc('check_leads_availability_simple', {
      p_user_id: '39dc6c62-6dea-4222-adb5-7075fd704189',
      p_leads_to_generate: 1
    });

    if (testError) {
      console.error('❌ Erro ao testar função:', testError);
    } else {
      console.log('✅ Teste da função:');
      console.log(JSON.stringify(testResult, null, 2));
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

executeFixFunction();










