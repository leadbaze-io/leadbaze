const axios = require('axios');
require('dotenv').config({ path: './config.env' });

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

console.log('🔍 Testando conectividade básica...');
console.log('URL:', EVOLUTION_API_URL);
console.log('API Key:', EVOLUTION_API_KEY ? '✅ Configurada' : '❌ Não configurada');

// Teste simples de conectividade
axios.get(`${EVOLUTION_API_URL}/instance/fetchInstances`, {
  headers: {
    'Content-Type': 'application/json',
    'apikey': EVOLUTION_API_KEY
  },
  timeout: 10000 // 10 segundos
})
.then(response => {
  console.log('✅ Conectividade OK! Status:', response.status);
  console.log('Resposta:', response.data);
})
.catch(error => {
  console.error('❌ Erro de conectividade:');
  console.error('Status:', error.response?.status);
  console.error('Message:', error.message);
  console.error('Data:', error.response?.data);
}); 