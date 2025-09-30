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

/**
 * GET /api/subscription/original/:userId
 * Rota de compatibilidade para o frontend existente
 */
router.get('/original/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`🔍 [SubscriptionOriginal] Buscando assinatura original para usuário ${userId} (rota /original)`);

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

/**
 * GET /api/subscription/original/:userId/refund-eligibility
 * Rota de compatibilidade para elegibilidade de reembolso
 */
router.get('/original/:userId/refund-eligibility', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`🔍 [SubscriptionOriginal] Verificando elegibilidade para reembolso para usuário ${userId}`);

    // Buscar informações da assinatura original
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

    const originalDate = new Date(subscription.created_at);
    const now = new Date();
    const daysSinceOriginal = Math.floor((now - originalDate) / (1000 * 60 * 60 * 24));

    // Política de reembolso: 7 dias a partir da data original
    const refundEligible = daysSinceOriginal <= 7;
    const daysRemaining = Math.max(0, 7 - daysSinceOriginal);

    const result = {
      success: true,
      data: {
        original_subscription_date: subscription.created_at,
        first_plan_name: subscription.payment_plans?.display_name || 'N/A',
        first_plan_price: subscription.payment_plans?.price_cents || 0,
        days_since_original: daysSinceOriginal,
        refund_eligible: refundEligible,
        days_remaining_for_refund: daysRemaining,
        upgrade_count: 0,
        downgrade_count: 0,
        total_amount_paid: subscription.payment_plans?.price_cents || 0,
        policy: {
          refund_period_days: 7,
          based_on_original_date: true,
          note: "Reembolso baseado na data da primeira assinatura"
        }
      }
    };

    console.log('✅ [SubscriptionOriginal] Elegibilidade verificada:', result.data);

    res.json(result);

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

