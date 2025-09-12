/**
 * Script para testar a conectividade com WhatsApp/Evolution API
 * Execute este script no console do navegador para diagnosticar problemas
 */

// Função para testar se o backend está respondendo
async function testBackendHealth() {
  console.log('🔍 Testando saúde do backend...');
  
  try {
    const response = await fetch('http://localhost:3001/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend está saudável:', data);
      return true;
    } else {
      console.error('❌ Backend retornou erro:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao conectar com backend:', error);
    return false;
  }
}

// Função para testar criação de instância
async function testCreateInstance() {
  console.log('🔍 Testando criação de instância...');
  
  const testInstanceName = `test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  try {
    const response = await fetch('http://localhost:3001/api/create-instance-and-qrcode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        instanceName: testInstanceName, 
        userName: 'Test User' 
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Instância criada com sucesso:', data);
      
      // Testar verificação de estado
      await testConnectionState(testInstanceName);
      
      // Limpar instância de teste
      await testDeleteInstance(testInstanceName);
      
      return true;
    } else {
      const errorData = await response.json();
      console.error('❌ Erro ao criar instância:', errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao criar instância:', error);
    return false;
  }
}

// Função para testar verificação de estado
async function testConnectionState(instanceName) {
  console.log('🔍 Testando verificação de estado...');
  
  try {
    const response = await fetch(`http://localhost:3001/api/connection-state/${instanceName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Estado da conexão:', data);
      return true;
    } else {
      const errorData = await response.json();
      console.error('❌ Erro ao verificar estado:', errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao verificar estado:', error);
    return false;
  }
}

// Função para testar deleção de instância
async function testDeleteInstance(instanceName) {
  console.log('🔍 Testando deleção de instância...');
  
  try {
    const response = await fetch(`http://localhost:3001/api/delete-instance/${instanceName}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      console.log('✅ Instância deletada com sucesso');
      return true;
    } else {
      const errorData = await response.json();
      console.error('❌ Erro ao deletar instância:', errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao deletar instância:', error);
    return false;
  }
}

// Função para testar banco de dados
async function testDatabase() {
  console.log('🔍 Testando banco de dados...');
  
  try {
    // Verificar se a tabela whatsapp_instances existe
    const { data, error } = await supabase
      .from('whatsapp_instances')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Erro ao acessar tabela whatsapp_instances:', error);
      return false;
    }

    console.log('✅ Tabela whatsapp_instances acessível');
    
    // Verificar instâncias existentes
    const { data: instances, error: instancesError } = await supabase
      .from('whatsapp_instances')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (instancesError) {
      console.error('❌ Erro ao buscar instâncias:', instancesError);
      return false;
    }

    console.log('📊 Instâncias encontradas:', instances);
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar banco de dados:', error);
    return false;
  }
}

// Função principal para executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando testes de conectividade WhatsApp...');
  console.log('=====================================');
  
  const results = {
    backend: await testBackendHealth(),
    database: await testDatabase(),
    instance: await testCreateInstance()
  };
  
  console.log('=====================================');
  console.log('📊 Resultados dos testes:');
  console.log('Backend:', results.backend ? '✅ OK' : '❌ FALHOU');
  console.log('Database:', results.database ? '✅ OK' : '❌ FALHOU');
  console.log('Instance:', results.instance ? '✅ OK' : '❌ FALHOU');
  
  if (results.backend && results.database && results.instance) {
    console.log('🎉 Todos os testes passaram! O sistema está funcionando corretamente.');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique os logs acima para mais detalhes.');
  }
  
  return results;
}

// Executar testes automaticamente
runAllTests();



