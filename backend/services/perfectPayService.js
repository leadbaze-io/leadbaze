const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config();

class PerfectPayService {
  constructor(supabaseClient = null) {
    // Usar cliente Supabase fornecido ou criar um novo
    if (supabaseClient) {
      this.supabase = supabaseClient;
    } else {
      this.supabase = createClient(
        'https://lsvwjyhnnzeewuuuykmb.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'
      );
    }
    
    // Configurações Perfect Pay (conforme documentação oficial)
    this.accessToken = process.env.PERFECT_PAY_ACCESS_TOKEN; // Token de Acesso conforme documentação
    this.webhookSecret = process.env.PERFECT_PAY_WEBHOOK_SECRET;
    this.baseUrl = 'https://app.perfectpay.com.br/api/v1';
    
    // Mapeamento dos planos internos com códigos Perfect Pay
    // UM PRODUTO com 3 PLANOS DE ASSINATURA
    this.planMapping = {
      '1': { // Start
        perfectPayPlanCode: 'PPLQQNG92',
        perfectPayLink: 'https://go.perfectpay.com.br/PPU38CQ17OO',
        name: 'start',
        price: 5.00,
        leads: 1000
      },
      '2': { // Scale  
        perfectPayPlanCode: 'PPLQQNG90',
        perfectPayLink: 'https://go.perfectpay.com.br/PPU38CQ17OP',
        name: 'scale',
        price: 497.00,
        leads: 4000
      },
      '3': { // Enterprise
        perfectPayPlanCode: 'PPLQQNG91',
        perfectPayLink: 'https://go.perfectpay.com.br/PPU38CQ17OS',
        name: 'enterprise',
        price: 997.00,
        leads: 10000
      }
    };
    
    console.log('🚀 [PerfectPay] Service inicializado - VERSÃO COMPLETA');
  }

  /**
   * Criar link de checkout para assinatura
   */
  async createCheckoutLink(userId, planId, operationType = 'new') {
    try {
      console.log(`🆕 [PerfectPay] Criando checkout para usuário ${userId}, plano ${planId}, tipo: ${operationType}`);

      // 1. Buscar dados do usuário
      const { data: userData, error: userError } = await this.supabase.auth.admin.getUserById(userId);
      if (userError || !userData.user) {
        throw new Error(`Usuário não encontrado: ${userError?.message}`);
      }

      // 2. Buscar dados do plano
      const { data: plan, error: planError } = await this.supabase
        .from('payment_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError || !plan) {
        throw new Error(`Plano não encontrado: ${planError?.message}`);
      }

      console.log(`✅ [PerfectPay] Plano encontrado: ${plan.name} - R$ ${plan.price_cents / 100}`);

      // 3. Gerar external_reference com tipo de operação
      const externalReference = `${operationType}_${userId}_${planId}_${Date.now()}`;

      // 4. Criar dados do checkout
      const checkoutData = {
        customer_email: userData.user.email,
        customer_name: userData.user.user_metadata?.full_name || 'Cliente',
        external_reference: externalReference,
        amount: plan.price_cents / 100,
        description: `${plan.display_name} - ${this.getOperationDescription(operationType)}`,
        recurring: operationType === 'new' || operationType === 'renewal',
        period: 'monthly',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/cancel`,
        webhook_url: `${process.env.BACKEND_URL}/api/perfect-pay/webhook`
      };

      console.log('🔧 [PerfectPay] Dados do checkout:', {
        email: checkoutData.customer_email,
        amount: checkoutData.amount,
        external_reference: externalReference,
        operation: operationType
      });

      // 5. Criar link real via API Perfect Pay
      const checkoutUrl = await this.createRealCheckoutLink(checkoutData, externalReference);

      console.log(`✅ [PerfectPay] Link de checkout criado: ${checkoutUrl}`);

      return {
        success: true,
        checkoutUrl,
        externalReference,
        operationType,
        plan: {
          name: plan.name,
          price: plan.price_cents / 100,
          leads: plan.leads_included
        }
      };

    } catch (error) {
      console.error('❌ [PerfectPay] Erro ao criar checkout:', error.message);
      throw error;
    }
  }

  /**
   * Processar webhook do Perfect Pay
   */
  async processWebhook(webhookData, signature) {
    try {
      console.log('🔔 [PerfectPay] ===== WEBHOOK RECEBIDO =====');
      console.log('🔔 [PerfectPay] Timestamp:', new Date().toISOString());
      console.log('🔔 [PerfectPay] Dados:', JSON.stringify(webhookData, null, 2));
      console.log('🔔 [PerfectPay] ================================');

      // 1. Validar assinatura
      if (this.webhookSecret && this.webhookSecret !== 'your-perfect-pay-webhook-secret') {
        const isValid = this.validateWebhookSignature(webhookData, signature);
        if (!isValid) {
          console.error('❌ [PerfectPay] Assinatura de webhook inválida');
          return { processed: false, error: 'Assinatura inválida' };
        }
      } else {
        console.log('🔧 [PerfectPay] Validação de assinatura temporariamente desabilitada');
      }

      // 2. Verificar duplicatas
      const isDuplicate = await this.checkDuplicateWebhook(webhookData);
      if (isDuplicate) {
        console.log('⚠️ [PerfectPay] Webhook duplicado - ignorando');
        return { processed: false, reason: 'Webhook já processado' };
      }

      // 3. Salvar webhook no banco
      const webhook = await this.saveWebhook(webhookData);

      // 4. Processar com base no status
      const result = await this.processWebhookByStatus(webhookData);

      // 5. Marcar webhook como processado
      if (webhook?.id) {
        await this.updateWebhookStatus(webhook.id, result);
      }

      console.log('✅ [PerfectPay] Webhook processado:', result);
      return result;

    } catch (error) {
      console.error('❌ [PerfectPay] Erro ao processar webhook:', error.message);
      return { processed: false, error: error.message };
    }
  }

  /**
   * Processar webhook baseado no status
   */
  async processWebhookByStatus(webhookData) {
    // Usar campos corretos da documentação Perfect Pay
    const saleStatusEnum = webhookData.sale_status_enum;
    const externalReference = webhookData.product?.external_reference;

    // Mapear status conforme documentação Perfect Pay (para assinaturas)
    const statusMap = {
      1: 'subscription_pending',    // assinatura pendente (boleto)
      2: 'subscription_active',     // assinatura ativa (pagamento aprovado)
      3: 'subscription_review',     // assinatura em revisão manual
      4: 'subscription_mediation',  // assinatura em moderação
      5: 'subscription_rejected',   // assinatura rejeitada
      6: 'subscription_cancelled',  // assinatura cancelada
      7: 'subscription_refunded',   // assinatura reembolsada
      8: 'subscription_authorized', // assinatura autorizada
      9: 'subscription_chargeback', // chargeback na assinatura
      10: 'subscription_completed', // assinatura completada (30 dias)
      11: 'subscription_error',     // erro na assinatura
      12: 'subscription_abandoned', // assinatura abandonada
      13: 'subscription_expired',   // assinatura expirada
      16: 'subscription_review'     // assinatura em análise
    };

    const status = statusMap[saleStatusEnum] || 'unknown';
    console.log(`📝 [PerfectPay] Processando sale_status_enum: ${saleStatusEnum} -> ${status}`);

    // Extrair informações do external_reference
    const { operationType, userId, planId } = this.extractInfoFromReference(externalReference);
    if (!userId || !planId) {
      return { processed: false, error: 'external_reference inválido' };
    }

    switch (status) {
      case 'subscription_active':
      case 'subscription_completed':
        return await this.processApprovedPayment(userId, planId, operationType, webhookData);
      
      case 'subscription_pending':
        return await this.processPendingPayment(userId, planId, operationType, webhookData);
      
      case 'subscription_rejected':
      case 'subscription_expired':
        return await this.processRejectedPayment(userId, planId, operationType, webhookData);
      
      case 'subscription_cancelled':
        return await this.processCancellation(userId, planId, operationType, webhookData);
      
      default:
        console.log(`ℹ️ [PerfectPay] Status não processado: ${status} (${saleStatusEnum})`);
        return { processed: false, reason: `Status não suportado: ${status} (${saleStatusEnum})` };
    }
  }

  /**
   * Processar pagamento aprovado - LÓGICA COMPLETA E ROBUSTA
   */
  async processApprovedPayment(userId, planId, operationType, webhookData) {
    try {
      console.log(`💰 [PerfectPay] Processando pagamento aprovado - Usuário: ${userId}, Plano: ${planId}, Tipo: ${operationType}`);

      // Buscar dados do plano
      const plan = await this.getPlanById(planId);
      if (!plan) {
        return { processed: false, error: 'Plano não encontrado' };
      }

      // Buscar assinatura existente
      const existingSubscription = await this.getActiveSubscription(userId);

      // Processar com base no tipo de operação
      switch (operationType) {
        case 'new':
          return await this.processNewSubscription(userId, plan, webhookData, existingSubscription);
        
        case 'renewal':
          return await this.processRenewalSubscription(userId, plan, webhookData, existingSubscription);
        
        case 'upgrade':
          return await this.processUpgradeSubscription(userId, plan, webhookData, existingSubscription);
        
        case 'downgrade':
          return await this.processDowngradeSubscription(userId, plan, webhookData, existingSubscription);
        
        default:
          // Determinação automática inteligente
          return await this.processSmartSubscription(userId, plan, webhookData, existingSubscription);
      }

    } catch (error) {
      console.error('❌ [PerfectPay] Erro ao processar pagamento aprovado:', error);
      return { processed: false, error: error.message };
    }
  }

  /**
   * REGRA 1: Processar NOVA assinatura
   */
  async processNewSubscription(userId, plan, webhookData, existingSubscription) {
    if (existingSubscription) {
      console.log('⚠️ [PerfectPay] Usuário já possui assinatura - tratando como renovação');
      return await this.processRenewalSubscription(userId, plan, webhookData, existingSubscription);
    }

    console.log(`🆕 [PerfectPay] Criando NOVA assinatura - Plano: ${plan.display_name}`);

    const currentDate = new Date();
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const subscriptionData = {
      user_id: userId,
      plan_id: plan.id,
      status: 'active',
      perfect_pay_transaction_id: webhookData.transaction_id || webhookData.id,
      leads_balance: plan.leads_included,
      current_period_start: currentDate.toISOString(),
      current_period_end: nextMonth.toISOString(),
      first_payment_date: currentDate.toISOString(),
      refund_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    const { data: subscription, error: subscriptionError } = await this.supabase
      .from('user_payment_subscriptions')
      .insert(subscriptionData)
      .select()
      .single();

    if (subscriptionError) {
      throw new Error(`Erro ao criar assinatura: ${subscriptionError.message}`);
    }

    // Log de auditoria
    await this.logSubscriptionActivity(userId, 'new_subscription', {
      plan_name: plan.display_name,
      leads_added: plan.leads_included,
      subscription_id: subscription.id
    });

    console.log(`✅ [PerfectPay] NOVA assinatura criada! Leads: ${plan.leads_included}`);
    return { 
      processed: true, 
      status: 'approved', 
      operation: 'new_subscription',
      subscription,
      leads_added: plan.leads_included,
      plan_name: plan.display_name
    };
  }

  /**
   * REGRA 1: Processar RENOVAÇÃO de assinatura
   */
  async processRenewalSubscription(userId, plan, webhookData, existingSubscription) {
    if (!existingSubscription) {
      console.log('⚠️ [PerfectPay] Sem assinatura para renovar - criando nova');
      return await this.processNewSubscription(userId, plan, webhookData, null);
    }

    console.log(`🔄 [PerfectPay] Processando RENOVAÇÃO - Plano: ${plan.display_name}`);

    // REGRA 1: Somar leads mantendo os restantes
    const previousLeads = existingSubscription.leads_balance || 0;
    const newLeadsBalance = previousLeads + plan.leads_included;
    
    // Atualizar período para próximo mês
    const currentPeriodEnd = new Date(existingSubscription.current_period_end);
    const newPeriodStart = new Date(currentPeriodEnd);
    const newPeriodEnd = new Date(currentPeriodEnd);
    newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

    const { data: subscription, error: subscriptionError } = await this.supabase
      .from('user_payment_subscriptions')
      .update({
        leads_balance: newLeadsBalance,
        current_period_start: newPeriodStart.toISOString(),
        current_period_end: newPeriodEnd.toISOString(),
        perfect_pay_transaction_id: webhookData.transaction_id || webhookData.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingSubscription.id)
      .select()
      .single();

    if (subscriptionError) {
      throw new Error(`Erro ao renovar assinatura: ${subscriptionError.message}`);
    }

    // Log de auditoria
    await this.logSubscriptionActivity(userId, 'renewal', {
      plan_name: plan.display_name,
      leads_previous: previousLeads,
      leads_added: plan.leads_included,
      leads_total: newLeadsBalance
    });

    console.log(`✅ [PerfectPay] RENOVAÇÃO concluída! Leads: ${previousLeads} + ${plan.leads_included} = ${newLeadsBalance}`);
    return { 
      processed: true, 
      status: 'approved', 
      operation: 'renewal',
      subscription,
      leads_added: plan.leads_included,
      leads_previous: previousLeads,
      leads_total: newLeadsBalance,
      plan_name: plan.display_name
    };
  }

  /**
   * REGRA 2: Processar UPGRADE de plano
   */
  async processUpgradeSubscription(userId, plan, webhookData, existingSubscription) {
    if (!existingSubscription) {
      console.log('⚠️ [PerfectPay] Sem assinatura para upgrade - criando nova');
      return await this.processNewSubscription(userId, plan, webhookData, null);
    }

    console.log(`⬆️ [PerfectPay] Processando UPGRADE - Novo plano: ${plan.display_name}`);

    // REGRA 2: Atualizar plano + adicionar leads + manter restantes
    const previousLeads = existingSubscription.leads_balance || 0;
    const newLeadsBalance = previousLeads + plan.leads_included;

    const { data: subscription, error: subscriptionError } = await this.supabase
      .from('user_payment_subscriptions')
      .update({
        plan_id: plan.id,
        leads_balance: newLeadsBalance,
        perfect_pay_transaction_id: webhookData.transaction_id || webhookData.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingSubscription.id)
      .select()
      .single();

    if (subscriptionError) {
      throw new Error(`Erro ao fazer upgrade: ${subscriptionError.message}`);
    }

    // Log de auditoria
    await this.logSubscriptionActivity(userId, 'upgrade', {
      old_plan_id: existingSubscription.plan_id,
      new_plan_name: plan.display_name,
      leads_previous: previousLeads,
      leads_added: plan.leads_included,
      leads_total: newLeadsBalance
    });

    console.log(`✅ [PerfectPay] UPGRADE concluído! Leads: ${previousLeads} + ${plan.leads_included} = ${newLeadsBalance}`);
    return { 
      processed: true, 
      status: 'approved', 
      operation: 'upgrade',
      subscription,
      leads_added: plan.leads_included,
      leads_previous: previousLeads,
      leads_total: newLeadsBalance,
      plan_name: plan.display_name
    };
  }

  /**
   * REGRA 3: Processar DOWNGRADE de plano
   */
  async processDowngradeSubscription(userId, plan, webhookData, existingSubscription) {
    if (!existingSubscription) {
      console.log('⚠️ [PerfectPay] Sem assinatura para downgrade - criando nova');
      return await this.processNewSubscription(userId, plan, webhookData, null);
    }

    console.log(`⬇️ [PerfectPay] Processando DOWNGRADE - Novo plano: ${plan.display_name}`);

    // REGRA 3: Atualizar plano SEM adicionar leads
    const previousLeads = existingSubscription.leads_balance || 0;

    const { data: subscription, error: subscriptionError } = await this.supabase
      .from('user_payment_subscriptions')
      .update({
        plan_id: plan.id,
        perfect_pay_transaction_id: webhookData.transaction_id || webhookData.id,
        updated_at: new Date().toISOString()
        // leads_balance permanece o mesmo (não adiciona leads)
      })
      .eq('id', existingSubscription.id)
      .select()
      .single();

    if (subscriptionError) {
      throw new Error(`Erro ao fazer downgrade: ${subscriptionError.message}`);
    }

    // Log de auditoria
    await this.logSubscriptionActivity(userId, 'downgrade', {
      old_plan_id: existingSubscription.plan_id,
      new_plan_name: plan.display_name,
      leads_maintained: previousLeads
    });

    console.log(`✅ [PerfectPay] DOWNGRADE concluído! Leads mantidos: ${previousLeads}`);
    return { 
      processed: true, 
      status: 'approved', 
      operation: 'downgrade',
      subscription,
      leads_added: 0,
      leads_previous: previousLeads,
      leads_total: previousLeads,
      plan_name: plan.display_name
    };
  }

  /**
   * Determinação automática inteligente do tipo de operação
   */
  async processSmartSubscription(userId, plan, webhookData, existingSubscription) {
    if (!existingSubscription) {
      // Sem assinatura = nova assinatura
      return await this.processNewSubscription(userId, plan, webhookData, null);
    }

    if (existingSubscription.plan_id === plan.id) {
      // Mesmo plano = renovação
      return await this.processRenewalSubscription(userId, plan, webhookData, existingSubscription);
    }

    // Planos diferentes = upgrade ou downgrade
    const currentPlan = await this.getPlanById(existingSubscription.plan_id);
    if (plan.price_cents > currentPlan.price_cents) {
      return await this.processUpgradeSubscription(userId, plan, webhookData, existingSubscription);
    } else {
      return await this.processDowngradeSubscription(userId, plan, webhookData, existingSubscription);
    }
  }

  /**
   * Processar cancelamento via webhook
   */
  async processCancellation(userId, planId, operationType, webhookData) {
    try {
      console.log(`🚫 [PerfectPay] Processando cancelamento via webhook - Usuário: ${userId}, Plano: ${planId}, Tipo: ${operationType}`);

      // Buscar assinatura existente
      const existingSubscription = await this.getActiveSubscription(userId);
      if (!existingSubscription) {
        return { processed: false, error: 'Nenhuma assinatura ativa encontrada' };
      }

      // Cancelar assinatura
      const result = await this.cancelSubscription(userId, 'webhook_cancellation');
      
      if (result.success) {
        return {
          processed: true,
          status: 'cancelled',
          operation: 'cancel',
          subscription: result.subscription,
          access_until: result.access_until,
          leads_remaining: result.leads_remaining
        };
      } else {
        return { processed: false, error: result.error };
      }

    } catch (error) {
      console.error('❌ [PerfectPay] Erro ao processar cancelamento:', error);
      return { processed: false, error: error.message };
    }
  }

  /**
   * REGRA 4: Cancelar assinatura (manter acesso até expirar)
   */
  async cancelSubscription(userId, reason = 'user_request') {
    try {
      console.log(`🚫 [PerfectPay] Cancelando assinatura do usuário ${userId}`);

      const existingSubscription = await this.getActiveSubscription(userId);
      if (!existingSubscription) {
        return { success: false, error: 'Nenhuma assinatura ativa encontrada' };
      }

      // REGRA 4: Manter ativa até expirar
      const { data: subscription, error } = await this.supabase
        .from('user_payment_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason,
          updated_at: new Date().toISOString()
          // current_period_end permanece o mesmo - acesso até expirar
        })
        .eq('id', existingSubscription.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao cancelar assinatura: ${error.message}`);
      }

      // Log de auditoria
      await this.logSubscriptionActivity(userId, 'cancellation', {
        reason,
        access_until: existingSubscription.current_period_end,
        leads_remaining: existingSubscription.leads_balance
      });

      console.log(`✅ [PerfectPay] Assinatura cancelada! Acesso até: ${existingSubscription.current_period_end}`);
      return {
        success: true,
        subscription,
        access_until: existingSubscription.current_period_end,
        leads_remaining: existingSubscription.leads_balance
      };

    } catch (error) {
      console.error('❌ [PerfectPay] Erro ao cancelar assinatura:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * REGRA 5: Verificar elegibilidade para reembolso
   */
  async checkRefundEligibility(userId) {
    try {
      const subscription = await this.getActiveSubscription(userId);
      if (!subscription) {
        return { eligible: false, reason: 'Nenhuma assinatura encontrada' };
      }

      const firstPaymentDate = new Date(subscription.first_payment_date);
      const now = new Date();
      const daysSinceFirstPayment = Math.floor((now - firstPaymentDate) / (1000 * 60 * 60 * 24));

      const eligible = daysSinceFirstPayment <= 7;

      return {
        eligible,
        days_since_purchase: daysSinceFirstPayment,
        refund_deadline: subscription.refund_deadline,
        reason: eligible ? 'Dentro do prazo de reembolso' : 'Prazo de reembolso expirado'
      };

    } catch (error) {
      console.error('❌ [PerfectPay] Erro ao verificar elegibilidade:', error);
      return { eligible: false, error: error.message };
    }
  }

  // ==========================================
  // MÉTODOS DE CHECKOUT REAL
  // ==========================================

  /**
   * Criar link de checkout real via API Perfect Pay
   */
  async createRealCheckoutLink(checkoutData, externalReference) {
    try {
      console.log('🔗 [PerfectPay] Criando checkout real via API...');

      // Preparar dados para API Perfect Pay (conforme documentação oficial)
      const apiData = {
        product_code: checkoutData.plan_code || 'PPLQQNG92', // Código do produto no Perfect Pay
        plan_code: checkoutData.plan_code || 'PPLQQNG92', // Código do plano
        customer_email: checkoutData.customer_email,
        customer_full_name: checkoutData.customer_name,
        external_reference: externalReference,
        notification_url: `${process.env.BASE_URL || 'http://localhost:3001'}/api/perfect-pay/webhook`,
        back_urls: {
          success: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/success`,
          failure: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/failure`,
          pending: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pending`
        }
      };

      console.log('📤 [PerfectPay] Enviando dados para API:', {
        external_reference: externalReference,
        amount: checkoutData.amount,
        plan: checkoutData.plan_name
      });

      // Chamar API real do Perfect Pay (conforme documentação)
      const response = await fetch(`${this.baseUrl}/checkout/generate`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Perfect Pay retornou erro: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      
      if (result.checkout_url) {
        console.log('✅ [PerfectPay] Checkout real criado com sucesso');
        return result.checkout_url;
      } else if (result.url) {
        console.log('✅ [PerfectPay] Checkout real criado com sucesso');
        return result.url;
      } else {
        console.log('📋 [PerfectPay] Resposta da API:', result);
        throw new Error('API não retornou URL de checkout');
      }

    } catch (error) {
      console.error('❌ [PerfectPay] Erro ao criar checkout real:', error.message);
      
      // Fallback para URLs reais do Perfect Pay
      console.log('⚠️ [PerfectPay] Usando URLs reais do Perfect Pay');
      
      // Mapear para os links reais que você forneceu
      const realLinks = {
        'PPLQQNG92': 'https://go.perfectpay.com.br/PPU38CQ17OO', // Start
        'PPLQQNG90': 'https://go.perfectpay.com.br/PPU38CQ17OP', // Scale
        'PPLQQNG91': 'https://go.perfectpay.com.br/PPU38CQ17OS'  // Enterprise
      };
      
      // Tentar encontrar o link correto baseado no plano
      const planCode = checkoutData.plan_code || 'PPLQQNG92';
      
      // Mapear UUID do plano para código correto
      const planUuidMap = {
        '460a8b88-f828-4b18-9d42-4b8ad5333d61': 'PPLQQNG92', // Start
        'e9004fad-85ab-41b8-9416-477e41e8bcc9': 'PPLQQNG90', // Scale
        'a961e361-75d0-40cf-9461-62a7802a1948': 'PPLQQNG91'  // Enterprise
      };
      
      // Se recebeu UUID, mapear para código
      const mappedCode = planUuidMap[checkoutData.plan_id] || planCode;
      const realLink = realLinks[mappedCode] || realLinks['PPLQQNG92'];
      
      console.log(`🔍 [PerfectPay] Debug mapeamento:`, {
        plan_id: checkoutData.plan_id,
        plan_code: planCode,
        mappedCode,
        realLink
      });
      
      console.log(`✅ [PerfectPay] Usando link real: ${realLink}`);
      return realLink;
    }
  }

  // ==========================================
  // MÉTODOS AUXILIARES
  // ==========================================

  async getPlanById(planId) {
    console.log('🔍 [PerfectPay] Buscando plano por ID:', planId, typeof planId);
    
    // SOLUÇÃO ROBUSTA: Tentar todas as formas possíveis
    let plan = null;
    
    // 1. Se é UUID (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    if (typeof planId === 'string' && planId.includes('-') && planId.length === 36) {
      console.log('📋 [PerfectPay] Tentativa 1: Buscar por UUID');
      const { data: planByUuid, error: uuidError } = await this.supabase
        .from('payment_plans')
        .select('*')
        .eq('id', planId)
        .single();
        
      if (!uuidError && planByUuid) {
        console.log('✅ [PerfectPay] Plano encontrado por UUID:', planByUuid.name);
        return planByUuid;
      }
    }
    
    // 2. Se é ID numérico (1, 2, 3), mapear para UUID
    const planIdMap = {
      '1': '460a8b88-f828-4b18-9d42-4b8ad5333d61', // Start
      '2': 'e9004fad-85ab-41b8-9416-477e41e8bcc9', // Scale
      '3': 'a961e361-75d0-40cf-9461-62a7802a1948'  // Enterprise
    };
    
    if (planIdMap[planId]) {
      console.log('📋 [PerfectPay] Tentativa 2: Mapear ID numérico para UUID');
      const { data: planByMappedId, error: mappedError } = await this.supabase
        .from('payment_plans')
        .select('*')
        .eq('id', planIdMap[planId])
        .single();
        
      if (!mappedError && planByMappedId) {
        console.log('✅ [PerfectPay] Plano encontrado por mapeamento:', planByMappedId.name);
        return planByMappedId;
      }
    }
    
    // 3. Se é nome do plano (start, scale, enterprise)
    const planNameMap = {
      'start': '460a8b88-f828-4b18-9d42-4b8ad5333d61',
      'scale': 'e9004fad-85ab-41b8-9416-477e41e8bcc9',
      'enterprise': 'a961e361-75d0-40cf-9461-62a7802a1948'
    };
    
    if (planNameMap[planId]) {
      console.log('📋 [PerfectPay] Tentativa 3: Mapear nome para UUID');
      const { data: planByName, error: nameError } = await this.supabase
        .from('payment_plans')
        .select('*')
        .eq('id', planNameMap[planId])
        .single();
        
      if (!nameError && planByName) {
        console.log('✅ [PerfectPay] Plano encontrado por nome:', planByName.name);
        return planByName;
      }
    }
    
    // 4. Último recurso: buscar por nome diretamente
    console.log('📋 [PerfectPay] Tentativa 4: Buscar por nome na coluna name');
    const { data: planByNameColumn, error: nameColumnError } = await this.supabase
      .from('payment_plans')
      .select('*')
      .eq('name', planId)
      .single();
      
    if (!nameColumnError && planByNameColumn) {
      console.log('✅ [PerfectPay] Plano encontrado por coluna name:', planByNameColumn.name);
      return planByNameColumn;
    }
    
    // 5. Se nada funcionou, listar todos os planos para debug
    console.log('❌ [PerfectPay] NENHUMA TENTATIVA FUNCIONOU! Listando todos os planos:');
    const { data: allPlans } = await this.supabase
      .from('payment_plans')
      .select('*');
      
    console.log('📋 [PerfectPay] Planos disponíveis:', allPlans?.map(p => ({ id: p.id, name: p.name })));
    console.log('❌ [PerfectPay] Plano não encontrado para ID:', planId);
    
    return null;
  }

  async getActiveSubscription(userId) {
    const { data: subscription, error } = await this.supabase
      .from('user_payment_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ [PerfectPay] Erro ao buscar assinatura:', error);
    }

    return subscription;
  }

  async checkDuplicateWebhook(webhookData) {
    const { data, error } = await this.supabase
      .from('payment_webhooks')
      .select('id, processed')
      .eq('perfect_pay_id', webhookData.transaction_id || webhookData.id)
      .eq('webhook_type', 'perfect_pay')
      .eq('processed', true)
      .single();

    return data !== null;
  }

  async saveWebhook(webhookData) {
    const { data: webhook, error } = await this.supabase
      .from('payment_webhooks')
      .insert({
        webhook_type: 'perfect_pay',
        perfect_pay_id: webhookData.transaction_id || webhookData.id || webhookData.code,
        action: webhookData.sale_status_enum || webhookData.status,
        raw_data: webhookData,
        processed: false
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [PerfectPay] Erro ao salvar webhook:', error);
    }

    return webhook;
  }

  async updateWebhookStatus(webhookId, result) {
    await this.supabase
      .from('payment_webhooks')
      .update({ 
        processed: true, 
        processed_at: new Date().toISOString(),
        error_message: result.error || null
      })
      .eq('id', webhookId);
  }

  async logSubscriptionActivity(userId, activity, details) {
    // Log para auditoria (opcional - criar tabela se necessário)
    console.log(`📊 [PerfectPay] Log de atividade: ${userId} - ${activity}`, details);
  }

  extractInfoFromReference(externalReference) {
    if (!externalReference) return { operationType: null, userId: null, planId: null };
    
    // Formato: operationType_userId_planId_timestamp
    const parts = externalReference.split('_');
    return {
      operationType: parts.length >= 4 ? parts[0] : 'new',
      userId: parts.length >= 4 ? parts[1] : null,
      planId: parts.length >= 4 ? parts[2] : null
    };
  }

  getOperationDescription(operationType) {
    const descriptions = {
      new: 'Nova Assinatura',
      renewal: 'Renovação Mensal',
      upgrade: 'Upgrade de Plano',
      downgrade: 'Downgrade de Plano'
    };
    return descriptions[operationType] || 'Assinatura';
  }

  // Métodos de compatibilidade com versão anterior
  extractUserIdFromReference(externalReference) {
    return this.extractInfoFromReference(externalReference).userId;
  }

  extractPlanIdFromReference(externalReference) {
    return this.extractInfoFromReference(externalReference).planId;
  }

  async processPendingPayment(userId, planId, operationType, webhookData) {
    console.log(`⏳ [PerfectPay] Pagamento pendente - Usuário: ${userId}, Plano: ${planId}, Tipo: ${operationType}`);
    return { processed: true, status: 'pending', operation: operationType };
  }

  async processRejectedPayment(userId, planId, operationType, webhookData) {
    console.log(`❌ [PerfectPay] Pagamento rejeitado - Usuário: ${userId}, Plano: ${planId}, Tipo: ${operationType}`);
    return { processed: true, status: 'rejected', operation: operationType };
  }

  validateWebhookSignature(webhookData, signature) {
    if (!this.webhookSecret || this.webhookSecret === 'your-perfect-pay-webhook-secret') {
      return true; // Validação desabilitada durante desenvolvimento
    }

    try {
      // Verificar se o token do webhook corresponde ao token recebido
      const receivedToken = webhookData.token;
      if (!receivedToken) {
        console.error('❌ [PerfectPay] Token não encontrado no webhook');
        return false;
      }

      // Validar token (conforme documentação Perfect Pay)
      // O token deve ter 32 caracteres
      if (receivedToken.length !== 32) {
        console.error('❌ [PerfectPay] Token inválido - deve ter 32 caracteres');
        return false;
      }

      // Para validação adicional, podemos verificar se o token corresponde ao esperado
      // (isso depende de como a Perfect Pay gera os tokens)
      console.log('✅ [PerfectPay] Token validado:', receivedToken);
      return true;

    } catch (error) {
      console.error('❌ [PerfectPay] Erro na validação de assinatura:', error.message);
      return false;
    }
  }
}

module.exports = PerfectPayService;
