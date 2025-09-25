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

    // Buscar informações da assinatura original
    const { data, error } = await supabase.rpc('get_original_subscription_info', {
      p_user_id: userId
    });

    if (error) {
      console.error('❌ [SubscriptionOriginal] Erro ao buscar assinatura original:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar assinatura original',
        error: error.message
      });
    }

    console.log('✅ [SubscriptionOriginal] Assinatura original encontrada:', data);

    res.json({
      success: true,
      data: data
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
 * GET /api/subscription/original/:userId/history
 * Obter histórico de mudanças de plano
 */
router.get('/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`🔍 [SubscriptionOriginal] Buscando histórico para usuário ${userId}`);

    // Buscar histórico de mudanças
    const { data: history, error } = await supabase
      .from('subscription_changes')
      .select(`
        *,
        from_plan:subscription_plans!subscription_changes_from_plan_id_fkey(display_name, price_monthly),
        to_plan:subscription_plans!subscription_changes_to_plan_id_fkey(display_name, price_monthly)
      `)
      .eq('user_id', userId)
      .order('change_date', { ascending: false });

    if (error) {
      console.error('❌ [SubscriptionOriginal] Erro ao buscar histórico:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar histórico',
        error: error.message
      });
    }

    console.log(`✅ [SubscriptionOriginal] ${history.length} mudanças encontradas`);

    res.json({
      success: true,
      data: history
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
 * Verificar elegibilidade para reembolso baseado na data original
 */
router.get('/:userId/refund-eligibility', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`🔍 [SubscriptionOriginal] Verificando elegibilidade para reembolso para usuário ${userId}`);

    // Buscar informações da assinatura original
    const { data: originalInfo, error: originalError } = await supabase.rpc('get_original_subscription_info', {
      p_user_id: userId
    });

    if (originalError || !originalInfo.success) {
      return res.status(404).json({
        success: false,
        message: 'Assinatura original não encontrada'
      });
    }

    const originalDate = new Date(originalInfo.original_subscription_date);
    const now = new Date();
    const daysSinceOriginal = Math.floor((now - originalDate) / (1000 * 60 * 60 * 24));

    // Política de reembolso: 7 dias a partir da data original
    const refundEligible = daysSinceOriginal <= 7;
    const daysRemaining = Math.max(0, 7 - daysSinceOriginal);

    const result = {
      success: true,
      data: {
        original_subscription_date: originalInfo.original_subscription_date,
        first_plan_name: originalInfo.first_plan_name,
        first_plan_price: originalInfo.first_plan_price,
        days_since_original: daysSinceOriginal,
        refund_eligible: refundEligible,
        days_remaining_for_refund: daysRemaining,
        upgrade_count: originalInfo.upgrade_count,
        downgrade_count: originalInfo.downgrade_count,
        total_amount_paid: originalInfo.total_amount_paid,
        policy: {
          refund_period_days: 7,
          based_on_original_date: true,
          note: "Reembolso baseado na data da primeira assinatura, não na data do upgrade"
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

