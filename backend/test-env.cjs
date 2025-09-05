require('dotenv').config({ path: './config.env' });

console.log('🔧 Testando variáveis de ambiente...');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Definida' : '❌ Não definida');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Definida' : '❌ Não definida');

if (process.env.SUPABASE_URL) {
  console.log('URL:', process.env.SUPABASE_URL);
}

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('Key (primeiros 20 chars):', process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...');
}

// Testar inicialização do serviço
try {
  console.log('\n🚀 Testando inicialização do BlogAutomationService...');
  const { getBlogAutomationService } = require('./services/blogAutomationService');
  const service = getBlogAutomationService();
  console.log('✅ Serviço inicializado com sucesso!');
} catch (error) {
  console.log('❌ Erro ao inicializar serviço:', error.message);
}
