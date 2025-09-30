// Usar fetch nativo do Node.js 18+

async function testPerfectPayAPI() {
  console.log('🔍 ===== TESTE DA API PERFECT PAY =====\n');

  const baseUrl = 'https://app.perfectpay.com.br/api/v1';
  const accessToken = process.env.PERFECT_PAY_ACCESS_TOKEN || 'seu_token_aqui';

  console.log('📋 Configurações:');
  console.log(`   - Base URL: ${baseUrl}`);
  console.log(`   - Token: ${accessToken ? 'Configurado' : 'NÃO CONFIGURADO'}`);
  console.log('');

  // Teste 1: Verificar se a API está acessível
  console.log('1️⃣ TESTE: Verificar acessibilidade da API');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const response = await fetch(`${baseUrl}/sales/get`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        start_date_sale: '2025-01-01',
        end_date_sale: '2025-12-31',
        page: 1
      })
    });

    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ API acessível');
      console.log(`   📊 Resposta: ${JSON.stringify(data).substring(0, 200)}...`);
    } else {
      const errorData = await response.text();
      console.log('   ❌ API retornou erro');
      console.log(`   📋 Erro: ${errorData}`);
    }
  } catch (error) {
    console.log('   ❌ Erro de conexão');
    console.log(`   📋 Erro: ${error.message}`);
  }

  // Teste 2: Verificar endpoints disponíveis
  console.log('\n2️⃣ TESTE: Endpoints disponíveis');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const endpoints = [
    '/sales/get',
    '/checkout/create',
    '/checkout/generate',
    '/checkout/preferences',
    '/products/list',
    '/plans/list'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({})
      });

      const status = response.status;
      const isSuccess = status < 400;
      
      console.log(`   ${isSuccess ? '✅' : '❌'} ${endpoint}: ${status}`);
      
      if (!isSuccess && status !== 404) {
        const errorData = await response.text();
        console.log(`      Erro: ${errorData.substring(0, 100)}...`);
      }

    } catch (error) {
      console.log(`   ❌ ${endpoint}: ERRO - ${error.message}`);
    }
  }

  // Teste 3: Verificar documentação
  console.log('\n3️⃣ INFORMAÇÕES DA DOCUMENTAÇÃO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📚 Baseado na documentação oficial:');
  console.log('   - URL: https://app.perfectpay.com.br/api/v1/sales/get');
  console.log('   - Método: POST');
  console.log('   - Headers: Accept, Content-Type, Authorization');
  console.log('   - Parâmetros: start_date_sale, end_date_sale, etc.');
  console.log('');
  console.log('🔍 Para checkout, precisamos encontrar o endpoint correto...');

}

testPerfectPayAPI();
