const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { BlogAutomationService, getBlogAutomationService } = require('./services/blogAutomationService');
const blogQueueRoutes = require('./routes/blogQueue');
const blogPostsRoutes = require('./routes/blogPosts');
const { router: autoProcessRoutes } = require('./routes/autoProcess');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware

// Configurar trust proxy para rate limiting
app.set("trust proxy", 1);
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
    },
  },
}));

// Rate limiting middleware
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message,
      retryAfter: Math.ceil(windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.log(`🚨 Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
      res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
  });
};

// Rate limits específicos - OTIMIZADOS PARA PRODUÇÃO
const generalLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutos
  500, // 500 requests por IP (muito mais permissivo)
  'Muitas requisições. Tente novamente em 15 minutos.'
);

// Rate limit MUITO permissivo para dashboard
const dashboardLimit = createRateLimit(
  5 * 60 * 1000, // 5 minutos
  200, // 200 requests por IP para dashboard (muito mais permissivo)
  'Muitas requisições do dashboard. Tente novamente em 5 minutos.'
);

// Rate limit para processamento (ainda mais permissivo)
const processLimit = createRateLimit(
  1 * 60 * 1000, // 1 minuto
  10, // 10 processamentos por minuto
  'Muitos processamentos. Tente novamente em 1 minuto.'
);

const campaignLimit = createRateLimit(
  60 * 60 * 1000, // 1 hora
  10, // 10 campanhas por hora
  'Limite de campanhas atingido. Tente novamente em 1 hora.'
);

const qrCodeLimit = createRateLimit(
  5 * 60 * 1000, // 5 minutos
  20, // 20 tentativas de QR code
  'Muitas tentativas de QR code. Aguarde 5 minutos.'
);

// Aplicar rate limiting geral
app.use(generalLimit);

// Middleware básico
app.use(express.json({ limit: '10mb' }));

// Configuração CORS dinâmica
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['https://leadflow-indol.vercel.app', 'http://localhost:5173'];

console.log('🔧 CORS Origins configuradas:', corsOrigins);

app.use(cors({
  origin: function (origin, callback) {
    console.log('🌐 Origin da requisição:', origin);
    
    // Permitir requisições sem origin (como mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (corsOrigins.indexOf(origin) !== -1) {
      console.log('✅ Origin permitida:', origin);
      callback(null, true);
    } else {
      console.log('❌ Origin bloqueada:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Evolution API Configuration
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
function sanitizeWebhookUrl(raw) {
  if (!raw) return '';
  // remove aspas iniciais/finais e espaços
  const cleaned = String(raw).trim().replace(/^['"]+|['"]+$/g, '');
  return cleaned;
}

const N8N_WEBHOOK_URL = sanitizeWebhookUrl(process.env.N8N_WEBHOOK_URL); // opcional: webhook do fluxo N8N

// Headers padrão para todas as requisições à Evolution API
const evolutionHeaders = {
  'Content-Type': 'application/json',
  'apikey': EVOLUTION_API_KEY
};

// Middleware de logging para debug
app.use((req, res, next) => {
  console.log(`🌐 [Request] ${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log(`🌐 [Request] Headers:`, req.headers);
  console.log(`🌐 [Request] Body:`, req.body);
  next();
});

/**
 * POST /api/dispatch-campaign
 * Recebe a campanha do frontend e repassa para o webhook do N8N
 * Body esperado: Array de objetos no formato solicitado
 */
app.post('/api/dispatch-campaign', campaignLimit, async (req, res) => {
  try {
    console.log('🔄 Recebendo requisição dispatch-campaign...');
    console.log('📍 N8N_WEBHOOK_URL configurada:', N8N_WEBHOOK_URL);
    
    if (!N8N_WEBHOOK_URL) {
      console.log('❌ N8N_WEBHOOK_URL não configurada');
      return res.status(400).json({ success: false, error: 'N8N_WEBHOOK_URL não configurada no servidor' });
    }

    const payload = req.body;
    console.log('📦 Payload recebido:', JSON.stringify(payload, null, 2));

    if (!Array.isArray(payload) || payload.length === 0) {
      console.log('❌ Payload inválido:', payload);
      return res.status(400).json({ success: false, error: 'Payload inválido. Deve ser um array não-vazio.' });
    }

    // Valida URL
    try { 
      new URL(N8N_WEBHOOK_URL);
      console.log('✅ URL válida:', N8N_WEBHOOK_URL);
    } catch (urlError) {
      console.log('❌ URL inválida:', N8N_WEBHOOK_URL, urlError.message);
      return res.status(400).json({ success: false, error: 'N8N_WEBHOOK_URL inválida', details: N8N_WEBHOOK_URL });
    }

    console.log('📤 Enviando para N8N...', JSON.stringify(payload).slice(0, 500));

    const response = await axios.post(N8N_WEBHOOK_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 120000
    });

    console.log('✅ N8N respondeu com sucesso:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });

    return res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('❌ Erro completo:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });
    return res.status(500).json({ 
      success: false, 
      error: 'Falha ao enviar campanha para N8N', 
      details: error.response?.data || error.message,
      status: error.response?.status 
    });
  }
});

/**
 * POST /api/create-instance-and-qrcode
 * Cria uma nova instância e retorna o QR Code
 */
app.post('/api/create-instance-and-qrcode', async (req, res) => {
  try {
    const { instanceName, userName } = req.body;
    
    if (!instanceName) {
      return res.status(400).json({
        success: false,
        error: 'instanceName é obrigatório'
      });
    }

    console.log(`Criando instância: ${instanceName}${userName ? ` para usuário: ${userName}` : ''}`);

    // 1. Criar a instância na Evolution API
    const createInstanceResponse = await axios.post(
      `${EVOLUTION_API_URL}/instance/create`,
      {
        instanceName: instanceName,
        token: uuidv4(), // Token único para a instância
        qrcode: true,
        number: "000000", // Placeholder válido para regex
        webhookByEvents: false,
        events: [],
        waitQrCode: true,
        integration: "WHATSAPP-BAILEYS"
      },
      { headers: evolutionHeaders }
    );

    console.log('Instância criada:', createInstanceResponse.data);

    // 2. INICIAR a instância (ESTE É O PROBLEMA!)
    console.log('🚀 Iniciando instância...');
    
    try {
      const startResponse = await axios.get(
        `${EVOLUTION_API_URL}/instance/start/${instanceName}`,
        { headers: evolutionHeaders }
      );
      console.log('✅ Instância iniciada:', startResponse.data);
    } catch (error) {
      console.log('⚠️ Erro ao iniciar instância (pode ser normal):', error.message);
    }

    // 3. Retornar imediatamente após criar a instância
    // O frontend fará polling para buscar o QR Code
    console.log('✅ Instância criada com sucesso. Frontend deve fazer polling para QR Code.');

    // 3. Retornar dados para o frontend
    res.json({
      success: true,
      instanceName: instanceName,
      qrCodeBase64: null, // QR Code será buscado pelo frontend
      pairingCode: null,
      message: 'Instância criada com sucesso. Aguardando QR Code...'
    });

  } catch (error) {
    console.error('❌ Erro detalhado ao criar instância:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao criar instância',
      details: error.response?.data || error.message
    });
  }
});

/**
 * GET /api/qrcode/:instanceName
 * Busca o QR Code de uma instância específica
 */
app.get('/api/qrcode/:instanceName', qrCodeLimit, async (req, res) => {
  try {
    const { instanceName } = req.params;
    
    if (!instanceName) {
      return res.status(400).json({
        success: false,
        error: 'instanceName é obrigatório'
      });
    }

    console.log(`🔍 Buscando QR Code para instância: ${instanceName}`);

    // Tentar diferentes endpoints para obter o QR Code
    let qrCodeBase64 = null;
    let pairingCode = null;
    
    try {
      // Estratégia 1: Endpoint padrão
      const qrCodeResponse = await axios.get(
        `${EVOLUTION_API_URL}/instance/connect/${instanceName}`,
        { headers: evolutionHeaders }
      );

      console.log('📱 Resposta do QR Code:', JSON.stringify(qrCodeResponse.data, null, 2));
      
      // Verificar diferentes formatos de resposta
      const qrData = qrCodeResponse.data;
      

      
      // Priorizar o campo base64 que já vem formatado para imagem
      if (qrData.base64 && qrData.base64.startsWith('data:image/')) {
        qrCodeBase64 = qrData.base64;
        console.log('✅ QR Code encontrado no campo: base64 (formato imagem)');
      } else if (qrData.qrcode && qrData.qrcode !== '' && qrData.qrcode !== '0' && qrData.qrcode !== 0) {
        qrCodeBase64 = qrData.qrcode;
        console.log('✅ QR Code encontrado no campo: qrcode');
      } else if (qrData.qrcodeBase64 && qrData.qrcodeBase64 !== '' && qrData.qrcodeBase64 !== '0' && qrData.qrcodeBase64 !== 0) {
        qrCodeBase64 = qrData.qrcodeBase64;
        console.log('✅ QR Code encontrado no campo: qrcodeBase64');
      } else if (qrData.code && qrData.code !== '' && qrData.code !== '0' && qrData.code !== 0) {
        // O campo code não é base64, não usar para imagem
        console.log('⚠️ Campo code encontrado, mas não é formato de imagem válido');
      }
      
      // Se não encontrou QR Code válido, retornar null
      if (!qrCodeBase64) {
        console.log('❌ Nenhum QR Code válido encontrado');
      }
      
      // Verificar pairing code
      const possiblePairingFields = ['pairingCode', 'pairing', 'code'];
      for (const field of possiblePairingFields) {
        if (qrData[field] && qrData[field] !== '') {
          pairingCode = qrData[field];
          console.log(`✅ Pairing Code encontrado no campo: ${field}`);
          break;
        }
      }

    } catch (error) {
      console.log('⚠️ Erro ao buscar QR Code:', error.message);
    }

    res.json({
      success: true,
      instanceName: instanceName,
      qrCodeBase64: qrCodeBase64,
      pairingCode: pairingCode,
      hasQRCode: !!qrCodeBase64,
      message: qrCodeBase64 
        ? 'QR Code encontrado!'
        : 'QR Code ainda não disponível. Tente novamente.'
    });

  } catch (error) {
    console.error('Erro ao buscar QR Code:', error.response?.data || error.message);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar QR Code',
      details: error.response?.data || error.message
    });
  }
});

/**
 * GET /api/connection-state/:instanceName
 * Verifica o estado da conexão da instância
 */
app.get('/api/connection-state/:instanceName', async (req, res) => {
  try {
    const { instanceName } = req.params;
    
    if (!instanceName) {
      return res.status(400).json({
        success: false,
        error: 'instanceName é obrigatório'
      });
    }

    console.log(`Verificando estado da instância: ${instanceName}`);

    // Consultar estado da conexão
    const connectionStateResponse = await axios.get(
      `${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`,
      { headers: evolutionHeaders }
    );

    console.log('Estado da conexão:', connectionStateResponse.data);

    // Extrair o estado da resposta da Evolution API
    const state = connectionStateResponse.data?.instance?.state || connectionStateResponse.data?.state || 'unknown';

    res.json({
      success: true,
      instanceName: instanceName,
      state: state,
      message: getStateMessage(state)
    });

  } catch (error) {
    console.error('Erro ao verificar estado da conexão:', error.response?.data || error.message);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar estado da conexão',
      details: error.response?.data || error.message
    });
  }
});

/**
 * DELETE /api/delete-instance/:instanceName
 * Deleta uma instância (opcional - para limpeza)
 */
app.delete('/api/delete-instance/:instanceName', async (req, res) => {
  try {
    const { instanceName } = req.params;
    
    if (!instanceName) {
      return res.status(400).json({
        success: false,
        error: 'instanceName é obrigatório'
      });
    }

    console.log(`Deletando instância: ${instanceName}`);

    const deleteResponse = await axios.delete(
      `${EVOLUTION_API_URL}/instance/delete/${instanceName}`,
      { headers: evolutionHeaders }
    );

    console.log('Instância deletada:', deleteResponse.data);

    res.json({
      success: true,
      message: 'Instância deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar instância:', error.response?.data || error.message);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar instância',
      details: error.response?.data || error.message
    });
  }
});

/**
 * POST /webhook/:instanceName
 * Endpoint para receber webhooks da Evolution API
 */
app.post('/webhook/:instanceName', (req, res) => {
  try {
    const { instanceName } = req.params;
    const webhookData = req.body;
    
    console.log(`📡 Webhook recebido para instância ${instanceName}:`, webhookData);
    
    // Verificar se é um evento de QR Code
    if (webhookData.event === 'qrcode' || webhookData.qrcode) {
      console.log('✅ QR Code recebido via webhook!');
      // Aqui você pode implementar lógica para notificar o frontend
    }
    
    res.json({ success: true, message: 'Webhook recebido' });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).json({ success: false, error: 'Erro ao processar webhook' });
  }
});

/**
 * GET /api/health
 * Endpoint de saúde do servidor
 */
app.get('/api/health', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Verificar conectividade com serviços externos
    const healthChecks = {
      server: {
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
        platform: process.platform,
      },
      evolution_api: {
        status: 'unknown',
        url: EVOLUTION_API_URL,
        response_time: null,
      },
      n8n_webhook: {
        status: 'unknown',
        url: N8N_WEBHOOK_URL,
        response_time: null,
      },
    };

    // Testar Evolution API
    if (EVOLUTION_API_URL && EVOLUTION_API_KEY) {
      try {
        const start = Date.now();
        const response = await axios.get(`${EVOLUTION_API_URL}/manager/findInstances`, {
          headers: evolutionHeaders,
          timeout: 5000,
        });
        
        healthChecks.evolution_api.status = response.status === 200 ? 'healthy' : 'unhealthy';
        healthChecks.evolution_api.response_time = Date.now() - start;
      } catch (error) {
        healthChecks.evolution_api.status = 'unhealthy';
        healthChecks.evolution_api.error = error.message;
      }
    } else {
      healthChecks.evolution_api.status = 'not_configured';
    }

    // Testar N8N Webhook
    if (N8N_WEBHOOK_URL) {
      try {
        const start = Date.now();
        // Teste básico de conectividade (pode retornar erro, mas conectou)
        await axios.get(N8N_WEBHOOK_URL, { timeout: 3000 });
        healthChecks.n8n_webhook.status = 'healthy';
        healthChecks.n8n_webhook.response_time = Date.now() - start;
      } catch (error) {
        // N8N pode retornar 405 (Method Not Allowed) para GET, isso é normal
        if (error.response?.status === 405) {
          healthChecks.n8n_webhook.status = 'healthy';
          healthChecks.n8n_webhook.response_time = Date.now() - start;
        } else {
          healthChecks.n8n_webhook.status = 'unhealthy';
          healthChecks.n8n_webhook.error = error.message;
        }
      }
    } else {
      healthChecks.n8n_webhook.status = 'not_configured';
    }

    const totalResponseTime = Date.now() - startTime;
    const overallStatus = Object.values(healthChecks).every(
      check => check.status === 'healthy' || check.status === 'not_configured'
    ) ? 'healthy' : 'degraded';

    res.json({
      success: true,
      status: overallStatus,
      timestamp: new Date().toISOString(),
      response_time: totalResponseTime,
      environment: process.env.NODE_ENV || 'development',
      checks: healthChecks,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      response_time: Date.now() - startTime,
      error: error.message,
    });
  }
});

/**
 * GET /api/metrics
 * Métricas básicas do servidor
 */
app.get('/api/metrics', (req, res) => {
  const startTime = process.hrtime();
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    metrics: {
      uptime: process.uptime(),
      memory: {
        ...process.memoryUsage(),
        free: process.memoryUsage().heapTotal - process.memoryUsage().heapUsed,
      },
      cpu: process.cpuUsage(),
      load_average: process.platform !== 'win32' ? require('os').loadavg() : null,
      platform: {
        node_version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

/**
 * Função auxiliar para mensagens de estado
 */
function getStateMessage(state) {
  const messages = {
    'open': 'WhatsApp conectado com sucesso!',
    'connecting': 'Conectando ao WhatsApp...',
    'close': 'WhatsApp desconectado',
    'disconnected': 'WhatsApp desconectado',
    'qrcode': 'Escaneie o QR Code para conectar',
    'qrRead': 'QR Code lido, conectando...',
    'ready': 'WhatsApp pronto para uso!',
    'loading': 'Carregando WhatsApp...',
    'start': 'Iniciando conexão...',
    'stop': 'Conexão parada',
    'destroy': 'Instância destruída'
  };
  
  return messages[state] || `Estado: ${state}`;
}

// Tratamento de erros global
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

// =====================================================
// BLOG AUTOMATION ENDPOINTS
// =====================================================

// Middleware para verificar admin autorizado
const checkAdminAuth = (req, res, next) => {
  const userEmail = req.headers['x-user-email'];
  const automationService = getBlogAutomationService();
  
  if (!userEmail || !automationService.isAuthorizedAdmin(userEmail)) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado. Apenas administradores autorizados.'
    });
  }
  
  next();
};

// Health check do sistema de automação
app.get('/api/blog/automation/health', async (req, res) => {
  try {
    const automationService = getBlogAutomationService();
    const health = await automationService.healthCheck();
    
    res.json(health);
  } catch (error) {
    console.error('❌ Erro no health check de automação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro no health check de automação'
    });
  }
});

// Obter estatísticas (público)
app.get('/api/blog/automation/stats', async (req, res) => {
  try {
    const automationService = getBlogAutomationService();
    const stats = await automationService.getStats();
    
    res.json(stats);
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter estatísticas'
    });
  }
});

// Rotas do blog queue (públicas para inserção manual)
console.log('🔧 [Server] Registrando rotas do blog...');
app.use('/api/blog/queue', blogQueueRoutes);
app.use('/api/blog', blogPostsRoutes);
app.use('/api/blog/auto', autoProcessRoutes);
console.log('✅ [Server] Rotas do blog registradas com sucesso');

// Endpoints admin (requerem autenticação) - com rate limit específico
app.use('/api/blog/automation/admin/*', dashboardLimit, checkAdminAuth);

// Processar fila manualmente (admin) - COM RATE LIMIT ESPECÍFICO
app.post('/api/blog/automation/admin/process', processLimit, async (req, res) => {
  console.log('🎯 [Backend] ===== RECEBENDO REQUISIÇÃO DE PROCESSAMENTO =====');
  console.log('⏰ [Backend] Timestamp:', new Date().toISOString());
  console.log('👤 [Backend] User email:', req.headers['x-user-email']);
  console.log('🌐 [Backend] IP:', req.ip);
  console.log('📋 [Backend] Headers:', JSON.stringify(req.headers, null, 2));
  
  try {
    console.log('🔧 [Backend] Obtendo BlogAutomationService...');
    const automationService = getBlogAutomationService();
    console.log('✅ [Backend] Serviço obtido com sucesso');
    
    console.log('🚀 [Backend] Chamando automationService.processQueue()...');
    const result = await automationService.processQueue();
    
    console.log('✅ [Backend] ===== RESULTADO DO PROCESSAMENTO =====');
    console.log('📄 [Backend] Tipo do resultado:', typeof result);
    console.log('📄 [Backend] Resultado completo:', JSON.stringify(result, null, 2));
    console.log('📄 [Backend] result.success:', result?.success);
    console.log('📄 [Backend] result.processed:', result?.processed);
    console.log('📄 [Backend] result.errors:', result?.errors);
    console.log('📄 [Backend] result.details:', result?.details);
    
    console.log('📤 [Backend] Enviando resposta para o frontend...');
    res.json(result);
    console.log('✅ [Backend] Resposta enviada com sucesso');
    
  } catch (error) {
    console.error('❌ [Backend] ===== ERRO NO PROCESSAMENTO =====');
    console.error('❌ [Backend] Tipo do erro:', typeof error);
    console.error('❌ [Backend] Erro completo:', error);
    console.error('❌ [Backend] Error message:', error.message);
    console.error('❌ [Backend] Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao processar fila',
      details: error.message
    });
  }
});

// Obter fila completa (admin)
app.get('/api/blog/automation/admin/queue', async (req, res) => {
  try {
    const automationService = getBlogAutomationService();
    const limit = parseInt(req.query.limit) || 50;
    const queue = await automationService.getQueue(limit);
    
    res.json(queue);
  } catch (error) {
    console.error('❌ Erro ao obter fila:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter fila'
    });
  }
});

// Processar item específico (admin)
app.post('/api/blog/automation/admin/process/:itemId', async (req, res) => {
  try {
    const automationService = getBlogAutomationService();
    const { itemId } = req.params;
    const result = await automationService.processItem(itemId);
    
    res.json(result);
  } catch (error) {
    console.error('❌ Erro ao processar item:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao processar item'
    });
  }
});

// Obter configuração (admin)
app.get('/api/blog/automation/admin/config', (req, res) => {
  try {
    const automationService = getBlogAutomationService();
    const config = automationService.getConfig();
    
    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('❌ Erro ao obter configuração:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter configuração'
    });
  }
});

// Atualizar configuração (admin)
app.put('/api/blog/automation/admin/config', (req, res) => {
  try {
    const automationService = getBlogAutomationService();
    const newConfig = req.body;
    
    automationService.updateConfig(newConfig);
    
    res.json({
      success: true,
      message: 'Configuração atualizada com sucesso',
      config: automationService.getConfig()
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar configuração:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar configuração'
    });
  }
});

// Controlar scheduler (admin)
app.post('/api/blog/automation/admin/scheduler/:action', (req, res) => {
  try {
    const automationService = getBlogAutomationService();
    const { action } = req.params;
    
    if (action === 'start') {
      automationService.startScheduler();
      res.json({
        success: true,
        message: 'Scheduler iniciado com sucesso'
      });
    } else if (action === 'stop') {
      automationService.stopScheduler();
      res.json({
        success: true,
        message: 'Scheduler parado com sucesso'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Ação inválida. Use "start" ou "stop"'
      });
    }
  } catch (error) {
    console.error('❌ Erro ao controlar scheduler:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao controlar scheduler'
    });
  }
});

// Obter logs (admin)
app.get('/api/blog/automation/admin/logs', async (req, res) => {
  try {
    const automationService = getBlogAutomationService();
    const limit = parseInt(req.query.limit) || 100;
    const logs = await automationService.getLogs(limit);
    
    res.json(logs);
  } catch (error) {
    console.error('❌ Erro ao obter logs:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter logs'
    });
  }
});

// Webhook para receber dados do N8N
app.post('/api/blog/automation/webhook', async (req, res) => {
  try {
    console.log('📡 Webhook N8N recebido:', req.body);
    
    const { title, content, category, date, imageurl, autor } = req.body;
    
    // Validação básica
    if (!title || !content || !category || !date) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: title, content, category, date'
      });
    }
    
    // Inserir na fila N8N
    const automationService = getBlogAutomationService();
    const result = await automationService.addToQueue({
      title,
      content,
      category,
      date,
      imageurl: imageurl || null,
      autor: autor || 'LeadBaze Team'
    });
    
    if (result.success) {
      console.log('✅ Artigo adicionado à fila:', result.data);
      res.json({
        success: true,
        message: 'Artigo adicionado à fila com sucesso',
        data: result.data
      });
    } else {
      console.error('❌ Erro ao adicionar à fila:', result.error);
      res.status(500).json({
        success: false,
        error: 'Erro ao adicionar artigo à fila',
        details: result.error
      });
    }
    
  } catch (error) {
    console.error('❌ Erro no webhook N8N:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Evolution API Backend rodando na porta ${PORT}`);
  console.log(`📱 URL da Evolution API: ${EVOLUTION_API_URL}`);
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN}`);
  console.log(`🔧 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`🔗 N8N Webhook URL configurada: ${N8N_WEBHOOK_URL ? '✅' : '❌'}`);
  
  // Iniciar serviço de automação do blog
  try {
    const automationService = getBlogAutomationService();
    automationService.startScheduler();
    
    // AutoPollingService disponível mas não iniciado por padrão
    // Para ativar: POST /api/blog/realtime/polling/start
    const autoPollingService = getAutoPollingService();
    console.log('🔄 AutoPollingService disponível (não iniciado por padrão)');
    
    console.log('🤖 Blog Automation Service iniciado');
    console.log('📧 Admin autorizado: creaty12345@gmail.com');
  } catch (error) {
    console.error('❌ Erro ao iniciar Blog Automation Service:', error);
  }
});

module.exports = app; 