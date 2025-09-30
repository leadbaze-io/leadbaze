const express = require('express');
const router = express.Router();

// Usar array global de webhooks (inicializado no server.js)
const MAX_HISTORY = 100; // Manter apenas os últimos 100 webhooks

// Middleware para capturar todos os webhooks
const captureWebhook = (req, res, next) => {
  const webhookData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body,
    query: req.query,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  };

  // Adicionar ao histórico global
  if (global.webhookHistory) {
    global.webhookHistory.unshift(webhookData);
    
    // Manter apenas os últimos MAX_HISTORY
    if (global.webhookHistory.length > MAX_HISTORY) {
      global.webhookHistory = global.webhookHistory.slice(0, MAX_HISTORY);
    }
  }

  console.log('📡 [Webhook Monitor] Webhook capturado:', {
    timestamp: webhookData.timestamp,
    method: webhookData.method,
    path: webhookData.path,
    body: webhookData.body
  });

  next();
};

// Aplicar middleware a todas as rotas de webhook
router.use('/mercadopago', captureWebhook);
router.use('/n8n', captureWebhook);
router.use('/blog', captureWebhook);
router.use('/recurring-subscription', captureWebhook);

// Handler para GET /webhook/mercadopago (para evitar 404)
router.get('/mercadopago', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MercadoPago webhook endpoint ativo',
    timestamp: new Date().toISOString(),
    method: 'GET'
  });
});

// Handler para POST /webhook/mercadopago (redireciona para o handler principal)
router.post('/mercadopago', (req, res) => {
  // Redirecionar para o handler principal de pagamentos
  res.status(200).json({
    success: true,
    message: 'Webhook recebido - processando via handler principal',
    timestamp: new Date().toISOString(),
    method: 'POST'
  });
});

// Endpoint para visualizar histórico de webhooks
router.get('/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const webhookHistory = global.webhookHistory || [];
  const filtered = webhookHistory.slice(0, limit);
  
  res.json({
    success: true,
    total: webhookHistory.length,
    showing: filtered.length,
    webhooks: filtered
  });
});

// Endpoint para webhooks em tempo real (Server-Sent Events)
router.get('/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Enviar dados iniciais
  res.write(`data: ${JSON.stringify({
    type: 'init',
    message: 'Webhook monitor conectado',
    timestamp: new Date().toISOString()
  })}\n\n`);

  // Manter conexão viva
  const keepAlive = setInterval(() => {
    res.write(`data: ${JSON.stringify({
      type: 'ping',
      timestamp: new Date().toISOString()
    })}\n\n`);
  }, 30000);

  // Limpar quando cliente desconectar
  req.on('close', () => {
    clearInterval(keepAlive);
  });
});

// Endpoint para estatísticas
router.get('/stats', (req, res) => {
  const webhookHistory = global.webhookHistory || [];
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const recentWebhooks = webhookHistory.filter(w => 
    new Date(w.timestamp) > last24h
  );

  const stats = {
    total: webhookHistory.length,
    last24h: recentWebhooks.length,
    byMethod: {},
    byPath: {},
    byType: {},
    lastWebhook: webhookHistory[0] || null
  };

  // Agrupar por método
  webhookHistory.forEach(w => {
    stats.byMethod[w.method] = (stats.byMethod[w.method] || 0) + 1;
    stats.byPath[w.path] = (stats.byPath[w.path] || 0) + 1;
    
    // Detectar tipo de webhook
    let type = 'unknown';
    if (w.path.includes('mercadopago')) type = 'mercadopago';
    else if (w.path.includes('n8n')) type = 'n8n';
    else if (w.path.includes('blog')) type = 'blog';
    
    stats.byType[type] = (stats.byType[type] || 0) + 1;
  });

  res.json({
    success: true,
    stats
  });
});

// Endpoint para limpar histórico
router.delete('/history', (req, res) => {
  global.webhookHistory = [];
  res.json({
    success: true,
    message: 'Histórico de webhooks limpo'
  });
});

module.exports = router;
