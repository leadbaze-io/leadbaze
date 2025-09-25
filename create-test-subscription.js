// Script para criar uma assinatura de teste para o usuário
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestSubscription() {
  console.log('🔧 Criando Assinatura de Teste...\n');

  const userId = '5069fa1e-5de4-44f8-9f45-8ef95a57f0b0'; // ID correto do usuário creaty1234567@gmail.com

  try {
    // 1. Buscar plano Start
    console.log('1️⃣ Buscando plano Start...');
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('name', 'start')
      .single();

    if (planError) {
      console.error('❌ Erro ao buscar plano:', planError);
      return;
    }

    console.log(`✅ Plano encontrado: ${plan.display_name} (${plan.leads_limit} leads/mês)\n`);

    // 2. Deletar assinatura existente (se houver)
    console.log('2️⃣ Removendo assinaturas existentes...');
    const { error: deleteError } = await supabase
      .from('user_subscriptions')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('❌ Erro ao deletar assinatura existente:', deleteError);
    } else {
      console.log('✅ Assinaturas existentes removidas\n');
    }

    // 3. Criar nova assinatura
    console.log('3️⃣ Criando nova assinatura...');
    const { data: subscription, error: createError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
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

    console.log('✅ Assinatura criada com sucesso!');
    console.log(`   - ID: ${subscription.id}`);
    console.log(`   - Plano: ${plan.display_name}`);
    console.log(`   - Leads disponíveis: ${subscription.leads_remaining}`);
    console.log(`   - Período: ${new Date(subscription.current_period_start).toLocaleDateString('pt-BR')} até ${new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}\n`);

    // 4. Testar verificação de disponibilidade
    console.log('4️⃣ Testando verificação de disponibilidade...');
    const { data: availability, error: availError } = await supabase.rpc('check_leads_availability', {
      p_user_id: userId,
      p_leads_to_generate: 10
    });

    if (availError) {
      console.error('❌ Erro ao verificar disponibilidade:', availError);
    } else {
      console.log('✅ Verificação de disponibilidade:');
      console.log(`   - Pode gerar: ${availability.can_generate}`);
      console.log(`   - Motivo: ${availability.reason}`);
      console.log(`   - Leads restantes: ${availability.leads_remaining}`);
      console.log(`   - Limite total: ${availability.leads_limit}\n`);
    }

    // 5. Testar consumo de leads
    console.log('5️⃣ Testando consumo de leads...');
    const { data: consumeResult, error: consumeError } = await supabase.rpc('consume_leads', {
      p_user_id: userId,
      p_leads_consumed: 10,
      p_operation_reason: 'teste_criacao_assinatura'
    });

    if (consumeError) {
      console.error('❌ Erro ao consumir leads:', consumeError);
    } else {
      console.log('✅ Consumo de leads:');
      console.log(`   - Sucesso: ${consumeResult.success}`);
      console.log(`   - Leads consumidos: ${consumeResult.leads_consumed}`);
      console.log(`   - Leads restantes: ${consumeResult.leads_remaining}\n`);
    }

    console.log('🎉 Assinatura de teste criada e testada com sucesso!');
    console.log('💡 Agora você pode testar a geração de leads no frontend.');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar criação
createTestSubscription();
