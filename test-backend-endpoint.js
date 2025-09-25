const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabase = createClient(
  'https://lsvwjyhnnzeewuuuykmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhuemVld3d1dXlrbWIiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNjU5NzQ0MCwiZXhwIjoyMDUyMTczNDQwfQ.lsvwjyhnnzeewuuuykmb'
);

async function testBackendEndpoint() {
  console.log('🔍 Testando endpoint do backend...');
  
  const campaignId = 'bf20ef97-f9e7-4655-bb6a-4021a2d1adbe';
  const payload = {
    campaignId,
    successCount: 2,
    failedCount: 0,
    totalProcessed: 2
  };
  
  try {
    // Testar endpoint local
    console.log('📡 Testando endpoint local: http://localhost:3001/api/campaign/status/complete');
    
    const response = await fetch('http://localhost:3001/api/campaign/status/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const responseText = await response.text();
    console.log('📊 Status:', response.status);
    console.log('📋 Resposta:', responseText);
    
    if (response.ok) {
      console.log('✅ Endpoint local funcionando!');
    } else {
      console.log('❌ Erro no endpoint local');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar endpoint local:', error.message);
  }
  
  try {
    // Testar endpoint de produção
    console.log('\n📡 Testando endpoint de produção: https://leadbaze.io/api/campaign/status/complete');
    
    const response = await fetch('https://leadbaze.io/api/campaign/status/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const responseText = await response.text();
    console.log('📊 Status:', response.status);
    console.log('📋 Resposta:', responseText);
    
    if (response.ok) {
      console.log('✅ Endpoint de produção funcionando!');
    } else {
      console.log('❌ Erro no endpoint de produção');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar endpoint de produção:', error.message);
  }
  
  // Verificar se a campanha existe no banco
  console.log('\n🔍 Verificando campanha no banco...');
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId);
    
    if (error) {
      console.error('❌ Erro ao buscar campanha:', error);
    } else if (data && data.length > 0) {
      console.log('✅ Campanha encontrada no banco:', data[0]);
    } else {
      console.log('❌ Campanha não encontrada no banco');
    }
  } catch (error) {
    console.error('❌ Erro ao verificar campanha:', error);
  }
}

testBackendEndpoint();


















