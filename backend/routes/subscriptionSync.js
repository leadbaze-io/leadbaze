const express = require('express');
const router = express.Router();
const SubscriptionSyncService = require('../services/subscriptionSyncService');

const syncService = new SubscriptionSyncService();

/**
 * POST /api/subscription-sync/sync-all
 * Sincronizar todas as assinaturas com Perfect Pay
 */
router.post('/sync-all', async (req, res) => {
  try {
    console.log('🔄 [API] Iniciando sincronização manual...');
    
    const result = await syncService.syncAllSubscriptions();
    
    res.json({
      success: true,
      message: 'Sincronização concluída com sucesso',
      data: result
    });
    
  } catch (error) {
    console.error('❌ [API] Erro na sincronização:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro na sincronização',
      error: error.message
    });
  }
});

/**
 * POST /api/subscription-sync/sync-by-email
 * Sincronizar assinatura específica por email
 */
router.post('/sync-by-email', async (req, res) => {
  try {
    const { customerEmail } = req.body;
    
    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email do cliente é obrigatório'
      });
    }
    
    console.log(`🔍 [API] Sincronizando assinatura para ${customerEmail}...`);
    
    const result = await syncService.syncByEmail(customerEmail);
    
    res.json({
      success: true,
      message: 'Assinatura sincronizada com sucesso',
      data: result
    });
    
  } catch (error) {
    console.error('❌ [API] Erro na sincronização por email:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro na sincronização',
      error: error.message
    });
  }
});

/**
 * GET /api/subscription-sync/status
 * Verificar status da sincronização
 */
router.get('/status', async (req, res) => {
  try {
    // Buscar estatísticas das assinaturas
    const { data: subscriptions, error } = await syncService.supabase
      .from('user_payment_subscriptions')
      .select('status')
      .in('status', ['active', 'cancelled', 'pending', 'trial']);
      
    if (error) {
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
    }
    
    // Contar por status
    const stats = subscriptions.reduce((acc, sub) => {
      acc[sub.status] = (acc[sub.status] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        total: subscriptions.length,
        byStatus: stats,
        lastSync: new Date().toISOString()
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
