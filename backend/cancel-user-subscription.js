const PerfectPayService = require('./services/perfectPayService');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const perfectPayService = new PerfectPayService(supabase);

async function cancelUserSubscription() {
  const userId = '4b518881-21e6-42d5-9958-c794b63d460e';
  
  console.log('🚫 [CANCELAMENTO] ===== CANCELANDO ASSINATURA DO USUÁRIO =====');
  console.log(`👤 [CANCELAMENTO] User ID: ${userId}`);
  
  try {
    // 1. Verificar se o usuário existe
    console.log('\n🔍 [CANCELAMENTO] Verificando usuário...');
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError) {
      console.error('❌ [CANCELAMENTO] Erro ao buscar usuário:', userError.message);
      return;
    }
    
    if (!userData.user) {
      console.error('❌ [CANCELAMENTO] Usuário não encontrado!');
      return;
    }
    
    console.log('✅ [CANCELAMENTO] Usuário encontrado:', userData.user.email);
    
    // 2. Verificar assinatura ativa
    console.log('\n🔍 [CANCELAMENTO] Verificando assinatura ativa...');
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
    
    if (subError && subError.code !== 'PGRST116') {
      console.error('❌ [CANCELAMENTO] Erro ao buscar assinatura:', subError.message);
      return;
    }
    
    if (!subscription) {
      console.log('ℹ️ [CANCELAMENTO] Nenhuma assinatura ativa encontrada para este usuário');
      return;
    }
    
    console.log('✅ [CANCELAMENTO] Assinatura ativa encontrada:');
    console.log(`  - Plano: ${subscription.payment_plans.display_name}`);
    console.log(`  - Status: ${subscription.status}`);
    console.log(`  - Acesso até: ${subscription.current_period_end}`);
    console.log(`  - Leads restantes: ${subscription.leads_balance}`);
    console.log(`  - Perfect Pay ID: ${subscription.perfect_pay_subscription_id}`);
    
    // 3. Confirmar cancelamento
    console.log('\n⚠️ [CANCELAMENTO] ATENÇÃO: Esta ação irá cancelar a assinatura!');
    console.log('📋 [CANCELAMENTO] Detalhes do cancelamento:');
    console.log('  - O acesso será mantido até o final do período pago');
    console.log('  - Será criado um ticket de suporte para cancelamento manual no Perfect Pay');
    console.log('  - O usuário receberá instruções para cancelar manualmente no Perfect Pay');
    
    // 4. Executar cancelamento
    console.log('\n🔄 [CANCELAMENTO] Executando cancelamento...');
    const cancelResult = await perfectPayService.cancelSubscription(userId, 'admin_request');
    
    if (cancelResult.success) {
      console.log('✅ [CANCELAMENTO] Assinatura cancelada com sucesso!');
      console.log(`📅 [CANCELAMENTO] Acesso mantido até: ${cancelResult.access_until}`);
      console.log(`📊 [CANCELAMENTO] Leads restantes: ${cancelResult.leads_remaining}`);
      
      if (cancelResult.warning) {
        console.log(`⚠️ [CANCELAMENTO] AVISO: ${cancelResult.warning}`);
      }
      
      if (cancelResult.perfect_pay_subscription_id) {
        console.log(`🔗 [CANCELAMENTO] ID Perfect Pay: ${cancelResult.perfect_pay_subscription_id}`);
      }
      
      if (cancelResult.instructions) {
        console.log(`📋 [CANCELAMENTO] Instruções: ${cancelResult.instructions}`);
      }
      
    } else {
      console.error('❌ [CANCELAMENTO] Erro ao cancelar assinatura:', cancelResult.error);
    }
    
    // 5. Verificar tickets de suporte criados
    console.log('\n🔍 [CANCELAMENTO] Verificando tickets de suporte...');
    const { data: tickets, error: ticketsError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'cancellation')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (ticketsError) {
      console.error('❌ [CANCELAMENTO] Erro ao buscar tickets:', ticketsError.message);
    } else {
      console.log(`📋 [CANCELAMENTO] Tickets encontrados: ${tickets.length}`);
      tickets.forEach(ticket => {
        console.log(`  - ${ticket.ticket_id}: ${ticket.subject} (${ticket.status})`);
      });
    }
    
    console.log('\n🎯 [CANCELAMENTO] ===== CANCELAMENTO CONCLUÍDO =====');
    console.log('✅ [CANCELAMENTO] Assinatura cancelada localmente');
    console.log('⚠️ [CANCELAMENTO] IMPORTANTE: Cancelar manualmente no Perfect Pay para evitar cobranças futuras');
    console.log('📞 [CANCELAMENTO] Suporte: suporte@leadbaze.io');
    
  } catch (error) {
    console.error('❌ [CANCELAMENTO] Erro inesperado:', error.message);
  }
}

cancelUserSubscription().catch(console.error);








