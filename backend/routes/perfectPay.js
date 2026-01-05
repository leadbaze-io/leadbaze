const express = require('express');
const PerfectPayService = require('../services/perfectPayService');

const router = express.Router();
const perfectPayService = new PerfectPayService();

/**
 * POST /api/perfect-pay/create-checkout
 * Criar link de checkout para assinatura
 */
router.post('/create-checkout', async (req, res) => {
  try {
    console.log('🆕 [PerfectPay] Solicitação de checkout recebida');
    console.log('🆕 [PerfectPay] Body:', JSON.stringify(req.body, null, 2));

    const { userId, planId } = req.body;

    // Validar dados obrigatórios
    if (!userId || !planId) {
      return res.status(400).json({
        success: false,
        message: 'userId e planId são obrigatórios'
      });
    }

    // Criar checkout
    const result = await perfectPayService.createCheckoutLink(userId, planId);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ [PerfectPay] Erro ao criar checkout:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * POST /api/perfect-pay/webhook
 * Processar webhooks do Perfect Pay (método preferido)
 */
router.post('/webhook', async (req, res) => {
  try {
    console.log('🔔 [PerfectPay] ===== WEBHOOK RECEBIDO (POST) =====');
    console.log('🔔 [PerfectPay] Timestamp:', new Date().toISOString());
    console.log('🔔 [PerfectPay] Headers:', JSON.stringify(req.headers, null, 2));
    console.log('🔔 [PerfectPay] Body:', JSON.stringify(req.body, null, 2));
    console.log('🔔 [PerfectPay] ================================');

    const webhookData = req.body;
    const signature = req.headers['x-signature'] || req.headers['x-perfect-pay-signature'];

    // Processar webhook
    const result = await perfectPayService.processWebhook(webhookData, signature);

    // Responder sempre com 200 para Perfect Pay não reenviar
    res.status(200).json({
      success: true,
      message: 'Webhook processado',
      result
    });

  } catch (error) {
    console.error('❌ [PerfectPay] Erro no webhook:', error.message);

    // Mesmo com erro, responder 200 para não reenviar
    res.status(200).json({
      success: false,
      message: 'Erro no processamento',
      error: error.message
    });
  }
});

/**
 * GET /api/perfect-pay/webhook
 * Processar webhooks do Perfect Pay (fallback para GET)
 */
router.get('/webhook', async (req, res) => {
  try {
    console.log('🔔 [PerfectPay] ===== WEBHOOK RECEBIDO (GET) =====');
    console.log('🔔 [PerfectPay] Timestamp:', new Date().toISOString());
    console.log('🔔 [PerfectPay] Headers:', JSON.stringify(req.headers, null, 2));
    console.log('🔔 [PerfectPay] Query:', JSON.stringify(req.query, null, 2));
    console.log('🔔 [PerfectPay] ================================');

    // Para GET, os dados podem vir nos query parameters
    const webhookData = req.query;
    const signature = req.headers['x-signature'] || req.headers['x-perfect-pay-signature'];

    // Se não há dados nos query params, tentar extrair do body se possível
    if (!webhookData || Object.keys(webhookData).length === 0) {
      console.log('⚠️ [PerfectPay] Nenhum dado recebido via GET');
      return res.status(200).json({
        success: true,
        message: 'Webhook GET recebido mas sem dados',
        note: 'Perfect Pay deve enviar dados via POST'
      });
    }

    // Processar webhook
    const result = await perfectPayService.processWebhook(webhookData, signature);

    // Responder sempre com 200 para Perfect Pay não reenviar
    res.status(200).json({
      success: true,
      message: 'Webhook processado',
      result
    });

  } catch (error) {
    console.error('❌ [PerfectPay] Erro no webhook GET:', error.message);

    // Mesmo com erro, responder 200 para não reenviar
    res.status(200).json({
      success: false,
      message: 'Erro no processamento',
      error: error.message
    });
  }
});

/**
 * GET /api/perfect-pay/test
 * Endpoint de teste
 */
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 [PerfectPay] Teste de conectividade');

    res.json({
      success: true,
      message: 'Perfect Pay Service funcionando!',
      timestamp: new Date().toISOString(),
      config: {
        apiKey: perfectPayService.apiKey ? 'Configurado' : 'Não configurado',
        webhookSecret: perfectPayService.webhookSecret ? 'Configurado' : 'Não configurado',
        baseUrl: perfectPayService.baseUrl
      }
    });

  } catch (error) {
    console.error('❌ [PerfectPay] Erro no teste:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro no teste',
      error: error.message
    });
  }
});

/**
 * GET /api/perfect-pay/plans
 * Listar planos disponíveis
 */
router.get('/plans', async (req, res) => {
  try {
    console.log('📋 [PerfectPay] Listando planos');

    const { data: plans, error } = await perfectPayService.supabase
      .from('payment_plans')
      .select('*')
      .order('price_cents', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar planos: ${error.message}`);
    }

    // Formatar planos para Perfect Pay
    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      displayName: plan.display_name,
      price: plan.price_cents / 100,
      leads: plan.leads_included,
      description: `${plan.leads_included} leads por mês`,
      features: [
        `${plan.leads_included} leads por mês`,
        'Suporte técnico prioritário',
        'Relatórios detalhados',
        'API de integração',
        'Backup automático'
      ]
    }));

    res.json({
      success: true,
      data: formattedPlans
    });

  } catch (error) {
    console.error('❌ [PerfectPay] Erro ao listar planos:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar planos',
      error: error.message
    });
  }
});

/**
 * GET /api/perfect-pay/subscription/:userId
 * Buscar assinatura do usuário
 */
router.get('/subscription/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`📋 [PerfectPay] Buscando assinatura do usuário ${userId}`);

    const { data: subscription, error } = await perfectPayService.supabase
      .from('user_payment_subscriptions')
      .select(`
        *,
        payment_plans (
          name,
          display_name,
          price_cents,
          leads_included
        )
      `)
      .eq('user_id', userId)
      .in('status', ['active', 'cancelled'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw new Error(`Erro ao buscar assinatura: ${error.message}`);
    }

    if (!subscription) {
      return res.json({
        success: true,
        data: null,
        message: 'Nenhuma assinatura encontrada'
      });
    }

    res.json({
      success: true,
      data: {
        id: subscription.id,
        user_id: subscription.user_id,
        plan_id: subscription.plan_id,
        status: subscription.status,
        billing_cycle: 'monthly',
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        // Lógica corrigida para leads
        // leads_used = total do plano - saldo atual
        // leads_remaining = saldo atual
        leads_used: Math.max(0, subscription.payment_plans.leads_included - subscription.leads_balance),
        leads_remaining: subscription.leads_balance,
        leads_limit: subscription.payment_plans.leads_included,
        leads_excess: Math.max(0, subscription.leads_balance - subscription.payment_plans.leads_included), // Leads excedentes
        auto_renewal: true,
        created_at: subscription.created_at,
        updated_at: subscription.updated_at,

        // Dados do plano (compatível com frontend)
        plan_display_name: subscription.payment_plans.display_name,
        plan_name: subscription.payment_plans.name,
        price_monthly: subscription.payment_plans.price_cents / 100,
        features: subscription.payment_plans.features || [],
        is_free_trial: false,
        total_leads: subscription.payment_plans.leads_included,

        // Informações de cancelamento
        cancelled_at: subscription.cancelled_at,
        cancellation_reason: subscription.cancellation_reason,
        is_cancelled: subscription.status === 'cancelled',
        access_until: subscription.current_period_end
      }
    });

  } catch (error) {
    console.error('❌ [PerfectPay] Erro ao buscar assinatura:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar assinatura',
      error: error.message
    });
  }
});

/**
 * POST /api/perfect-pay/cancel/:userId
 * Cancelar assinatura (REGRA 4)
 */
router.post('/cancel/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason = 'user_request' } = req.body;

    console.log(`🚫 [PerfectPay] Solicitação de cancelamento - Usuário: ${userId}`);

    const result = await perfectPayService.cancelSubscription(userId, reason);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      data: {
        subscription: result.subscription,
        accessUntil: result.access_until,
        leadsRemaining: result.leads_remaining
      },
      message: 'Assinatura cancelada com sucesso. Acesso mantido até o fim do período.'
    });

  } catch (error) {
    console.error('❌ [PerfectPay] Erro ao cancelar assinatura:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * GET /api/perfect-pay/refund-eligibility/:userId
 * Verificar elegibilidade para reembolso (REGRA 5)
 */
router.get('/refund-eligibility/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`💰 [PerfectPay] Verificando elegibilidade para reembolso - Usuário: ${userId}`);

    const result = await perfectPayService.checkRefundEligibility(userId);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ [PerfectPay] Erro ao verificar elegibilidade:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * POST /api/perfect-pay/create-checkout-with-type
 * Criar checkout com tipo específico de operação
 */
router.post('/create-checkout-with-type', async (req, res) => {
  try {
    console.log('🆕 [PerfectPay] Solicitação de checkout com tipo específico');
    console.log('🆕 [PerfectPay] Body:', JSON.stringify(req.body, null, 2));

    const { userId, planId, operationType = 'new' } = req.body;

    // Validar dados obrigatórios
    if (!userId || !planId) {
      return res.status(400).json({
        success: false,
        message: 'userId e planId são obrigatórios'
      });
    }

    // Validar tipo de operação
    const validOperations = ['new', 'renewal', 'upgrade', 'downgrade'];
    if (!validOperations.includes(operationType)) {
      return res.status(400).json({
        success: false,
        message: `Tipo de operação inválido. Use: ${validOperations.join(', ')}`
      });
    }

    // Criar checkout
    const result = await perfectPayService.createCheckoutLink(userId, planId, operationType);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ [PerfectPay] Erro ao criar checkout com tipo:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Rota de downgrade REMOVIDA
// Downgrade não é possível via API do Perfect Pay
// Usuário deve cancelar assinatura atual e assinar novo plano

// Rota para fazer upgrade
router.post('/upgrade', async (req, res) => {
  try {
    const { userId, newPlanId, reason } = req.body;

    if (!userId || !newPlanId) {
      return res.status(400).json({
        success: false,
        message: 'userId e newPlanId são obrigatórios'
      });
    }

    console.log(`🔄 [PerfectPay] Iniciando upgrade para usuário ${userId}:`, {
      newPlanId,
      reason
    });

    // Buscar assinatura atual
    const { data: currentSubscription, error: currentError } = await perfectPayService.supabase
      .from('user_payment_subscriptions')
      .select(`
        *,
        payment_plans (
          name,
          display_name,
          price_cents,
          leads_included
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (currentError || !currentSubscription) {
      return res.status(404).json({
        success: false,
        message: 'Assinatura ativa não encontrada'
      });
    }

    // Buscar novo plano (por UUID)
    const { data: newPlan, error: planError } = await perfectPayService.supabase
      .from('payment_plans')
      .select('*')
      .eq('id', newPlanId)
      .single();

    if (planError || !newPlan) {
      return res.status(404).json({
        success: false,
        message: 'Novo plano não encontrado'
      });
    }

    // Verificar se é realmente um upgrade (preço maior)
    const currentPrice = currentSubscription.payment_plans.price_cents;
    const newPrice = newPlan.price_cents;

    if (newPrice <= currentPrice) {
      return res.status(400).json({
        success: false,
        message: 'Operação não é um upgrade válido'
      });
    }

    // Usar link fixo do Perfect Pay (já configurado com valores de teste)
    const checkoutUrl = perfectPayService.getPerfectPayLink(newPlanId);
    const externalReference = `upgrade_${userId}_${newPlanId}_${Date.now()}`;

    res.json({
      success: true,
      message: 'Link de pagamento criado com sucesso',
      checkout_url: checkoutUrl,
      external_reference: externalReference,
      plan_name: newPlan.display_name,
      amount: newPrice / 100,
      price_difference: (newPrice - currentPrice) / 100
    });

  } catch (error) {
    console.error('❌ [PerfectPay] Erro no upgrade:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

module.exports = router;
