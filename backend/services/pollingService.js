const { getBlogAutomationService } = require('./blogAutomationService');

class PollingService {
    constructor() {
        this.isRunning = false;
        this.interval = null;
        this.intervalMs = 30000; // 30 segundos
        
        console.log('⏰ PollingService inicializado');
    }
    
    /**
     * Iniciar polling automático
     */
    start() {
        if (this.isRunning) {
            console.log('⚠️ PollingService já está rodando');
            return;
        }
        
        this.isRunning = true;
        console.log(`⏰ [Polling] Iniciando polling automático a cada ${this.intervalMs/1000} segundos`);
        
        this.interval = setInterval(async () => {
            await this.checkAndProcess();
        }, this.intervalMs);
        
        // Verificar imediatamente
        setImmediate(() => this.checkAndProcess());
    }
    
    /**
     * Parar polling
     */
    stop() {
        if (!this.isRunning) {
            console.log('⚠️ PollingService não está rodando');
            return;
        }
        
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        
        this.isRunning = false;
        console.log('🛑 [Polling] Polling parado');
    }
    
    /**
     * Verificar e processar itens pendentes
     */
    async checkAndProcess() {
        try {
            const blogService = getBlogAutomationService();
            const pendingCount = await blogService.getPendingCount();
            
            if (pendingCount > 0) {
                console.log(`🔄 [Polling] ${pendingCount} itens pendentes detectados, processando...`);
                
                const result = await blogService.processQueueItems(3);
                console.log(`✅ [Polling] Processamento concluído: ${result.processed} processados, ${result.errors} erros`);
            } else {
                console.log('✅ [Polling] Nenhum item pendente');
            }
            
        } catch (error) {
            console.error('❌ [Polling] Erro no polling:', error);
        }
    }
}

// Instância singleton
let pollingServiceInstance = null;

/**
 * Obter instância do serviço (singleton)
 */
function getPollingService() {
    if (!pollingServiceInstance) {
        pollingServiceInstance = new PollingService();
    }
    return pollingServiceInstance;
}

module.exports = {
    PollingService,
    getPollingService
};
