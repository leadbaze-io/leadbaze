const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createSupportTicketsTable() {
  console.log('🔧 [SUPPORT TICKETS] Criando tabela de tickets de suporte...');

  try {
    // Tentar inserir um ticket de teste diretamente
    // Se a tabela não existir, o Supabase vai mostrar o erro
    const testTicket = {
      ticket_id: 'TEST-' + Date.now(),
      user_id: '132bc618-23ef-483e-a96f-2027a8f47619',
      type: 'cancellation',
      priority: 'HIGH',
      subject: 'Teste de Ticket - Cancelamento',
      description: 'Ticket de teste para verificar funcionamento',
      perfect_pay_subscription_id: 'TEST_SUBSCRIPTION_ID',
      metadata: { test: true }
    };

    console.log('🧪 [SUPPORT TICKETS] Testando inserção...');
    const { data: insertData, error: insertError } = await supabase
      .from('support_tickets')
      .insert(testTicket)
      .select();

    if (insertError) {
      if (insertError.message && insertError.message.includes('relation "support_tickets" does not exist')) {
        console.log('❌ [SUPPORT TICKETS] Tabela não existe. Criando manualmente no Supabase...');
        console.log('📋 [SUPPORT TICKETS] Execute este SQL no Supabase Dashboard:');
        console.log('');
        console.log('-- Criar tabela de tickets de suporte');
        console.log('CREATE TABLE IF NOT EXISTS support_tickets (');
        console.log('  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,');
        console.log('  ticket_id VARCHAR(50) UNIQUE NOT NULL,');
        console.log('  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,');
        console.log('  type VARCHAR(50) NOT NULL,');
        console.log('  priority VARCHAR(20) DEFAULT \'MEDIUM\',');
        console.log('  status VARCHAR(20) DEFAULT \'OPEN\',');
        console.log('  subject VARCHAR(200) NOT NULL,');
        console.log('  description TEXT,');
        console.log('  perfect_pay_subscription_id VARCHAR(100),');
        console.log('  perfect_pay_transaction_id VARCHAR(100),');
        console.log('  metadata JSONB,');
        console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
        console.log('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
        console.log('  resolved_at TIMESTAMP WITH TIME ZONE,');
        console.log('  assigned_to VARCHAR(100),');
        console.log('  resolution_notes TEXT');
        console.log(');');
        console.log('');
        console.log('-- Criar índices');
        console.log('CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);');
        console.log('CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);');
        console.log('CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);');
        console.log('CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);');
        console.log('');
        console.log('✅ [SUPPORT TICKETS] Após criar a tabela, execute novamente este script');
      } else {
        console.error('❌ [SUPPORT TICKETS] Erro ao inserir ticket:', insertError.message);
      }
    } else {
      console.log('✅ [SUPPORT TICKETS] Tabela existe e funcionando!');
      console.log('✅ [SUPPORT TICKETS] Ticket de teste inserido:', insertData[0].ticket_id);
      
      // Limpar ticket de teste
      await supabase
        .from('support_tickets')
        .delete()
        .eq('ticket_id', testTicket.ticket_id);
      
      console.log('🧹 [SUPPORT TICKETS] Ticket de teste removido');
      console.log('🎉 [SUPPORT TICKETS] Sistema de tickets está funcionando!');
    }

  } catch (error) {
    console.error('❌ [SUPPORT TICKETS] Erro inesperado:', error.message);
  }
}

createSupportTicketsTable().catch(console.error);
