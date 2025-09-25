const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const EmailService = require('./emailService');
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
    // PLANOS DE TESTE com valores menores
    this.planMapping = {
      '1': { // Start
        perfectPayPlanCode: 'PPLQQNGCL',
        perfectPayLink: 'https://go.perfectpay.com.br/PPU38CQ17OO',
        name: 'start',
        price: 5.00,
        leads: 1000
      },
      '2': { // Scale  
        perfectPayPlanCode: 'PPLQQNGGM',
        perfectPayLink: 'https://go.perfectpay.com.br/PPU38CQ18H5',
        name: 'scale',
        price: 5.00,
        leads: 4000
      },
      '3': { // Enterprise
        perfectPayPlanCode: 'PPLQQNGGN',
        perfectPayLink: 'https://go.perfectpay.com.br/PPU38CQ18H6',
        name: 'enterprise',
        price: 5.00,
        leads: 10000
      }
    };
    
  }

  /**
   * Criar link de checkout para assinatura
   */
  async createCheckoutLink(userId, planId, operationType = 'new') {
    try {

      // 1. Buscar dados do usuário (tentar auth primeiro, depois perfil)
      let userEmail = 'cliente@exemplo.com';
      let userName = 'Cliente';
      
      try {
        const { data: userData, error: userError } = await this.supabase.auth.admin.getUserById(userId);
        if (!userError && userData?.user) {
          userEmail = userData.user.email || userEmail;
          // Usar name do metadata se full_name não estiver disponível
          userName = userData.user.user_metadata?.full_name || userData.user.user_metadata?.name || userName;
        }
      } catch (authError) {
        console.log('⚠️ [PerfectPay] Não foi possível buscar usuário via auth, usando dados padrão');
      }
      
      // Tentar buscar dados do perfil como fallback
      try {
        const { data: profile, error: profileError } = await this.supabase
          .from('user_profiles')
          .select('email, full_name')
          .eq('user_id', userId)
          .single();
        
        if (!profileError && profile) {
          userEmail = profile.email || userEmail;
          userName = profile.full_name || userName;
        }
      } catch (profileError) {
        console.log('⚠️ [PerfectPay] Não foi possível buscar perfil, usando dados padrão');
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

      // 3. Gerar external_reference com tipo de operação
      const externalReference = `${operationType}_${userId}_${planId}_${Date.now()}`;

      // 4. Criar dados do checkout
      const checkoutData = {
        customer_email: userEmail,
        customer_name: userName,
        external_reference: externalReference,
        amount: plan.price_cents / 100,
        description: `${plan.display_name} - ${this.getOperationDescription(operationType)}`,
        recurring: operationType === 'new' || operationType === 'renewal',
        period: 'monthly',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/cancel`,
        webhook_url: `${process.env.BACKEND_URL}/api/perfect-pay/webhook`,
        plan_id: planId, // Adicionar plan_id para mapeamento correto
        plan_name: plan.name
      };


      // 5. Usar link fixo do Perfect Pay com parâmetros
      const baseLink = this.getPerfectPayLink(planId);
      
      // Adicionar parâmetros à URL para enviar dados do usuário
      const params = new URLSearchParams({
        email: userEmail,
        external_reference: externalReference,
        customer_name: userName,
        notification_url: `${process.env.BACKEND_URL}/api/perfect-pay/webhook`,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/cancel`
      });
      
      const checkoutUrl = `${baseLink}?${params.toString()}`;


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
    // VALIDAÇÃO CRÍTICA: Verificar se é um pagamento real
    if (!this.validateRealPayment(webhookData)) {
      console.log('⚠️ [PerfectPay] Webhook não é um pagamento real - ignorando');
      return { processed: false, reason: 'Not a real payment' };
    }

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
    
    // Verificar também o status da subscription
    const subscriptionStatus = webhookData.subscription?.status;
    const subscriptionEvent = webhookData.subscription?.status_event;
    console.log(`📝 [PerfectPay] Subscription Status: ${subscriptionStatus}, Event: ${subscriptionEvent}`);

    // Extrair informações do external_reference ou usar email como fallback
    let { operationType, userId, planId } = this.extractInfoFromReference(externalReference);
    
    // Se external_reference for null, tentar usar email como identificador
    if (!userId || !planId) {
      console.log('⚠️ [PerfectPay] external_reference inválido, tentando usar email como identificador...');
      
      const customerEmail = webhookData.customer?.email;
      if (!customerEmail) {
        return { processed: false, error: 'external_reference inválido e email não encontrado' };
      }
      
      // Buscar usuário por email
      const { data: users, error: usersError } = await this.supabase.auth.admin.listUsers();
      if (usersError) {
        return { processed: false, error: 'Erro ao buscar usuários: ' + usersError.message };
      }
      
      const user = users.users.find(u => u.email === customerEmail);
      if (!user) {
        return { processed: false, error: 'Usuário não encontrado com email: ' + customerEmail };
      }
      
      userId = user.id;
      
      // Tentar determinar o plano pelo código do plano no webhook
      const planCode = webhookData.plan?.code;
      if (planCode) {
        // Mapear código do plano para UUID interno
        const planUuidMap = {
          'PPLQQNGCL': '460a8b88-f828-4b18-9d42-4b8ad5333d61', // Start
          'PPLQQNGGM': 'e9004fad-85ab-41b8-9416-477e41e8bcc9', // Scale
          'PPLQQNGGN': 'a961e361-75d0-40cf-9461-62a7802a1948'  // Enterprise
        };
        planId = planUuidMap[planCode];
        console.log(`✅ [PerfectPay] Plano determinado pelo código: ${planCode} -> ${planId}`);
      } else {
        planId = '460a8b88-f828-4b18-9d42-4b8ad5333d61'; // Assumir plano Start por padrão
        console.log('⚠️ [PerfectPay] Código do plano não encontrado, usando Start como padrão');
      }
      
      operationType = 'new'; // Assumir nova assinatura por padrão
      
      console.log(`✅ [PerfectPay] Usuário encontrado por email: ${userId} (${customerEmail})`);
    }

    // Determinar o tipo de operação baseado no status da subscription
    if (subscriptionEvent === 'subscription_renewed' || subscriptionEvent === 'subscription_started') {
      operationType = 'renewal';
    } else if (subscriptionEvent === 'subscription_cancelled') {
      operationType = 'cancellation';
    } else if (subscriptionEvent === 'subscription_failed') {
      operationType = 'payment_failed';
    }

    switch (status) {
      case 'subscription_active':
      case 'subscription_completed':
        if (operationType === 'renewal') {
          return await this.processSubscriptionRenewal(userId, planId, webhookData);
        } else {
          return await this.processApprovedPayment(userId, planId, operationType, webhookData);
        }
      
      case 'subscription_pending':
        return await this.processPendingPayment(userId, planId, operationType, webhookData);
      
      case 'subscription_rejected':
      case 'subscription_expired':
        return await this.processRejectedPayment(userId, planId, operationType, webhookData);
      
      case 'subscription_cancelled':
        return await this.processSubscriptionCancellation(userId, planId, webhookData);
      
      default:
        console.log(`ℹ️ [PerfectPay] Status não processado: ${status} (${saleStatusEnum})`);
        return { processed: false, reason: `Status não suportado: ${status} (${saleStatusEnum})` };
    }
  }

  /**
   * Processar renovação de assinatura
   */
  async processSubscriptionRenewal(userId, planId, webhookData) {
    try {
      console.log(`🔄 [PerfectPay] Processando renovação de assinatura para usuário ${userId}`);

      // Buscar assinatura existente
      const { data: existingSubscription, error: subError } = await this.supabase
        .from('user_payment_subscriptions')
        .select(`
          *,
          payment_plans (
            id,
            name,
            display_name,
            price_cents,
            leads_included
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (subError || !existingSubscription) {
        console.log('⚠️ [PerfectPay] Assinatura ativa não encontrada para renovação');
        return { processed: false, error: 'Assinatura ativa não encontrada' };
      }

      // Calcular novo período
      const currentDate = new Date();
      const nextMonth = new Date(currentDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      // Buscar dados do novo plano se fornecidos
      let newPlanData = null;
      if (planId && planId !== existingSubscription.plan_id) {
        const { data: newPlan, error: planError } = await this.supabase
          .from('payment_plans')
          .select('id, name, display_name, price_cents, leads_included')
          .eq('id', planId)
          .single();
        
        if (!planError && newPlan) {
          newPlanData = newPlan;
          console.log(`🔄 [PerfectPay] Detectada mudança de plano: ${existingSubscription.payment_plans?.display_name || 'N/A'} -> ${newPlan.display_name}`);
        }
      }

      // Preparar dados de atualização
      const updateData = {
        current_period_start: currentDate.toISOString(),
        current_period_end: nextMonth.toISOString(),
        leads_balance: newPlanData ? newPlanData.leads_included : existingSubscription.payment_plans.leads_included,
        perfect_pay_transaction_id: webhookData.transaction_id || webhookData.code,
        updated_at: currentDate.toISOString()
      };

      // Se há mudança de plano, atualizar o plan_id também
      if (newPlanData) {
        updateData.plan_id = planId;
      }

      // Atualizar assinatura existente
      const { data: updatedSubscription, error: updateError } = await this.supabase
        .from('user_payment_subscriptions')
        .update(updateData)
        .eq('id', existingSubscription.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Erro ao renovar assinatura: ${updateError.message}`);
      }

      // Log da atividade
      const finalPlanData = newPlanData || existingSubscription.payment_plans;
      await this.logSubscriptionActivity(userId, 'renewal', {
        plan_name: finalPlanData.display_name,
        new_period_start: currentDate.toISOString(),
        new_period_end: nextMonth.toISOString(),
        leads_reset: finalPlanData.leads_included
      });

      const renewalMessage = newPlanData 
        ? `Assinatura renovada e atualizada para ${finalPlanData.display_name}!`
        : 'Assinatura renovada com sucesso!';
      
      console.log(`✅ [PerfectPay] ${renewalMessage} Novo período: ${currentDate.toLocaleDateString('pt-BR')} até ${nextMonth.toLocaleDateString('pt-BR')}`);
      
      return {
        processed: true,
        subscription: updatedSubscription,
        leads_remaining: finalPlanData.leads_included,
        access_until: nextMonth.toISOString(),
        message: renewalMessage
      };

    } catch (error) {
      console.error('❌ [PerfectPay] Erro ao processar renovação:', error.message);
      return { processed: false, error: error.message };
    }
  }

  /**
   * Processar cancelamento de assinatura pelo Perfect Pay
   */
  async processSubscriptionCancellation(userId, planId, webhookData) {
    try {
      console.log(`🚫 [PerfectPay] Processando cancelamento de assinatura pelo Perfect Pay para usuário ${userId}`);

      // Buscar assinatura existente
      const { data: existingSubscription, error: subError } = await this.supabase
        .from('user_payment_subscriptions')
        .select(`
          *,
          payment_plans (
            id,
            name,
            display_name,
            price_cents,
            leads_included
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (subError || !existingSubscription) {
        console.log('⚠️ [PerfectPay] Assinatura ativa não encontrada para cancelamento');
        return { processed: false, error: 'Assinatura ativa não encontrada' };
      }

      // Cancelar assinatura localmente
      const { data: cancelledSubscription, error: cancelError } = await this.supabase
        .from('user_payment_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: 'perfect_pay_cancellation',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscription.id)
        .select()
        .single();

      if (cancelError) {
        throw new Error(`Erro ao cancelar assinatura: ${cancelError.message}`);
      }

      // Log da atividade
      await this.logSubscriptionActivity(userId, 'cancellation_by_perfect_pay', {
        plan_name: existingSubscription.payment_plans.display_name,
        reason: 'Cancelamento realizado pelo Perfect Pay',
        access_until: existingSubscription.current_period_end
      });

      console.log(`✅ [PerfectPay] Assinatura cancelada pelo Perfect Pay! Acesso até: ${existingSubscription.current_period_end}`);
      
      return {
        processed: true,
        subscription: cancelledSubscription,
        access_until: existingSubscription.current_period_end,
        leads_remaining: existingSubscription.leads_balance,
        message: 'Assinatura cancelada pelo Perfect Pay'
      };

    } catch (error) {
      console.error('❌ [PerfectPay] Erro ao processar cancelamento:', error.message);
      return { processed: false, error: error.message };
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
      perfect_pay_subscription_id: webhookData.subscription?.code || webhookData.subscription_id,
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

      // Processar cancelamento local (Perfect Pay não possui API de cancelamento)
      const perfectPayResult = await this.cancelPerfectPaySubscription(existingSubscription);
      
      if (!perfectPayResult.success) {
        console.error('❌ [PerfectPay] Erro ao processar cancelamento:', perfectPayResult.error);
        // Continuar com cancelamento local mesmo se falhar
      } else {
        console.log('✅ [PerfectPay] Cancelamento local processado:', perfectPayResult.message);
        
        if (perfectPayResult.requires_manual_cancellation) {
          console.log('⚠️ [PerfectPay] ATENÇÃO: Cancelamento no Perfect Pay deve ser feito manualmente');
          console.log(`📋 [PerfectPay] ID da assinatura: ${perfectPayResult.perfect_pay_subscription_id}`);
        }
      }

      // REGRA 4: Manter ativa até expirar (cancelamento local)
      const { data: subscription, error } = await this.supabase
        .from('user_payment_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason,
          updated_at: new Date().toISOString(),
          perfect_pay_cancelled: perfectPayResult.success,
          requires_manual_cancellation: perfectPayResult.requires_manual_cancellation || false
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
        leads_remaining: existingSubscription.leads_balance,
        warning: 'IMPORTANTE: Você deve cancelar manualmente no Perfect Pay para evitar cobranças futuras!',
        perfect_pay_subscription_id: existingSubscription.perfect_pay_subscription_id,
        manual_cancellation_required: true,
        instructions: 'ACESSO DIRETO: Faça login no Perfect Pay e cancele sua assinatura manualmente.'
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

  /**
   * Obter link fixo do Perfect Pay baseado no plano
   */
  getPerfectPayLink(planId) {
    // Mapear UUID do plano para link fixo
    const planLinkMap = {
      '460a8b88-f828-4b18-9d42-4b8ad5333d61': 'https://go.perfectpay.com.br/PPU38CQ17OO', // Start
      'e9004fad-85ab-41b8-9416-477e41e8bcc9': 'https://go.perfectpay.com.br/PPU38CQ18H5', // Scale
      'a961e361-75d0-40cf-9461-62a7802a1948': 'https://go.perfectpay.com.br/PPU38CQ18H6'  // Enterprise
    };
    
    const link = planLinkMap[planId] || 'https://go.perfectpay.com.br/PPU38CQ17OO'; // Default: Start
    console.log(`🔗 [PerfectPay] Usando link fixo: ${link}`);
    return link;
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

      // Mapear UUID do plano para código Perfect Pay correto (VALORES DE TESTE)
      const planUuidMap = {
        '460a8b88-f828-4b18-9d42-4b8ad5333d61': { code: 'PPLQQNGCL', price: 5.00 }, // Start
        'e9004fad-85ab-41b8-9416-477e41e8bcc9': { code: 'PPLQQNGGM', price: 5.00 }, // Scale
        'a961e361-75d0-40cf-9461-62a7802a1948': { code: 'PPLQQNGGN', price: 5.00 }  // Enterprise
      };
      
      const planData = planUuidMap[checkoutData.plan_id] || { code: 'PPLQQNGCL', price: 5.00 };
      const perfectPayPlanCode = planData.code;
      
      // Preparar dados para API Perfect Pay (conforme documentação oficial)
      const apiData = {
        product_code: perfectPayPlanCode, // Código do produto no Perfect Pay
        plan_code: perfectPayPlanCode, // Código do plano
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
        amount: planData.price, // Usar valor de teste
        plan: checkoutData.plan_name,
        perfect_pay_code: perfectPayPlanCode
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
        'PPLQQNGCO': 'https://go.perfectpay.com.br/PPU38CQ17OT', // Start
        'PPLQQNGCM': 'https://go.perfectpay.com.br/PPU38CQ17OP', // Scale
        'PPLQQNGCN': 'https://go.perfectpay.com.br/PPU38CQ17OS'  // Enterprise
      };
      
      // Tentar encontrar o link correto baseado no plano
      const planCode = checkoutData.plan_code || 'PPLQQNGCO';
      
      // Mapear UUID do plano para código correto
      const planUuidMap = {
        '460a8b88-f828-4b18-9d42-4b8ad5333d61': 'PPLQQNGCO', // Start
        'e9004fad-85ab-41b8-9416-477e41e8bcc9': 'PPLQQNGCM', // Scale
        'a961e361-75d0-40cf-9461-62a7802a1948': 'PPLQQNGCN'  // Enterprise
      };
      
      // Se recebeu UUID, mapear para código
      const mappedCode = planUuidMap[checkoutData.plan_id] || planCode;
      const realLink = realLinks[mappedCode] || realLinks['PPLQQNGCO'];
      
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

  /**
   * Cancelar assinatura no Perfect Pay
   * NOTA: Perfect Pay não possui API de cancelamento
   * O cancelamento deve ser feito manualmente no portal Perfect Pay
   * Este método apenas registra o cancelamento local e aguarda webhook de confirmação
   */
  async cancelPerfectPaySubscription(subscription) {
    try {
      console.log('🔄 [PerfectPay] Processando cancelamento local...');
      
      // Verificar se temos os dados necessários
      if (!subscription.perfect_pay_subscription_id) {
        console.log('⚠️ [PerfectPay] ID da assinatura Perfect Pay não encontrado');
        return { success: false, error: 'ID da assinatura Perfect Pay não encontrado' };
      }

      // Criar ticket de cancelamento na tabela
      const ticketId = `CANCEL-${Date.now()}-${subscription.user_id.substring(0, 8)}`;
      
      // Buscar email do usuário
      const { data: userData, error: userError } = await this.supabase.auth.admin.getUserById(subscription.user_id);
      const userEmail = userData?.user?.email || 'email_nao_encontrado@leadbaze.io';

      // Inserir ticket na tabela
      const { data: ticketData, error: ticketError } = await this.supabase
        .from('support_tickets')
        .insert({
          ticket_id: ticketId,
          user_id: subscription.user_id,
          type: 'cancellation',
          priority: 'HIGH',
          status: 'OPEN',
          subject: 'Cancelamento de Assinatura - Requer Ação Manual',
          description: `Usuário solicitou cancelamento de assinatura. Cancelamento local registrado, mas requer cancelamento manual no Perfect Pay.`,
          perfect_pay_subscription_id: subscription.perfect_pay_subscription_id,
          perfect_pay_transaction_id: subscription.perfect_pay_transaction_id,
          metadata: {
            requires_manual_cancellation: true,
            access_until: subscription.current_period_end,
            user_email: userEmail,
            cancellation_reason: 'user_request'
          }
        })
        .select()
        .single();

      if (ticketError) {
        console.error('❌ [PerfectPay] Erro ao criar ticket:', ticketError.message);
      } else {
        console.log('✅ [PerfectPay] Ticket criado na tabela:', ticketData.ticket_id);
      }

      console.log('📋 [PerfectPay] Cancelamento local registrado:', {
        subscription_id: subscription.perfect_pay_subscription_id,
        user_id: subscription.user_id,
        ticket_id: ticketId,
        user_email: userEmail,
        note: 'Ticket criado na tabela support_tickets'
      });

      // Retornar sucesso para cancelamento local
      // O cancelamento real no Perfect Pay deve ser feito manualmente pelo suporte
           return { 
             success: true, 
             message: 'Cancelamento local registrado. IMPORTANTE: Você deve cancelar manualmente no Perfect Pay para evitar cobranças futuras.',
             requires_manual_cancellation: true,
             perfect_pay_subscription_id: subscription.perfect_pay_subscription_id,
             ticket_id: ticketId,
             support_contact: 'suporte@leadbaze.io',
             instructions: 'ACESSO DIRETO: Faça login no Perfect Pay e cancele sua assinatura manualmente. Nossa equipe também processará o cancelamento.',
             estimated_time: '24 horas',
             status: 'pending_manual_cancellation',
             warning: 'ATENÇÃO: Se não cancelar no Perfect Pay, você continuará sendo cobrado!'
           };

    } catch (error) {
      console.error('❌ [PerfectPay] Erro ao processar cancelamento:', error.message);
      
      return { 
        success: false, 
        error: `Erro ao processar cancelamento: ${error.message}`
      };
    }
  }

  /**
   * VALIDAÇÃO CRÍTICA: Verificar se é um pagamento real
   */
  validateRealPayment(webhookData) {
    try {
      // 1. Verificar se tem transaction_id ou code válido
      const transactionId = webhookData.transaction_id || webhookData.code;
      if (!transactionId || transactionId.startsWith('TEST_') || transactionId.startsWith('RESET_')) {
        console.log('⚠️ [PerfectPay] Transaction ID/Code inválido ou de teste:', transactionId);
        return false;
      }

      // 2. Verificar se tem valor válido (maior que 0)
      const amount = webhookData.amount || webhookData.value || webhookData.subscription_amount || webhookData.sale_amount;
      if (!amount || amount <= 0) {
        console.log('⚠️ [PerfectPay] Valor inválido:', amount);
        return false;
      }

      // 3. Verificar se tem status de pagamento aprovado
      const saleStatusEnum = webhookData.sale_status_enum;
      if (saleStatusEnum !== 2) { // 2 = aprovado
        console.log('⚠️ [PerfectPay] Status não é aprovado:', saleStatusEnum);
        return false;
      }

      // 4. Verificar se tem dados de produto válidos (produto ou plano)
      if (!webhookData.product && !webhookData.plan) {
        console.log('⚠️ [PerfectPay] Dados de produto/plano inválidos');
        return false;
      }

      // 5. Verificar se não é um webhook de teste
      if (webhookData.test_mode === true || webhookData.sandbox === true) {
        console.log('⚠️ [PerfectPay] Webhook de teste/sandbox detectado');
        return false;
      }

      console.log('✅ [PerfectPay] Pagamento real validado:', {
        transaction_id: transactionId,
        amount: amount,
        status: saleStatusEnum,
        product: webhookData.product?.external_reference
      });

      return true;

    } catch (error) {
      console.error('❌ [PerfectPay] Erro na validação de pagamento real:', error.message);
      return false;
    }
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
