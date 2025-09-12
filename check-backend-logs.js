const { exec } = require('child_process');

function checkBackendLogs() {
  console.log('🔍 Verificando logs do backend...');
  
  // Verificar status do PM2
  exec('pm2 status', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Erro ao verificar status do PM2:', error);
      return;
    }
    console.log('📊 Status do PM2:');
    console.log(stdout);
  });
  
  // Verificar logs do backend
  exec('pm2 logs leadbaze-backend --lines 20', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Erro ao verificar logs:', error);
      return;
    }
    console.log('📋 Últimos 20 logs do backend:');
    console.log(stdout);
  });
  
  // Verificar se o backend está respondendo
  setTimeout(() => {
    console.log('\n🔍 Testando se o backend está respondendo...');
    exec('curl -s http://localhost:3001/health || echo "Backend não está respondendo"', (error, stdout, stderr) => {
      console.log('📡 Resposta do backend:', stdout);
    });
  }, 2000);
}

checkBackendLogs();



