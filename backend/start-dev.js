// Script de desenvolvimento para Windows
require('dotenv').config({ path: './config.env' });

// Verificar se as variáveis estão carregadas
console.log('🔧 Verificando configurações...');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Carregado' : '❌ Não encontrado');
console.log('PORT:', process.env.PORT || 3001);

// Iniciar o servidor
require('./server.js');























