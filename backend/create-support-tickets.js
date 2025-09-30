const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createSupportTicketsTable() {
  console.log('🔧 [SUPPORT TICKETS] Criando tabela de tickets de suporte...');

  try {
    // SQL para criar a tabela
    const createTableSQL = `
      -- Criar tabela de tickets de suporte
      CREATE TABLE IF NOT EXISTS support_tickets (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        ticket_id VARCHAR(50) UNIQUE NOT NULL,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        priority VARCHAR(20) DEFAULT 'MEDIUM',
        status VARCHAR(20) DEFAULT 'OPEN',
        subject VARCHAR(200) NOT NULL,
        description TEXT,
        perfect_pay_subscription_id VARCHAR(100),
        perfect_pay_transaction_id VARCHAR(100),
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        resolved_at TIMESTAMP WITH TIME ZONE,
        assigned_to VARCHAR(100),
        resolution_notes TEXT
      );
    `;

    // Executar SQL
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: createTableSQL 
    });

    if (error) {
      console.error('❌ [SUPPORT TICKETS] Erro ao criar tabela:', error.message);
      return;
    }

    console.log('✅ [SUPPORT TICKETS] Tabela criada com sucesso!');

    // Criar índices
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
      CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
      CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
      CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);
    `;

    const { error: indexError } = await supabase.rpc('exec_sql', { 
      sql: createIndexesSQL 
    });

    if (indexError) {
      console.error('❌ [SUPPORT TICKETS] Erro ao criar índices:', indexError.message);
    } else {
      console.log('✅ [SUPPORT TICKETS] Índices criados com sucesso!');
    }

    // Testar inserção
    const testTicket = {
      ticket_id: 'TEST-' + Date.now(),
      user_id: '132bc618-23ef-483e-a96f-2027a8f47619', // Usuário de teste
      type: 'cancellation',
      priority: 'HIGH',
      subject: 'Teste de Ticket - Cancelamento',
      description: 'Ticket de teste para verificar funcionamento',
      perfect_pay_subscription_id: 'TEST_SUBSCRIPTION_ID',
      metadata: { test: true }
    };

    const { data: insertData, error: insertError } = await supabase
      .from('support_tickets')
      .insert(testTicket)
      .select();

    if (insertError) {
      console.error('❌ [SUPPORT TICKETS] Erro ao inserir ticket de teste:', insertError.message);
    } else {
      console.log('✅ [SUPPORT TICKETS] Ticket de teste inserido:', insertData[0].ticket_id);
      
      // Limpar ticket de teste
      await supabase
        .from('support_tickets')
        .delete()
        .eq('ticket_id', testTicket.ticket_id);
      
      console.log('🧹 [SUPPORT TICKETS] Ticket de teste removido');
    }

    console.log('\n🎉 [SUPPORT TICKETS] Sistema de tickets configurado com sucesso!');
    console.log('📋 [SUPPORT TICKETS] Tabela: support_tickets');
    console.log('📋 [SUPPORT TICKETS] Campos principais: ticket_id, user_id, type, priority, status');

  } catch (error) {
    console.error('❌ [SUPPORT TICKETS] Erro inesperado:', error.message);
  }
}

createSupportTicketsTable().catch(console.error);










