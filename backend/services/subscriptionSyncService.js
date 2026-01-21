const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

class SubscriptionSyncService {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    this.perfectPayToken = process.env.PERFECT_PAY_ACCESS_TOKEN;
    this.perfectPayBaseUrl = 'https://app.perfectpay.com.br/api/v1';
  }

  /**
   * Sincronizar todas as assinaturas com Perfect Pay
   */
  async syncAllSubscriptions() {
    try {
      console.log('🔄 [Sync] Iniciando sincronização diária com Perfect Pay...');

      // 1. Buscar TODAS as assinaturas ativas no Perfect Pay
      const perfectPaySubscriptions = await this.getAllPerfectPaySubscriptions();

      if (!perfectPaySubscriptions || perfectPaySubscriptions.length === 0) {
        console.log('ℹ️ [Sync] Nenhuma assinatura encontrada no Perfect Pay');
        return {
          success: true,
          synced: 0,
          errors: 0,
          total: 0
        };
      }

      console.log(`📊 [Sync] Encontradas ${perfectPaySubscriptions.length} assinaturas ativas no Perfect Pay`);

      let syncedCount = 0;
      let errorCount = 0;
      let createdCount = 0;

      // 2. Para cada assinatura do Perfect Pay, verificar/atualizar no nosso banco
      for (const perfectPaySub of perfectPaySubscriptions) {
        try {
          const result = await this.syncPerfectPaySubscription(perfectPaySub);
          if (result.created) {
            createdCount++;
          }
          syncedCount++;
        } catch (error) {
          console.error(`❌ [Sync] Erro ao sincronizar assinatura ${perfectPaySub.id}:`, error.message);
          errorCount++;
        }
      }

      console.log(`✅ [Sync] Sincronização concluída: ${syncedCount} sucessos, ${errorCount} erros, ${createdCount} criadas`);

      return {
        success: true,
        synced: syncedCount,
        errors: errorCount,
        created: createdCount,
        total: perfectPaySubscriptions.length
      };

    } catch (error) {
      console.error('❌ [Sync] Erro geral na sincronização:', error.message);
      throw error;
    }
  }

  /**
   * Buscar todas as assinaturas ativas no nosso banco
   */
  async getAllOurSubscriptions() {
    try {
      console.log('🔍 [Sync] Buscando assinaturas ativas no nosso banco...');

      const { data: subscriptions, error } = await this.supabase
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
          perfect_pay_subscription_id,
          payment_plans(display_name, leads_included)
        `)
        .eq('status', 'active');

      if (error) {
        throw new Error(`Erro ao buscar assinaturas: ${error.message}`);
      }

      console.log(`📊 [Sync] Encontradas ${subscriptions.length} assinaturas ativas no nosso banco`);
      return subscriptions || [];

    } catch (error) {
      console.error('❌ [Sync] Erro ao buscar assinaturas do nosso banco:', error.message);
      return [];
    }
  }

  /**
   * Sincronizar uma assinatura nossa com Perfect Pay
   */
  async syncOurSubscription(ourSubscription) {
    try {
      console.log(`🔄 [Sync] Sincronizando assinatura ${ourSubscription.id} (${ourSubscription.payment_plans?.display_name})`);

      // Verificar se a assinatura ainda está válida (não expirou)
      const currentDate = new Date();
      const periodEnd = new Date(ourSubscription.current_period_end);

      if (currentDate > periodEnd) {
        console.log(`⚠️ [Sync] Assinatura ${ourSubscription.id} expirada, marcando como inativa`);

        // Marcar como inativa
        await this.supabase
          .from('user_payment_subscriptions')
          .update({
            status: 'expired',
            updated_at: new Date().toISOString()
          })
          .eq('id', ourSubscription.id);

        return { processed: true, action: 'expired' };
      }

      // Verificar se precisa renovar leads (se está próximo do fim do período)
      const daysUntilExpiry = Math.ceil((periodEnd - currentDate) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry <= 1) {
        console.log(`🔄 [Sync] Assinatura ${ourSubscription.id} próxima do vencimento (${daysUntilExpiry} dias)`);

        // Aqui você pode implementar lógica para renovar automaticamente
        // ou aguardar o próximo pagamento via webhook
        return { processed: true, action: 'near_expiry' };
      }

      console.log(`✅ [Sync] Assinatura ${ourSubscription.id} válida por mais ${daysUntilExpiry} dias`);
      return { processed: true, action: 'valid' };

    } catch (error) {
      console.error(`❌ [Sync] Erro ao sincronizar assinatura ${ourSubscription.id}:`, error.message);
      throw error;
    }
  }

  /**
   * Buscar todas as assinaturas ativas no Perfect Pay
   */
  async getAllPerfectPaySubscriptions() {
    try {
      console.log('🔍 [Sync] Buscando todas as assinaturas no Perfect Pay...');

      const response = await fetch(`${this.perfectPayBaseUrl}/subscriptions/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.perfectPayToken}`
        },
        body: JSON.stringify({}) // Sem filtros - busca todas as assinaturas
      });

      if (!response.ok) {
        throw new Error(`Perfect Pay API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.subscriptions && data.subscriptions.data) {
        console.log(`📊 [Sync] Encontradas ${data.subscriptions.data.length} assinaturas no Perfect Pay`);
        return data.subscriptions.data;
      }

      return [];

    } catch (error) {
      console.error('❌ [Sync] Erro ao buscar assinaturas no Perfect Pay:', error.message);
      throw error;
    }
  }

  /**
   * Sincronizar uma assinatura específica
   */
  async syncSingleSubscription(localSubscription) {
    try {
      // Buscar dados do usuário
      const { data: userData, error: userError } = await this.supabase.auth.admin.getUserById(localSubscription.user_id);
      if (userError || !userData.user) {
        throw new Error(`Usuário não encontrado: ${userError?.message}`);
      }

      const userEmail = userData.user.email;

      // Buscar assinatura no Perfect Pay
      const perfectPaySubscription = await this.getPerfectPaySubscription(userEmail);

      if (!perfectPaySubscription) {
        console.log(`⚠️ [Sync] Assinatura não encontrada no Perfect Pay para ${userEmail}`);
        return;
      }

      // Comparar status e atualizar se necessário
      const needsUpdate = this.compareSubscriptionStatus(localSubscription, perfectPaySubscription);

      if (needsUpdate) {
        await this.updateLocalSubscription(localSubscription, perfectPaySubscription);
        console.log(`✅ [Sync] Assinatura ${localSubscription.id} atualizada`);
      } else {
        console.log(`ℹ️ [Sync] Assinatura ${localSubscription.id} já está sincronizada`);
      }

    } catch (error) {
      console.error(`❌ [Sync] Erro ao sincronizar assinatura ${localSubscription.id}:`, error.message);
      throw error;
    }
  }

  /**
   * Sincronizar assinatura do Perfect Pay com nosso banco
   */
  async syncPerfectPaySubscription(perfectPaySub) {
    try {
      const customerEmail = perfectPaySub.customer.email;
      console.log(`🔄 [Sync] Sincronizando assinatura do Perfect Pay: ${customerEmail}`);

      // Buscar usuário pelo email
      const { data: users, error: userError } = await this.supabase.auth.admin.listUsers();
      if (userError) {
        throw new Error(`Erro ao buscar usuários: ${userError.message}`);
      }

      const user = users.users.find(u => u.email === customerEmail);
      if (!user) {
        console.log(`⚠️ [Sync] Usuário não encontrado no Supabase: ${customerEmail}`);
        return { created: false, reason: 'user_not_found' };
      }

      // Verificar se já existe assinatura no nosso banco
      const { data: existingSub, error: subError } = await this.supabase
        .from('user_payment_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subError && subError.code !== 'PGRST116') { // PGRST116 = não encontrado
        throw new Error(`Erro ao buscar assinatura: ${subError.message}`);
      }

      // Mapear status do Perfect Pay (baseado na documentação)
      const statusMap = {
        1: 'trial',      // Período de teste
        2: 'active',     // Ativa
        3: 'cancelled',  // Cancelada
        4: 'pending'      // Aguardando pagamento
      };

      // O Perfect Pay retorna string, não número
      const perfectPayStatus = perfectPaySub.subscription_status_enum;
      let newStatus = 'unknown';

      if (perfectPayStatus === 'Ativa') {
        newStatus = 'active';
      } else if (perfectPayStatus === 'Cancelada') {
        newStatus = 'cancelled';
      } else if (perfectPayStatus === 'Período de teste') {
        newStatus = 'trial';
      } else if (perfectPayStatus === 'Aguardando pagamento') {
        newStatus = 'pending';
      }

      console.log(`🔄 [Sync] Mapeando status: "${perfectPayStatus}" → "${newStatus}"`);

      if (existingSub) {
        // Atualizar assinatura existente
        const updateData = {
          status: newStatus,
          updated_at: new Date().toISOString()
        };

        if (newStatus === 'cancelled' && perfectPaySub.canceled_date) {
          // Converter data do formato DD/MM/YYYY para YYYY-MM-DD
          const dateParts = perfectPaySub.canceled_date.split('/');
          if (dateParts.length === 3) {
            const formattedDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
            updateData.cancelled_at = formattedDate;
          }
        }

        if (newStatus === 'active' && existingSub.cancelled_at) {
          updateData.cancelled_at = null;
        }

        const { error: updateError } = await this.supabase
          .from('user_payment_subscriptions')
          .update(updateData)
          .eq('id', existingSub.id);

        if (updateError) {
          throw new Error(`Erro ao atualizar assinatura: ${updateError.message}`);
        }

        console.log(`✅ [Sync] Assinatura atualizada: ${existingSub.status} → ${newStatus}`);
        return { created: false, updated: true };

      } else {
        // Criar nova assinatura
        const newSubscription = {
          user_id: user.id,
          plan_id: this.mapPerfectPayPlanToLocal(perfectPaySub.plan?.name),
          status: newStatus,
          billing_cycle: 'monthly',
          current_period_start: perfectPaySub.start_date_recurrent,
          current_period_end: perfectPaySub.end_date_recurrent,
          leads_used: 0,
          leads_remaining: this.getLeadsByPlan(perfectPaySub.plan?.name),
          auto_renewal: true,
          gateway_subscription_id: perfectPaySub.id ? perfectPaySub.id.toString() : null,
          gateway_customer_id: customerEmail,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (newStatus === 'cancelled' && perfectPaySub.canceled_date) {
          // Converter data do formato DD/MM/YYYY para YYYY-MM-DD
          const dateParts = perfectPaySub.canceled_date.split('/');
          if (dateParts.length === 3) {
            const formattedDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
            newSubscription.cancelled_at = formattedDate;
          }
        }

        const { error: createError } = await this.supabase
          .from('user_payment_subscriptions')
          .insert(newSubscription);

        if (createError) {
          throw new Error(`Erro ao criar assinatura: ${createError.message}`);
        }

        console.log(`✅ [Sync] Nova assinatura criada: ${newStatus}`);
        return { created: true, updated: false };
      }

    } catch (error) {
      console.error(`❌ [Sync] Erro ao sincronizar assinatura do Perfect Pay:`, error.message);
      throw error;
    }
  }

  /**
   * Mapear plano do Perfect Pay para ID local
   */
  mapPerfectPayPlanToLocal(planName) {
    const planMap = {
      'LeadBaze Teste Start': '460a8b88-f828-4b18-9d42-4b8ad5333d61',
      'LeadBaze Teste Scale': 'e9004fad-85ab-41b8-9416-477e41e8bcc9',
      'LeadBaze Teste Enterprise': 'a961e361-75d0-40cf-9461-62a7802a1948'
    };

    return planMap[planName] || '460a8b88-f828-4b18-9d42-4b8ad5333d61'; // Default: Start
  }

  /**
   * Obter quantidade de leads por plano
   */
  getLeadsByPlan(planName) {
    const leadsMap = {
      'LeadBaze Teste Start': 1000,
      'LeadBaze Teste Scale': 4000,
      'LeadBaze Teste Enterprise': 10000
    };

    return leadsMap[planName] || 1000; // Default: Start
  }

  /**
   * Buscar assinatura no Perfect Pay
   */
  async getPerfectPaySubscription(customerEmail) {
    try {
      const response = await fetch(`${this.perfectPayBaseUrl}/subscriptions/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.perfectPayToken}`
        },
        body: JSON.stringify({
          customer_email: customerEmail,
          subscription_status_enum: [1, 2, 3, 4] // Todos os status
        })
      });

      if (!response.ok) {
        throw new Error(`Perfect Pay API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.subscriptions && data.subscriptions.data && data.subscriptions.data.length > 0) {
        // Retornar a assinatura mais recente
        return data.subscriptions.data[0];
      }

      return null;

    } catch (error) {
      console.error('❌ [Sync] Erro ao buscar assinatura no Perfect Pay:', error.message);
      throw error;
    }
  }

  /**
   * Comparar status das assinaturas
   */
  compareSubscriptionStatus(localSub, perfectPaySub) {
    // Mapear status do Perfect Pay para nosso sistema
    const statusMap = {
      1: 'trial',      // Período de teste
      2: 'active',     // Ativa
      3: 'cancelled',  // Cancelada
      4: 'pending'      // Aguardando pagamento
    };

    const perfectPayStatus = statusMap[perfectPaySub.subscription_status_enum] || 'unknown';
    const localStatus = localSub.status;

    // Verificar se precisa atualizar
    if (perfectPayStatus !== localStatus) {
      console.log(`🔄 [Sync] Status diferente: Local=${localStatus}, Perfect Pay=${perfectPayStatus}`);
      return true;
    }

    // Verificar outras informações importantes
    if (perfectPaySub.canceled_date && !localSub.cancelled_at) {
      console.log(`🔄 [Sync] Data de cancelamento diferente`);
      return true;
    }

    return false;
  }

  /**
   * Atualizar assinatura local com dados do Perfect Pay
   */
  async updateLocalSubscription(localSub, perfectPaySub) {
    try {
      const statusMap = {
        1: 'trial',
        2: 'active',
        3: 'cancelled',
        4: 'pending'
      };

      const newStatus = statusMap[perfectPaySub.subscription_status_enum];

      const updateData = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // Se foi cancelada, adicionar data de cancelamento e novas colunas
      if (newStatus === 'cancelled' && perfectPaySub.canceled_date) {
        updateData.cancelled_at = perfectPaySub.canceled_date;
        updateData.cancellation_reason = 'Sincronizado com Perfect Pay';
        updateData.perfect_pay_cancelled = true;
        updateData.requires_manual_cancellation = false; // Já foi cancelado no Perfect Pay
      }

      // Se foi reativada, remover data de cancelamento e resetar novas colunas
      if (newStatus === 'active' && localSub.cancelled_at) {
        updateData.cancelled_at = null;
        updateData.cancellation_reason = null;
        updateData.perfect_pay_cancelled = false;
        updateData.requires_manual_cancellation = false;
      }

      const { error } = await this.supabase
        .from('user_payment_subscriptions')
        .update(updateData)
        .eq('id', localSub.id);

      if (error) {
        throw new Error(`Erro ao atualizar assinatura: ${error.message}`);
      }

      // Log da atualização
      console.log(`📝 [Sync] Assinatura ${localSub.id} atualizada: ${localSub.status} → ${newStatus}`);

    } catch (error) {
      console.error(`❌ [Sync] Erro ao atualizar assinatura ${localSub.id}:`, error.message);
      throw error;
    }
  }

  /**
   * Verificar assinaturas específicas por email
   */
  async syncByEmail(customerEmail) {
    try {
      console.log(`🔍 [Sync] Verificando assinatura para ${customerEmail}...`);

      // Buscar assinatura local
      const { data: localSub, error: localError } = await this.supabase
        .from('user_payment_subscriptions')
        .select('*')
        .eq('user_id', (await this.supabase.auth.admin.listUsers()).data.users.find(u => u.email === customerEmail)?.id)
        .single();

      if (localError || !localSub) {
        throw new Error(`Assinatura local não encontrada: ${localError?.message}`);
      }

      // Sincronizar
      await this.syncSingleSubscription(localSub);

      return { success: true, message: 'Assinatura sincronizada com sucesso' };

    } catch (error) {
      console.error(`❌ [Sync] Erro ao sincronizar por email:`, error.message);
      throw error;
    }
  }
}

module.exports = SubscriptionSyncService;
