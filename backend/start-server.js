// Script alternativo para iniciar o servidor sem PM2
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Iniciando servidor LeadBaze...\n');

// Carregar variáveis de ambiente do arquivo config.env
function loadEnvFile() {
  const envPath = path.join(__dirname, 'config.env');
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    envLines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          process.env[key.trim()] = value.trim();
        }
      }
    });
    
    console.log('✅ Variáveis de ambiente carregadas do config.env');
  } else {
    console.log('⚠️ Arquivo config.env não encontrado, usando variáveis padrão');
  }
}

// Configurar variáveis de ambiente padrão
function setDefaultEnv() {
  const defaultEnv = {
    NODE_ENV: 'production',
    PORT: 3001,
    EVOLUTION_API_URL: 'https://n8n-evolution.kof6cn.easypanel.host',
    EVOLUTION_API_KEY: 'qwSYwLlijZOh+FaBHrK0tfGzxG6W/J4O',
    CORS_ORIGIN: 'https://leadbaze.io,https://leadflow-indol.vercel.app,http://localhost:5173,http://localhost:5175,http://localhost:5177,http://localhost:5178,http://localhost:5179,http://localhost:3000',
    API_SECRET: 'your-secret-key-here',
    N8N_WEBHOOK_URL: 'https://n8n-n8n-start.kof6cn.easypanel.host/webhook/b1b11d27-2dfa-42a6-bbaf-b0fa456c0bae',
    SUPABASE_URL: 'https://lsvwjyhnnzeewuuuykmb.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk',
    BLOG_AUTOMATION_ENABLED: 'true',
    BLOG_AUTOMATION_CRON: '0 9 * * *',
    BLOG_AUTOMATION_TIMEZONE: 'America/Sao_Paulo',
    BLOG_AUTOMATION_MAX_RETRIES: '3',
    BLOG_AUTOMATION_RETRY_DELAY: '5000',
    BLOG_ADMIN_EMAIL: 'creaty12345@gmail.com',
    EMAIL_HASH_SALT: 'leadflow-blog-automation-2024'
  };

  Object.keys(defaultEnv).forEach(key => {
    if (!process.env[key]) {
      process.env[key] = defaultEnv[key];
    }
  });
}

// Função para iniciar o servidor
function startServer() {
  console.log('📡 Iniciando servidor Node.js...');
  console.log(`🌐 Porta: ${process.env.PORT}`);
  console.log(`🔧 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`📊 CORS Origin: ${process.env.CORS_ORIGIN}`);
  console.log('');

  const serverPath = path.join(__dirname, 'server.js');
  
  if (!fs.existsSync(serverPath)) {
    console.error('❌ Arquivo server.js não encontrado!');
    process.exit(1);
  }

  const server = spawn('node', [serverPath], {
    stdio: 'inherit',
    env: process.env,
    cwd: __dirname
  });

  server.on('error', (error) => {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  });

  server.on('exit', (code, signal) => {
    if (signal) {
      console.log(`\n🛑 Servidor finalizado com sinal: ${signal}`);
    } else {
      console.log(`\n🛑 Servidor finalizado com código: ${code}`);
    }
  });

  // Tratamento de sinais para shutdown graceful
  process.on('SIGINT', () => {
    console.log('\n🛑 Recebido SIGINT, finalizando servidor...');
    server.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Recebido SIGTERM, finalizando servidor...');
    server.kill('SIGTERM');
  });

  console.log('✅ Servidor iniciado com sucesso!');
  console.log('💡 Pressione Ctrl+C para parar o servidor\n');
}

// Executar
try {
  loadEnvFile();
  setDefaultEnv();
  startServer();
} catch (error) {
  console.error('❌ Erro ao iniciar:', error);
  process.exit(1);
}









