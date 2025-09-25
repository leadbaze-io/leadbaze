const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './config.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testBonusLeadsSystem() {
  console.log('🧪 Testando Sistema de Leads Bônus...\n');

  try {
    // 1. Testar função de dar leads bônus
    console.log('1️⃣ Testando give_bonus_leads_to_new_user...');
    const testUserId = '7231405b-9d55-402e-9662-df0f11cbba66'; // Usuário com assinatura cancelada
    
    const { data: bonusResult, error: bonusError } = await supabase.rpc('give_bonus_leads_to_new_user', {
      p_user_id: testUserId
    });
    
    if (bonusError) {
      console.error('❌ Erro ao dar leads bônus:', bonusError);
    } else {
      console.log('✅ Leads bônus dados:', bonusResult);
    }

    // 2. Testar função de status
    console.log('\n2️⃣ Testando get_user_leads_status...');
    const { data: statusResult, error: statusError } = await supabase.rpc('get_user_leads_status', {
      p_user_id: testUserId
    });
    
    if (statusError) {
      console.error('❌ Erro ao buscar status:', statusError);
    } else {
      console.log('✅ Status do usuário:', JSON.stringify(statusResult, null, 2));
    }

    // 3. Testar consumo de leads
    console.log('\n3️⃣ Testando consume_lead_simple...');
    const { data: consumeResult, error: consumeError } = await supabase.rpc('consume_lead_simple', {
      p_user_id: testUserId,
      p_quantity: 5
    });
    
    if (consumeError) {
      console.error('❌ Erro ao consumir leads:', consumeError);
    } else {
      console.log('✅ Leads consumidos:', consumeResult);
    }

    // 4. Verificar status após consumo
    console.log('\n4️⃣ Verificando status após consumo...');
    const { data: finalStatus, error: finalError } = await supabase.rpc('get_user_leads_status', {
      p_user_id: testUserId
    });
    
    if (finalError) {
      console.error('❌ Erro ao buscar status final:', finalError);
    } else {
      console.log('✅ Status final:', JSON.stringify(finalStatus, null, 2));
    }

    // 5. Verificar dados na tabela
    console.log('\n5️⃣ Verificando dados na tabela user_subscriptions...');
    const { data: subscriptionData, error: subError } = await supabase
      .from('user_subscriptions')
      .select('id, user_id, plan_id, status, bonus_leads, bonus_leads_used, leads_remaining, leads_used')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (subError) {
      console.error('❌ Erro ao buscar dados da tabela:', subError);
    } else {
      console.log('✅ Dados da tabela:', subscriptionData);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testBonusLeadsSystem();
