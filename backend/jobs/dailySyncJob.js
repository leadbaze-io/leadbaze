const cron = require('node-cron');
const SubscriptionSyncService = require('../services/subscriptionSyncService');
const RecurringPaymentSyncService = require('../services/recurringPaymentSync');

class DailySyncJob {
  constructor() {
    this.syncService = new SubscriptionSyncService();
    this.recurringService = new RecurringPaymentSyncService();
    this.isRunning = false;
  }

  /**
   * Iniciar o job de sincronização diária
   */
  start() {
    console.log('⏰ [Cron] Iniciando job de sincronização diária...');
    
    // Executar todos os dias às 6:00 AM (horário de Brasília)
    this.job = cron.schedule('0 6 * * *', async () => {
      await this.runDailySync();
    }, {
      scheduled: true,
      timezone: 'America/Sao_Paulo'
    });
    
    console.log('✅ [Cron] Job de sincronização diária agendado para 6:00 AM (Brasília)');
  }

  /**
   * Executar sincronização diária
   */
  async runDailySync() {
    if (this.isRunning) {
      console.log('⚠️ [Cron] Sincronização já está em execução, pulando...');
      return;
    }

    try {
      this.isRunning = true;
      console.log('🔄 [Cron] Iniciando sincronização diária automática...');
      
      // 1. Sincronizar assinaturas (status, cancelamentos, upgrades)
      console.log('📋 [Cron] Etapa 1: Sincronizando assinaturas...');
      const syncResult = await this.syncService.syncAllSubscriptions();
      
      // 2. Processar pagamentos de recorrência (adicionar leads)
      console.log('💰 [Cron] Etapa 2: Processando pagamentos recorrentes...');
      const recurringResult = await this.recurringService.processRecurringPayments();
      
      console.log('✅ [Cron] Sincronização diária concluída:', {
        subscriptions: {
          synced: syncResult.synced,
          errors: syncResult.errors,
          total: syncResult.total
        },
        payments: {
          processed: recurringResult.processed,
          leadsAdded: recurringResult.leadsAdded,
          total: recurringResult.total
        }
      });
      
      // Log para monitoramento
      await this.logSyncResult({ syncResult, recurringResult });
      
    } catch (error) {
      console.error('❌ [Cron] Erro na sincronização diária:', error.message);
      
      // Log de erro para monitoramento
      await this.logSyncError(error);
      
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Executar sincronização manual (para testes)
   */
  async runManualSync() {
    console.log('🔄 [Manual] Executando sincronização manual...');
    return await this.runDailySync();
  }

  /**
   * Parar o job
   */
  stop() {
    if (this.job) {
      this.job.stop();
      console.log('⏹️ [Cron] Job de sincronização diária parado');
    }
  }

  /**
   * Verificar se está rodando
   */
  isJobRunning() {
    return this.isRunning;
  }

  /**
   * Log do resultado da sincronização
   */
  async logSyncResult(result) {
    try {
      const logData = {
        type: 'daily_sync',
        status: 'success',
        synced: result.synced,
        errors: result.errors,
        total: result.total,
        timestamp: new Date().toISOString()
      };
      
      // Aqui você pode salvar em uma tabela de logs ou enviar para um serviço de monitoramento
      console.log('📊 [Log] Resultado da sincronização:', logData);
      
    } catch (error) {
      console.error('❌ [Log] Erro ao registrar resultado:', error.message);
    }
  }

  /**
   * Log de erro da sincronização
   */
  async logSyncError(error) {
    try {
      const logData = {
        type: 'daily_sync',
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      // Aqui você pode salvar em uma tabela de logs ou enviar para um serviço de monitoramento
      console.log('📊 [Log] Erro da sincronização:', logData);
      
    } catch (logError) {
      console.error('❌ [Log] Erro ao registrar erro:', logError.message);
    }
  }
}

module.exports = DailySyncJob;
