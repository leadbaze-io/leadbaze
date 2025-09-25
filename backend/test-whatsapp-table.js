const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkWhatsAppTable() {
  console.log('🔍 Verificando tabela whatsapp_instances...');
  
  // Testar diretamente se conseguimos acessar a tabela
  console.log('🧪 Testando acesso direto à tabela...');
  const testUserId = '4b518881-21e6-42d5-9958-c794b63d460e';
  
  const { data: instances, error: queryError } = await supabase
    .from('whatsapp_instances')
    .select('*')
    .eq('user_id', testUserId)
    .order('created_at', { ascending: false })
    .limit(1);
    
  if (queryError) {
    console.error('❌ Erro na consulta:', queryError.message);
    console.error('📊 Código do erro:', queryError.code);
    console.error('📊 Detalhes:', queryError.details);
    console.error('📊 Hint:', queryError.hint);
    
    if (queryError.code === '42P01') {
      console.log('💡 Tabela whatsapp_instances NÃO existe!');
      console.log('💡 Execute o SQL em fix-whatsapp-instances-table.sql');
    } else if (queryError.code === '42501') {
      console.log('💡 Erro de permissão - verifique as políticas RLS');
    } else if (queryError.code === 'PGRST301') {
      console.log('💡 Erro de formato da consulta - verifique a sintaxe');
    }
    return;
  }
  
  console.log('✅ Consulta executada com sucesso');
  console.log('📊 Instâncias encontradas:', instances.length);
  
  if (instances.length > 0) {
    console.log('📋 Dados da instância:');
    console.log(JSON.stringify(instances[0], null, 2));
  }
  
  // Testar inserção de uma instância de teste
  console.log('\n🧪 Testando inserção de instância de teste...');
  const { data: newInstance, error: insertError } = await supabase
    .from('whatsapp_instances')
    .insert({
      user_id: testUserId,
      instance_name: `test-instance-${Date.now()}`,
      status: 'disconnected'
    })
    .select()
    .single();
    
  if (insertError) {
    console.error('❌ Erro na inserção:', insertError.message);
    console.error('📊 Código do erro:', insertError.code);
  } else {
    console.log('✅ Inserção executada com sucesso');
    console.log('📋 Nova instância criada:', newInstance.id);
    
    // Limpar instância de teste
    const { error: deleteError } = await supabase
      .from('whatsapp_instances')
      .delete()
      .eq('id', newInstance.id);
      
    if (deleteError) {
      console.error('⚠️ Erro ao limpar instância de teste:', deleteError.message);
    } else {
      console.log('✅ Instância de teste removida');
    }
  }
}

checkWhatsAppTable().catch(console.error);
