const express = require('express');
const router = express.Router();
const RecurringPaymentSyncService = require('../services/recurringPaymentSync');

const recurringService = new RecurringPaymentSyncService();

/**
 * POST /api/recurring-payments/process
 * Processar pagamentos de recorrência
 */
router.post('/process', async (req, res) => {
  try {
    console.log('💰 [API] Processando pagamentos de recorrência...');
    
    const result = await recurringService.processRecurringPayments();
    
    res.json({
      success: true,
      message: 'Pagamentos de recorrência processados com sucesso',
      data: result
    });
    
  } catch (error) {
    console.error('❌ [API] Erro no processamento:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro no processamento de pagamentos',
      error: error.message
    });
  }
});

/**
 * GET /api/recurring-payments/status
 * Verificar status dos pagamentos recorrentes
 */
router.get('/status', async (req, res) => {
  try {
    // Buscar estatísticas das assinaturas
    const { data: subscriptions, error } = await recurringService.supabase
      .from('user_payment_subscriptions')
      .select('status, leads_balance')
      .in('status', ['active']);
      
    if (error) {
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
    }
    
    // Calcular estatísticas
    const stats = {
      totalActive: subscriptions.length,
      totalLeadsRemaining: subscriptions.reduce((sum, sub) => sum + (sub.leads_remaining || 0), 0),
      totalChargesProcessed: subscriptions.reduce((sum, sub) => sum + (sub.charges_processed || 0), 0),
      averageLeadsPerUser: subscriptions.length > 0 ? 
        Math.round(subscriptions.reduce((sum, sub) => sum + (sub.leads_remaining || 0), 0) / subscriptions.length) : 0
    };
    
    res.json({
      success: true,
      data: {
        ...stats,
        lastCheck: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ [API] Erro ao buscar status:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar status',
      error: error.message
    });
  }
});

module.exports = router;
