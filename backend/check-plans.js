const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcWpxanFqcWpxanFqcWpxanFqcWoiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5OTk5OTk5OSwiZXhwIjoyMDE1NTc1OTk5fQ.example';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPlans() {
  try {
    console.log('🔍 Verificando planos no banco...');
    
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar planos:', error);
      return;
    }

    console.log(`✅ Encontrados ${plans.length} planos ativos:`);
    plans.forEach(plan => {
      console.log(`- ${plan.display_name}: R$ ${plan.price_monthly} (${plan.leads_limit} leads)`);
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

checkPlans();



