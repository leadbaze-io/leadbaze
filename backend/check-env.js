// Script para verificar variáveis de ambiente
require('dotenv').config({ path: './config.env' });

console.log('🔍 Verificando variáveis de ambiente...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('N8N_WEBHOOK_URL:', process.env.N8N_WEBHOOK_URL);
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Configurada' : '❌ Não configurada');
console.log('EVOLUTION_API_URL:', process.env.EVOLUTION_API_URL);

// Verificar se a URL do N8N é válida
if (process.env.N8N_WEBHOOK_URL) {
  try {
    new URL(process.env.N8N_WEBHOOK_URL);
    console.log('✅ N8N_WEBHOOK_URL é válida');
  } catch (error) {
    console.log('❌ N8N_WEBHOOK_URL é inválida:', error.message);
  }
} else {
  console.log('❌ N8N_WEBHOOK_URL não está definida');
}













