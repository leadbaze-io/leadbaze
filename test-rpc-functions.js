// Script para testar as funções RPC do sistema de controle de leads
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRPCFunctions() {
  console.log('🧪 Testando Funções RPC do Sistema de Controle de Leads...\n');

  // ID do usuário creaty1234567@gmail.com (você pode obter isso do Supabase Dashboard)
  const userId = '5069fa1e-5de4-44f8-9f45-8ef95a57f0b0'; // ID correto do usuário creaty1234567@gmail.com

  try {
    // 1. Testar verificação de disponibilidade
    console.log('1️⃣ Testando check_leads_availability...');
    const { data: availability, error: availError } = await supabase.rpc('check_leads_availability', {
      p_user_id: userId,
      p_leads_to_generate: 5
    });

    if (availError) {
      console.error('❌ Erro ao verificar disponibilidade:', availError);
    } else {
      console.log('✅ Verificação de disponibilidade:');
      console.log(`   - Pode gerar: ${availability.can_generate}`);
      console.log(`   - Motivo: ${availability.reason}`);
      console.log(`   - Mensagem: ${availability.message}`);
      console.log(`   - Leads restantes: ${availability.leads_remaining}`);
      console.log(`   - Limite total: ${availability.leads_limit}\n`);
    }

    // 2. Testar status da assinatura
    console.log('2️⃣ Testando get_subscription_status...');
    const { data: status, error: statusError } = await supabase.rpc('get_subscription_status', {
      p_user_id: userId
    });

    if (statusError) {
      console.error('❌ Erro ao buscar status:', statusError);
    } else {
      console.log('✅ Status da assinatura:');
      console.log(`   - Tem assinatura: ${status.has_subscription}`);
      if (status.has_subscription) {
        console.log(`   - Plano: ${status.plan_display_name}`);
        console.log(`   - Leads usados: ${status.leads_used}`);
        console.log(`   - Leads restantes: ${status.leads_remaining}`);
        console.log(`   - Limite total: ${status.leads_limit}`);
        console.log(`   - Dias restantes: ${status.days_remaining}\n`);
      }
    }

    // 3. Testar consumo de leads (se disponível)
    if (availability && availability.can_generate) {
      console.log('3️⃣ Testando consume_leads...');
      const { data: consumeResult, error: consumeError } = await supabase.rpc('consume_leads', {
        p_user_id: userId,
        p_leads_consumed: 5,
        p_operation_reason: 'teste_integracao_js'
      });

      if (consumeError) {
        console.error('❌ Erro ao consumir leads:', consumeError);
      } else {
        console.log('✅ Consumo de leads:');
        console.log(`   - Sucesso: ${consumeResult.success}`);
        console.log(`   - Mensagem: ${consumeResult.message}`);
        console.log(`   - Leads consumidos: ${consumeResult.leads_consumed}`);
        console.log(`   - Leads restantes: ${consumeResult.leads_remaining}\n`);
      }
    } else {
      console.log('⚠️ Pulando teste de consumo - leads insuficientes\n');
    }

    // 4. Verificar histórico de uso
    console.log('4️⃣ Verificando histórico de uso...');
    const { data: history, error: historyError } = await supabase
      .from('leads_usage_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (historyError) {
      console.error('❌ Erro ao buscar histórico:', historyError);
    } else {
      console.log(`✅ Últimas ${history.length} operações:`);
      history.forEach((record, index) => {
        const date = new Date(record.created_at).toLocaleString('pt-BR');
        console.log(`   ${index + 1}. ${date} - ${record.leads_generated} leads (${record.operation_type}) - Restantes: ${record.remaining_leads}`);
      });
    }

    console.log('\n✅ Teste das funções RPC concluído!');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar teste
testRPCFunctions();
