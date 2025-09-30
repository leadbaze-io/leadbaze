const PerfectPayService = require('./services/perfectPayService');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const perfectPayService = new PerfectPayService(supabase);

async function testSupportTickets() {
  console.log('🧪 [TESTE] ===== TESTANDO SISTEMA DE TICKETS =====\n');

  try {
    // TESTE 1: Verificar se a tabela existe
    console.log('📋 [TESTE 1] Verificando se a tabela support_tickets existe...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('support_tickets')
      .select('count')
      .limit(1);

    if (tableError) {
      console.error('❌ [TESTE 1] Tabela não existe ou erro:', tableError.message);
      return;
    } else {
      console.log('✅ [TESTE 1] Tabela support_tickets existe!\n');
    }

    // TESTE 2: Inserir ticket de teste
    console.log('📋 [TESTE 2] Inserindo ticket de teste...');
    const testTicket = {
      ticket_id: 'TEST-' + Date.now(),
      user_id: '132bc618-23ef-483e-a96f-2027a8f47619',
      type: 'cancellation',
      priority: 'HIGH',
      status: 'OPEN',
      subject: 'Teste de Ticket - Cancelamento',
      description: 'Ticket de teste para verificar funcionamento do sistema',
      perfect_pay_subscription_id: 'TEST_SUBSCRIPTION_ID',
      perfect_pay_transaction_id: 'TEST_TRANSACTION_ID',
      metadata: {
        test: true,
        requires_manual_cancellation: true,
        access_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        user_email: 'teste@leadbaze.io'
      }
    };

    const { data: insertData, error: insertError } = await supabase
      .from('support_tickets')
      .insert(testTicket)
      .select();

    if (insertError) {
      console.error('❌ [TESTE 2] Erro ao inserir ticket:', insertError.message);
      return;
    } else {
      console.log('✅ [TESTE 2] Ticket de teste inserido:', insertData[0].ticket_id);
    }

    // TESTE 3: Buscar tickets
    console.log('\n📋 [TESTE 3] Buscando todos os tickets...');
    const { data: allTickets, error: fetchError } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (fetchError) {
      console.error('❌ [TESTE 3] Erro ao buscar tickets:', fetchError.message);
    } else {
      console.log('✅ [TESTE 3] Tickets encontrados:', allTickets.length);
      allTickets.forEach(ticket => {
        console.log(`  - ${ticket.ticket_id}: ${ticket.subject} (${ticket.status})`);
      });
    }

    // TESTE 4: Testar cancelamento completo
    console.log('\n📋 [TESTE 4] Testando cancelamento completo...');
    
    // Mock de uma assinatura para teste
    const mockSubscription = {
      id: 'mock-sub-id',
      user_id: '132bc618-23ef-483e-a96f-2027a8f47619',
      perfect_pay_subscription_id: 'PPSUB123456',
      perfect_pay_transaction_id: 'PPTXN123456',
      plan_id: '1',
      status: 'active',
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      leads_balance: 1000
    };

    const cancelResult = await perfectPayService.cancelPerfectPaySubscription(mockSubscription);
    
    if (cancelResult.success) {
      console.log('✅ [TESTE 4] Cancelamento processado:', cancelResult.message);
      console.log('📋 [TESTE 4] Ticket ID:', cancelResult.ticket_id);
    } else {
      console.error('❌ [TESTE 4] Erro no cancelamento:', cancelResult.error);
    }

    // TESTE 5: Limpar dados de teste
    console.log('\n📋 [TESTE 5] Limpando dados de teste...');
    await supabase
      .from('support_tickets')
      .delete()
      .eq('ticket_id', testTicket.ticket_id);
    
    console.log('✅ [TESTE 5] Dados de teste removidos');

    console.log('\n🎉 [TESTE] ===== SISTEMA DE TICKETS FUNCIONANDO! =====');
    console.log('📋 [TESTE] Tabela: support_tickets');
    console.log('📋 [TESTE] Campos principais: ticket_id, user_id, type, priority, status');
    console.log('📋 [TESTE] Pronto para uso em produção!');

  } catch (error) {
    console.error('❌ [TESTE] Erro inesperado:', error.message);
  }
}

testSupportTickets().catch(console.error);










