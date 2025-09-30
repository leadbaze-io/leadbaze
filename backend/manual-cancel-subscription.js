const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function manualCancelSubscription() {
  const userId = '4b518881-21e6-42d5-9958-c794b63d460e';
  
  console.log('🚫 [CANCELAMENTO MANUAL] ===== CANCELANDO ASSINATURA MANUALMENTE =====');
  console.log(`👤 [CANCELAMENTO] User ID: ${userId}`);
  
  try {
    // 1. Verificar estrutura da tabela
    console.log('\n🔍 [CANCELAMENTO] Verificando estrutura da tabela...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_payment_subscriptions')
      .order('ordinal_position');
    
    if (columnsError) {
      console.log('⚠️ [CANCELAMENTO] Não foi possível verificar estrutura da tabela');
    } else {
      console.log('📋 [CANCELAMENTO] Colunas disponíveis:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    }
    
    // 2. Buscar assinatura atual
    console.log('\n🔍 [CANCELAMENTO] Buscando assinatura atual...');
    const { data: subscription, error: subError } = await supabase
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
    
    if (subError) {
      console.error('❌ [CANCELAMENTO] Erro ao buscar assinatura:', subError.message);
      return;
    }
    
    console.log('✅ [CANCELAMENTO] Assinatura encontrada:');
    console.log(`  - ID: ${subscription.id}`);
    console.log(`  - Plano: ${subscription.payment_plans.display_name}`);
    console.log(`  - Status atual: ${subscription.status}`);
    console.log(`  - Acesso até: ${subscription.current_period_end}`);
    console.log(`  - Leads restantes: ${subscription.leads_balance}`);
    console.log(`  - Perfect Pay Transaction ID: ${subscription.perfect_pay_transaction_id}`);
    console.log(`  - Perfect Pay Subscription ID: ${subscription.perfect_pay_subscription_id}`);
    
    // 3. Cancelar assinatura manualmente (sem usar o serviço)
    console.log('\n🔄 [CANCELAMENTO] Executando cancelamento manual...');
    
    const updateData = {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: 'admin_request',
      updated_at: new Date().toISOString()
    };
    
    // Adicionar campos se existirem
    if (columns && columns.some(col => col.column_name === 'perfect_pay_cancelled')) {
      updateData.perfect_pay_cancelled = false; // Não foi cancelado no Perfect Pay ainda
    }
    
    if (columns && columns.some(col => col.column_name === 'requires_manual_cancellation')) {
      updateData.requires_manual_cancellation = true;
    }
    
    const { data: updatedSubscription, error: updateError } = await supabase
      .from('user_payment_subscriptions')
      .update(updateData)
      .eq('id', subscription.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ [CANCELAMENTO] Erro ao atualizar assinatura:', updateError.message);
      return;
    }
    
    console.log('✅ [CANCELAMENTO] Assinatura cancelada com sucesso!');
    console.log(`📅 [CANCELAMENTO] Acesso mantido até: ${updatedSubscription.current_period_end}`);
    console.log(`📊 [CANCELAMENTO] Leads restantes: ${updatedSubscription.leads_balance}`);
    
    // 4. Criar ticket de suporte manualmente
    console.log('\n📋 [CANCELAMENTO] Criando ticket de suporte...');
    
    const ticketId = `CANCEL-${Date.now()}-${userId.substring(0, 8)}`;
    const ticketData = {
      ticket_id: ticketId,
      user_id: userId,
      type: 'cancellation',
      priority: 'HIGH',
      status: 'OPEN',
      subject: 'Cancelamento de Assinatura - Requer Ação Manual',
      description: `Usuário ${userId} teve sua assinatura cancelada por solicitação administrativa. Cancelamento local registrado, mas requer cancelamento manual no Perfect Pay.`,
      perfect_pay_subscription_id: subscription.perfect_pay_subscription_id || 'N/A',
      perfect_pay_transaction_id: subscription.perfect_pay_transaction_id || 'N/A',
      metadata: {
        requires_manual_cancellation: true,
        access_until: subscription.current_period_end,
        user_email: 'creaty123456@gmail.com',
        cancellation_reason: 'admin_request',
        admin_action: true
      }
    };
    
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert(ticketData)
      .select()
      .single();
    
    if (ticketError) {
      console.error('❌ [CANCELAMENTO] Erro ao criar ticket:', ticketError.message);
    } else {
      console.log('✅ [CANCELAMENTO] Ticket criado:', ticket.ticket_id);
    }
    
    // 5. Log da atividade
    console.log('\n📝 [CANCELAMENTO] Registrando atividade...');
    const { error: logError } = await supabase
      .from('subscription_activities')
      .insert({
        user_id: userId,
        subscription_id: subscription.id,
        activity_type: 'cancellation',
        description: 'Assinatura cancelada por solicitação administrativa',
        metadata: {
          admin_action: true,
          access_until: subscription.current_period_end,
          requires_manual_cancellation: true
        }
      });
    
    if (logError) {
      console.log('⚠️ [CANCELAMENTO] Não foi possível registrar atividade (tabela pode não existir)');
    } else {
      console.log('✅ [CANCELAMENTO] Atividade registrada');
    }
    
    console.log('\n🎯 [CANCELAMENTO] ===== CANCELAMENTO CONCLUÍDO =====');
    console.log('✅ [CANCELAMENTO] Assinatura cancelada localmente');
    console.log('📅 [CANCELAMENTO] Acesso mantido até:', updatedSubscription.current_period_end);
    console.log('📊 [CANCELAMENTO] Leads restantes:', updatedSubscription.leads_balance);
    console.log('⚠️ [CANCELAMENTO] IMPORTANTE: Cancelar manualmente no Perfect Pay para evitar cobranças futuras');
    console.log('📞 [CANCELAMENTO] Suporte: suporte@leadbaze.io');
    console.log('🎫 [CANCELAMENTO] Ticket criado:', ticketId);
    
  } catch (error) {
    console.error('❌ [CANCELAMENTO] Erro inesperado:', error.message);
  }
}

manualCancelSubscription().catch(console.error);








