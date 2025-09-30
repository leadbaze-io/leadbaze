const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Configuração do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET /api/subscription/original/:userId
 * Obter informações da assinatura original do usuário
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`🔍 [SubscriptionOriginal] Buscando assinatura original para usuário ${userId}`);

    // Buscar informações da assinatura original diretamente
    const { data: subscription, error } = await supabase
      .from('user_payment_subscriptions')
      .select(`
        id,
        user_id,
        plan_id,
        status,
        leads_balance,
        current_period_start,
        current_period_end,
        perfect_pay_transaction_id,
        created_at,
        updated_at,
        payment_plans (
          id,
          name,
          display_name,
          price_cents,
          leads_included
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error) {
      console.error('❌ [SubscriptionOriginal] Erro ao buscar assinatura:', error);
      return res.status(404).json({
        success: false,
        message: 'Assinatura não encontrada',
        error: error.message
      });
    }

    console.log('✅ [SubscriptionOriginal] Assinatura encontrada:', subscription);

    res.json({
      success: true,
      data: subscription
    });

  } catch (error) {
    console.error('❌ [SubscriptionOriginal] Erro interno:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});


module.exports = router;

