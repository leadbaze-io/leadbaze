const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './config.env' });

console.log('🔧 Iniciando servidor de debug...');

const app = express();
const PORT = 3001;

// Middleware básico
app.use(express.json());
app.use(cors());

console.log('✅ Middleware configurado');

// Rota de teste
app.get('/test', (req, res) => {
  console.log('📡 Requisição recebida em /test');
  res.json({ message: 'Servidor funcionando!' });
});

// Rota de saúde
app.get('/health', (req, res) => {
  console.log('📡 Requisição recebida em /health');
  res.json({ 
    success: true, 
    message: 'Servidor OK',
    timestamp: new Date().toISOString()
  });
});

console.log('✅ Rotas configuradas');

// Tratamento de erros
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não tratado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada:', reason);
});

console.log('✅ Tratamento de erros configurado');

// Iniciar servidor
try {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor de debug rodando na porta ${PORT}`);
    console.log(`📱 Teste: http://localhost:${PORT}/test`);
    console.log(`💚 Health: http://localhost:${PORT}/health`);
  });
} catch (error) {
  console.error('❌ Erro ao iniciar servidor:', error);
} 