const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

class PerfectPayService {
  constructor() {
    // Inicializar Supabase
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Configurações Perfect Pay
    this.apiKey = process.env.PERFECT_PAY_API_KEY;
    this.webhookSecret = process.env.PERFECT_PAY_WEBHOOK_SECRET;
    this.baseUrl = 'https://api.perfectpay.com.br/v2';
    
    console.log('🚀 [PerfectPay] Service inicializado');
  }

  /**
   * Criar link de checkout para assinatura
   */
  async createCheckoutLink(userId, planId) {
    try {
      console.log(`🆕 [PerfectPay] Criando checkout para usuário ${userId}, plano ${planId}`);

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

      // 3. Gerar external_reference único
      const externalReference = `subscription_${userId}_${planId}_${Date.now()}`;

      // 4. Criar dados do checkout
      const checkoutData = {
        customer_email: userData.user.email,
        customer_name: userData.user.user_metadata?.full_name || 'Cliente',
        external_reference: externalReference,
        amount: plan.price_cents / 100, // Perfect Pay usa valor em reais
        description: `${plan.display_name} - Assinatura Mensal`,
        recurring: true,
        period: 'monthly',
        // URLs de retorno
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/cancel`,
        // Webhook URL
        webhook_url: `${process.env.BACKEND_URL}/api/perfect-pay/webhook`
      };

      console.log('🔧 [PerfectPay] Dados do checkout:', {
        email: checkoutData.customer_email,
        amount: checkoutData.amount,
        external_reference: externalReference
      });

      // 5. Para agora, vamos simular a criação do link
      // TODO: Implementar chamada real para API Perfect Pay quando tivermos credenciais
      const checkoutUrl = `https://pay.perfectpay.com.br/checkout/simulate?ref=${externalReference}&amount=${checkoutData.amount}`;

      console.log(`✅ [PerfectPay] Link de checkout criado: ${checkoutUrl}`);

      return {
        success: true,
        checkoutUrl,
        externalReference,
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

      // 1. Validar assinatura (quando tivermos webhook secret real)
      if (this.webhookSecret && this.webhookSecret !== 'your-perfect-pay-webhook-secret') {
        const isValid = this.validateWebhookSignature(webhookData, signature);
        if (!isValid) {
          console.error('❌ [PerfectPay] Assinatura de webhook inválida');
          return { processed: false, error: 'Assinatura inválida' };
        }
      } else {
        console.log('🔧 [PerfectPay] Validação de assinatura temporariamente desabilitada');
      }

      // 2. Salvar webhook no banco
      const { data: webhook, error: webhookError } = await this.supabase
        .from('payment_webhooks')
        .insert({
          webhook_type: 'perfect_pay',
          perfect_pay_id: webhookData.transaction_id || webhookData.id,
          action: webhookData.status,
          raw_data: webhookData,
          processed: false
        })
        .select()
        .single();

      if (webhookError) {
        console.error('❌ [PerfectPay] Erro ao salvar webhook:', webhookError);
      }

      // 3. Processar com base no status
      const result = await this.processWebhookByStatus(webhookData);

      // 4. Marcar webhook como processado
      if (webhook?.id) {
        await this.supabase
          .from('payment_webhooks')
          .update({ 
            processed: true, 
            processed_at: new Date().toISOString(),
            error_message: result.error || null
          })
          .eq('id', webhook.id);
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
    const status = webhookData.status;
    const externalReference = webhookData.external_reference;

    console.log(`📝 [PerfectPay] Processando status: ${status}`);

    // Extrair userId do external_reference
    const userId = this.extractUserIdFromReference(externalReference);
    if (!userId) {
      return { processed: false, error: 'external_reference inválido' };
    }

    switch (status) {
      case 'approved':
      case 'complete':
        return await this.processApprovedPayment(userId, externalReference, webhookData);
      
      case 'pending':
        return await this.processPendingPayment(userId, externalReference, webhookData);
      
      case 'rejected':
      case 'cancelled':
        return await this.processRejectedPayment(userId, externalReference, webhookData);
      
      default:
        console.log(`ℹ️ [PerfectPay] Status não processado: ${status}`);
        return { processed: false, reason: `Status não suportado: ${status}` };
    }
  }

  /**
   * Processar pagamento aprovado
   */
  async processApprovedPayment(userId, externalReference, webhookData) {
    try {
      console.log(`💰 [PerfectPay] Processando pagamento aprovado para usuário ${userId}`);

      // Extrair planId do external_reference
      const planId = this.extractPlanIdFromReference(externalReference);
      if (!planId) {
        return { processed: false, error: 'planId não encontrado no external_reference' };
      }

      // Buscar dados do plano
      const { data: plan, error: planError } = await this.supabase
        .from('payment_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError || !plan) {
        return { processed: false, error: `Plano não encontrado: ${planError?.message}` };
      }

      // Verificar se já existe assinatura ativa
      const { data: existingSubscription } = await this.supabase
        .from('user_payment_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (existingSubscription) {
        console.log('⚠️ [PerfectPay] Usuário já possui assinatura ativa');
        return { processed: false, reason: 'Usuário já possui assinatura ativa' };
      }

      // Criar nova assinatura
      const currentDate = new Date();
      const nextMonth = new Date(currentDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const subscriptionData = {
        user_id: userId,
        plan_id: planId,
        status: 'active',
        perfect_pay_transaction_id: webhookData.transaction_id || webhookData.id,
        leads_balance: plan.leads_included,
        current_period_start: currentDate.toISOString(),
        current_period_end: nextMonth.toISOString(),
        first_payment_date: currentDate.toISOString(),
        refund_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
      };

      const { data: subscription, error: subscriptionError } = await this.supabase
        .from('user_payment_subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (subscriptionError) {
        console.error('❌ [PerfectPay] Erro ao criar assinatura:', subscriptionError);
        return { processed: false, error: `Erro ao criar assinatura: ${subscriptionError.message}` };
      }

      console.log(`✅ [PerfectPay] Assinatura criada com sucesso! Leads adicionados: ${plan.leads_included}`);

      return {
        processed: true,
        status: 'approved',
        subscription_id: subscription.id,
        leads_added: plan.leads_included,
        plan_name: plan.name
      };

    } catch (error) {
      console.error('❌ [PerfectPay] Erro ao processar pagamento aprovado:', error.message);
      return { processed: false, error: error.message };
    }
  }

  /**
   * Processar pagamento pendente
   */
  async processPendingPayment(userId, externalReference, webhookData) {
    console.log(`⏳ [PerfectPay] Pagamento pendente para usuário ${userId}`);
    return { processed: true, status: 'pending' };
  }

  /**
   * Processar pagamento rejeitado/cancelado
   */
  async processRejectedPayment(userId, externalReference, webhookData) {
    console.log(`❌ [PerfectPay] Pagamento rejeitado/cancelado para usuário ${userId}`);
    return { processed: true, status: 'rejected' };
  }

  /**
   * Validar assinatura do webhook
   */
  validateWebhookSignature(webhookData, signature) {
    if (!this.webhookSecret || this.webhookSecret === 'your-perfect-pay-webhook-secret') {
      return true; // Validação desabilitada durante desenvolvimento
    }

    try {
      const payload = JSON.stringify(webhookData);
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      console.error('❌ [PerfectPay] Erro na validação de assinatura:', error.message);
      return false;
    }
  }

  /**
   * Extrair userId do external_reference
   */
  extractUserIdFromReference(externalReference) {
    if (!externalReference) return null;
    
    // Formato: subscription_userId_planId_timestamp
    const parts = externalReference.split('_');
    return parts.length >= 4 ? parts[1] : null;
  }

  /**
   * Extrair planId do external_reference
   */
  extractPlanIdFromReference(externalReference) {
    if (!externalReference) return null;
    
    // Formato: subscription_userId_planId_timestamp
    const parts = externalReference.split('_');
    return parts.length >= 4 ? parts[2] : null;
  }
}

module.exports = PerfectPayService;
