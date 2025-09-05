const express = require('express');
const router = express.Router();
const { getBlogAutomationService } = require('../services/blogAutomationService');

// Store para notificações em tempo real
const notifications = [];
const clients = new Set();

// Endpoint para receber notificações do banco de dados
router.post('/webhook', async (req, res) => {
    try {
        console.log('🔔 [AutoProcess] Notificação recebida do banco:', req.body);
        
        const blogService = getBlogAutomationService();
        
        // Verificar se há itens pendentes
        const pendingCount = await blogService.getPendingCount();
        
        if (pendingCount > 0) {
            console.log(`🔄 [AutoProcess] Processando ${pendingCount} itens pendentes automaticamente`);
            
            // Adicionar notificação para o dashboard
            addNotification({
                title: `${pendingCount} posts pendentes detectados`,
                action: 'processing_started',
                pending: pendingCount
            });
            
            // Processar em background (não bloquear a resposta)
            setImmediate(async () => {
                try {
                    // Processar até 3 itens por vez
                    const result = await blogService.processQueueItems(3);
                    console.log('✅ [AutoProcess] Processamento automático concluído:', {
                        processados: result.processed,
                        erros: result.errors
                    });
                    
                    // Notificar resultado
                    addNotification({
                        title: `Processamento concluído: ${result.processed} posts processados`,
                        action: 'processing_completed',
                        processed: result.processed,
                        errors: result.errors
                    });
                } catch (error) {
                    console.error('❌ [AutoProcess] Erro no processamento automático:', error);
                    
                    // Notificar erro
                    addNotification({
                        title: `Erro no processamento: ${error.message}`,
                        action: 'processing_error',
                        error: error.message
                    });
                }
            });
        }
        
        res.json({
            success: true,
            message: 'Notificação recebida com sucesso',
            pending: pendingCount,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ [AutoProcess] Erro no webhook:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Endpoint para verificar status
router.get('/status', async (req, res) => {
    try {
        const blogService = getBlogAutomationService();
        const pendingCount = await blogService.getPendingCount();
        
        res.json({
            success: true,
            pending: pendingCount,
            hasPending: pendingCount > 0,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ [AutoProcess] Erro ao verificar status:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Endpoint para Server-Sent Events (notificações em tempo real)
router.get('/events', (req, res) => {
    // Configurar headers para SSE
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Adicionar cliente à lista
    clients.add(res);

    // Enviar notificações existentes
    notifications.slice(-10).forEach(notification => {
        res.write(`data: ${JSON.stringify(notification)}\n\n`);
    });

    // Enviar heartbeat a cada 30 segundos
    const heartbeat = setInterval(() => {
        res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`);
    }, 30000);

    // Limpar quando cliente desconectar
    req.on('close', () => {
        clients.delete(res);
        clearInterval(heartbeat);
    });
});

// Função para enviar notificação para todos os clientes conectados
function broadcastNotification(notification) {
    const message = `data: ${JSON.stringify(notification)}\n\n`;
    clients.forEach(client => {
        try {
            client.write(message);
        } catch (error) {
            clients.delete(client);
        }
    });
}

// Adicionar notificação ao store
function addNotification(notification) {
    notifications.push({
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
    });
    
    // Manter apenas as últimas 50 notificações
    if (notifications.length > 50) {
        notifications.shift();
    }
    
    // Enviar para clientes conectados
    broadcastNotification(notification);
}

module.exports = { router, addNotification };
