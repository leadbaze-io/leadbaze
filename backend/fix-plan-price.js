const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lsvwjyhnnzeewuuuykmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'
);

async function fixPlanPrice() {
  console.log('🔧 ===== CORRIGINDO PREÇO DO PLANO START =====\n');

  try {
    // Atualizar preço do plano Start
    console.log('1️⃣ Atualizando preço do plano Start para R$ 197...');
    const { data, error } = await supabase
      .from('payment_plans')
      .update({ 
        price_reais: 197,
        updated_at: new Date().toISOString()
      })
      .eq('name', 'start')
      .select();

    if (error) {
      console.error('❌ Erro ao atualizar plano:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Plano Start atualizado com sucesso!');
      console.log('   ID:', data[0].id);
      console.log('   Nome:', data[0].name);
      console.log('   Display Name:', data[0].display_name);
      console.log('   Preço (Reais):', data[0].price_reais);
      console.log('   Leads Incluídos:', data[0].leads_included);
      console.log('   Ativo:', data[0].is_active);
      console.log('   Atualizado em:', data[0].updated_at);
    } else {
      console.log('❌ Nenhum plano foi atualizado!');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

fixPlanPrice();
