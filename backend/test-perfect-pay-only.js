// Script simples para testar apenas a rota /api/perfect-pay/plans
const http = require('http');

function testPerfectPayPlans() {
  console.log('🧪 Testando apenas /api/perfect-pay/plans...\n');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/perfect-pay/plans',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('Success:', jsonData.success);
        console.log('Plans count:', jsonData.plans?.length || 0);
        
        if (jsonData.plans && jsonData.plans.length > 0) {
          console.log('\n📋 Planos encontrados:');
          jsonData.plans.forEach(plan => {
            console.log(`   - ${plan.displayName}: R$ ${plan.price} (${plan.leads} leads)`);
          });
        } else {
          console.log('⚠️ Nenhum plano retornado');
        }
      } catch (error) {
        console.log('❌ Erro ao parsear JSON:', error.message);
        console.log('Raw data:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Erro na requisição:', error.message);
  });

  req.end();
}

testPerfectPayPlans();









