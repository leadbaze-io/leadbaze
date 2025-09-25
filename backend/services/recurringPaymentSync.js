const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

class RecurringPaymentSyncService {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    this.perfectPayToken = process.env.PERFECT_PAY_ACCESS_TOKEN;
    this.perfectPayBaseUrl = 'https://app.perfectpay.com.br/api/v1';
  }

  /**
   * Verificar e processar pagamentos de recorrência
   */
  async processRecurringPayments() {
    try {
      console.log('💰 [Recurring] Verificando pagamentos de recorrência...');
      
      // 1. Buscar todas as assinaturas ativas no Perfect Pay
      const perfectPaySubscriptions = await this.getAllActiveSubscriptions();
      
      if (!perfectPaySubscriptions || perfectPaySubscriptions.length === 0) {
        console.log('ℹ️ [Recurring] Nenhuma assinatura ativa encontrada');
        return { processed: 0, leadsAdded: 0 };
      }
      
      console.log(`📊 [Recurring] Verificando ${perfectPaySubscriptions.length} assinaturas ativas`);
      
      let processedCount = 0;
      let totalLeadsAdded = 0;
      
      // 2. Para cada assinatura, verificar se houve novo pagamento
      for (const perfectPaySub of perfectPaySubscriptions) {
        try {
          const result = await this.processSingleRecurringPayment(perfectPaySub);
          if (result.processed) {
            processedCount++;
            totalLeadsAdded += result.leadsAdded;
          }
        } catch (error) {
          console.error(`❌ [Recurring] Erro ao processar ${perfectPaySub.customer.email}:`, error.message);
        }
      }
      
      console.log(`✅ [Recurring] Processamento concluído: ${processedCount} pagamentos, ${totalLeadsAdded} leads adicionados`);
      
      return {
        processed: processedCount,
        leadsAdded: totalLeadsAdded,
        total: perfectPaySubscriptions.length
      };
      
    } catch (error) {
      console.error('❌ [Recurring] Erro geral:', error.message);
      throw error;
    }
  }

  /**
   * Processar pagamento de recorrência de uma assinatura
   */
  async processSingleRecurringPayment(perfectPaySub) {
    try {
      const customerEmail = perfectPaySub.customer.email;
      const perfectPayCharges = perfectPaySub.charges_made;
      const nextBillingDate = perfectPaySub.next_date_recurrent;
      const status = perfectPaySub.subscription_status_enum;
      const statusDetail = perfectPaySub.subscription_status_detail;
      
      console.log(`🔍 [Recurring] Verificando ${customerEmail} - Status: ${status}, Cobranças: ${perfectPayCharges}`);
      
      // Buscar usuário no Supabase
      const user = await this.findUserByEmail(customerEmail);
      if (!user) {
        console.log(`⚠️ [Recurring] Usuário não encontrado: ${customerEmail}`);
        return { processed: false, reason: 'user_not_found' };
      }
      
      // Buscar assinatura no nosso banco
      const { data: localSub, error: subError } = await this.supabase
        .from('user_payment_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (subError || !localSub) {
        console.log(`⚠️ [Recurring] Assinatura não encontrada para ${customerEmail}`);
        return { processed: false, reason: 'subscription_not_found' };
      }
      
      // Verificar status da assinatura
      if (status === 4) { // Aguardando pagamento
        console.log(`⚠️ [Recurring] ${customerEmail}: Falha no pagamento (${statusDetail})`);
        await this.handlePaymentFailure(localSub, statusDetail);
        return { processed: true, reason: 'payment_failure' };
      }
      
      if (status === 3) { // Cancelada
        console.log(`❌ [Recurring] ${customerEmail}: Assinatura cancelada (${statusDetail})`);
        await this.handleSubscriptionCancellation(localSub, perfectPaySub);
        return { processed: true, reason: 'subscription_cancelled' };
      }
      
      if (status === 2) { // Ativa - verificar pagamentos
        const localCharges = localSub.charges_processed || 0;
        
        if (perfectPayCharges > localCharges) {
          console.log(`💰 [Recurring] Novo pagamento detectado! ${localCharges} → ${perfectPayCharges}`);
          
          // Calcular quantos pagamentos novos
          const newPayments = perfectPayCharges - localCharges;
          const leadsToAdd = this.calculateLeadsToAdd(perfectPaySub.plan?.name, newPayments);
          
          // Atualizar assinatura com novos leads
          await this.updateSubscriptionWithNewLeads(localSub, leadsToAdd, perfectPayCharges, nextBillingDate);
          
          console.log(`✅ [Recurring] ${customerEmail}: +${leadsToAdd} leads (${newPayments} pagamentos)`);
          
          return { processed: true, leadsAdded: leadsToAdd, newPayments };
        } else {
          console.log(`ℹ️ [Recurring] ${customerEmail}: Sem novos pagamentos`);
          return { processed: false, reason: 'no_new_payments' };
        }
      }
      
      // Status 1 (Teste) - não processar pagamentos
      console.log(`ℹ️ [Recurring] ${customerEmail}: Período de teste - não processar pagamentos`);
      return { processed: false, reason: 'trial_period' };
      
    } catch (error) {
      console.error(`❌ [Recurring] Erro ao processar pagamento:`, error.message);
      throw error;
    }
  }

  /**
   * Calcular quantos leads adicionar baseado no plano e pagamentos
   */
  calculateLeadsToAdd(planName, newPayments) {
    const leadsPerPlan = {
      'LeadBaze Teste Start': 1000,
      'LeadBaze Teste Scale': 4000,
      'LeadBaze Teste Enterprise': 10000
    };
    
    const leadsPerPayment = leadsPerPlan[planName] || 1000;
    return leadsPerPayment * newPayments;
  }

  /**
   * Atualizar assinatura com novos leads
   */
  async updateSubscriptionWithNewLeads(localSub, leadsToAdd, totalCharges, nextBillingDate) {
    try {
      const newLeadsRemaining = (localSub.leads_remaining || 0) + leadsToAdd;
      
      const updateData = {
        leads_remaining: newLeadsRemaining,
        charges_processed: totalCharges,
        next_billing_date: nextBillingDate,
        current_period_end: nextBillingDate,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await this.supabase
        .from('user_payment_subscriptions')
        .update(updateData)
        .eq('id', localSub.id);
        
      if (error) {
        throw new Error(`Erro ao atualizar assinatura: ${error.message}`);
      }
      
      // Log da atualização
      console.log(`📝 [Recurring] Assinatura ${localSub.id} atualizada: +${leadsToAdd} leads`);
      
    } catch (error) {
      console.error(`❌ [Recurring] Erro ao atualizar leads:`, error.message);
      throw error;
    }
  }

  /**
   * Buscar todas as assinaturas no Perfect Pay (ativas, pendentes, canceladas)
   */
  async getAllActiveSubscriptions() {
    try {
      const response = await fetch(`${this.perfectPayBaseUrl}/subscriptions/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.perfectPayToken}`
        },
        body: JSON.stringify({
          subscription_status_enum: [1, 2, 3, 4] // Todos: teste, ativa, cancelada, pendente
        })
      });

      if (!response.ok) {
        throw new Error(`Perfect Pay API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.subscriptions && data.subscriptions.data) {
        return data.subscriptions.data;
      }
      
      return [];
      
    } catch (error) {
      console.error('❌ [Recurring] Erro ao buscar assinaturas ativas:', error.message);
      throw error;
    }
  }

  /**
   * Lidar com falha de pagamento
   */
  async handlePaymentFailure(localSub, statusDetail) {
    try {
      const updateData = {
        status: 'pending',
        updated_at: new Date().toISOString()
      };
      
      const { error } = await this.supabase
        .from('user_payment_subscriptions')
        .update(updateData)
        .eq('id', localSub.id);
        
      if (error) {
        throw new Error(`Erro ao atualizar status para pendente: ${error.message}`);
      }
      
      console.log(`⚠️ [Recurring] Assinatura ${localSub.id} marcada como pendente: ${statusDetail}`);
      
    } catch (error) {
      console.error(`❌ [Recurring] Erro ao lidar com falha de pagamento:`, error.message);
      throw error;
    }
  }

  /**
   * Lidar com cancelamento de assinatura
   */
  async handleSubscriptionCancellation(localSub, perfectPaySub) {
    try {
      const updateData = {
        status: 'cancelled',
        cancelled_at: perfectPaySub.canceled_date || new Date().toISOString(),
        cancellation_reason: `Sincronizado com Perfect Pay: ${perfectPaySub.subscription_status_detail}`,
        updated_at: new Date().toISOString(),
        perfect_pay_cancelled: true,
        requires_manual_cancellation: false // Já foi cancelado no Perfect Pay
      };
      
      const { error } = await this.supabase
        .from('user_payment_subscriptions')
        .update(updateData)
        .eq('id', localSub.id);
        
      if (error) {
        throw new Error(`Erro ao cancelar assinatura: ${error.message}`);
      }
      
      console.log(`❌ [Recurring] Assinatura ${localSub.id} cancelada: ${perfectPaySub.subscription_status_detail}`);
      
    } catch (error) {
      console.error(`❌ [Recurring] Erro ao cancelar assinatura:`, error.message);
      throw error;
    }
  }

  /**
   * Buscar usuário por email
   */
  async findUserByEmail(email) {
    try {
      const { data: users, error } = await this.supabase.auth.admin.listUsers();
      if (error) {
        throw new Error(`Erro ao buscar usuários: ${error.message}`);
      }
      
      return users.users.find(u => u.email === email);
    } catch (error) {
      console.error('❌ [Recurring] Erro ao buscar usuário:', error.message);
      return null;
    }
  }
}

module.exports = RecurringPaymentSyncService;
