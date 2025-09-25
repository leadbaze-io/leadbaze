const { createClient } = require('@supabase/supabase-js');

// Use as credenciais do seu projeto
const supabaseUrl = process.env.SUPABASE_URL || 'https://qjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcWpxanFqcWpxanFqcWpxanFqcWoiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5OTk5OTk5OSwiZXhwIjoyMDE1NTc1OTk5fQ.example';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPlans() {
  try {
    console.log('🔍 Testando busca de planos...');
    
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('id, name, display_name, price_monthly, leads_limit, is_active')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    if (error) {
      console.error('❌ Erro:', error);
      return;
    }

    console.log(`✅ Encontrados ${plans.length} planos:`);
    plans.forEach(plan => {
      console.log(`  - ${plan.display_name}: R$ ${plan.price_monthly} (${plan.leads_limit} leads) - Ativo: ${plan.is_active}`);
    });

    // Testar a resposta da API
    const response = {
      success: true,
      data: {
        currentSubscription: null,
        availablePlans: plans,
        downgradePlans: []
      }
    };

    console.log('\n📤 Resposta da API seria:');
    console.log(JSON.stringify(response, null, 2));

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testPlans();



