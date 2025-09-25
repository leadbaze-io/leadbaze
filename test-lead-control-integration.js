// Script para testar a integração do sistema de controle de leads
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLeadControlSystem() {
  console.log('🧪 Testando Sistema de Controle de Leads...\n');

  try {
    // 1. Buscar usuário creaty1234567@gmail.com
    console.log('1️⃣ Buscando usuário creaty1234567@gmail.com...');
    const { data: users, error: userError } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', 'creaty1234567@gmail.com');

    if (userError) {
      console.error('❌ Erro ao buscar usuário:', userError);
      return;
    }

    if (!users || users.length === 0) {
      console.error('❌ Usuário não encontrado');
      return;
    }

    const user = users[0];
    console.log(`✅ Usuário encontrado: ${user.email} (ID: ${user.id})\n`);

    // 2. Verificar assinatura atual
    console.log('2️⃣ Verificando assinatura atual...');
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (
          name,
          display_name,
          leads_limit
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (subError && subError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar assinatura:', subError);
      return;
    }

    if (!subscription) {
      console.log('⚠️ Nenhuma assinatura ativa encontrada. Criando assinatura de teste...');
      
      // Buscar plano Start
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('name', 'start')
        .single();

      if (planError) {
        console.error('❌ Erro ao buscar plano:', planError);
        return;
      }

      // Criar assinatura de teste
      const { data: newSubscription, error: createError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: plan.id,
          status: 'active',
          billing_cycle: 'monthly',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          leads_used: 0,
          leads_remaining: plan.leads_limit,
          auto_renewal: true
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Erro ao criar assinatura:', createError);
        return;
      }

      console.log(`✅ Assinatura criada: ${plan.display_name} (${plan.leads_limit} leads/mês)`);
    } else {
      console.log(`✅ Assinatura ativa: ${subscription.subscription_plans.display_name}`);
      console.log(`   - Leads usados: ${subscription.leads_used}`);
      console.log(`   - Leads restantes: ${subscription.leads_remaining}`);
      console.log(`   - Limite total: ${subscription.subscription_plans.leads_limit}\n`);
    }

    // 3. Testar função de verificação de disponibilidade
    console.log('3️⃣ Testando verificação de disponibilidade...');
    const { data: availability, error: availError } = await supabase.rpc('check_leads_availability', {
      p_user_id: user.id,
      p_leads_to_generate: 5
    });

    if (availError) {
      console.error('❌ Erro ao verificar disponibilidade:', availError);
      return;
    }

    console.log('📊 Resultado da verificação:');
    console.log(`   - Pode gerar: ${availability.can_generate}`);
    console.log(`   - Motivo: ${availability.reason}`);
    console.log(`   - Mensagem: ${availability.message}`);
    console.log(`   - Leads restantes: ${availability.leads_remaining}`);
    console.log(`   - Limite total: ${availability.leads_limit}\n`);

    // 4. Testar consumo de leads (se disponível)
    if (availability.can_generate) {
      console.log('4️⃣ Testando consumo de leads...');
      const { data: consumeResult, error: consumeError } = await supabase.rpc('consume_leads', {
        p_user_id: user.id,
        p_leads_consumed: 5,
        p_operation_reason: 'teste_integracao'
      });

      if (consumeError) {
        console.error('❌ Erro ao consumir leads:', consumeError);
        return;
      }

      console.log('📊 Resultado do consumo:');
      console.log(`   - Sucesso: ${consumeResult.success}`);
      console.log(`   - Mensagem: ${consumeResult.message}`);
      console.log(`   - Leads consumidos: ${consumeResult.leads_consumed}`);
      console.log(`   - Leads restantes: ${consumeResult.leads_remaining}\n`);
    } else {
      console.log('⚠️ Não é possível testar consumo - leads insuficientes\n');
    }

    // 5. Verificar histórico de uso
    console.log('5️⃣ Verificando histórico de uso...');
    const { data: history, error: historyError } = await supabase
      .from('leads_usage_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (historyError) {
      console.error('❌ Erro ao buscar histórico:', historyError);
      return;
    }

    console.log(`📈 Últimas ${history.length} operações:`);
    history.forEach((record, index) => {
      const date = new Date(record.created_at).toLocaleString('pt-BR');
      console.log(`   ${index + 1}. ${date} - ${record.leads_generated} leads (${record.operation_type}) - Restantes: ${record.remaining_leads}`);
    });

    console.log('\n✅ Teste do sistema de controle de leads concluído!');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar teste
testLeadControlSystem();
