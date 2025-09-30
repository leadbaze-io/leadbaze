const PerfectPayService = require('./services/perfectPayService');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lsvwjyhnnzeewuuuykmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'
);

const perfectPayService = new PerfectPayService(supabase);

console.log('🎯 ===== PRODUTOS CONFIGURADOS NO PERFECT PAY =====');
console.log('');

// IDs dos planos que você configurou
const PLANS = {
  START: '460a8b88-f828-4b18-9d42-4b8ad5333d61',
  SCALE: 'e9004fad-85ab-41b8-9416-477e41e8bcc9', 
  ENTERPRISE: 'a961e361-75d0-40cf-9461-62a7802a1948'
};

async function showProducts() {
  try {
    // Buscar planos no banco
    const { data: plans } = await supabase
      .from('payment_plans')
      .select('*')
      .order('price_cents', { ascending: true });

    console.log('📋 PLANOS NO BANCO DE DADOS:');
    plans.forEach(plan => {
      console.log(`   ✅ ${plan.display_name}: R$ ${(plan.price_cents / 100).toFixed(2)}`);
      console.log(`      - ID: ${plan.id}`);
      console.log(`      - Nome: ${plan.name}`);
      console.log(`      - Leads: ${plan.leads_included}`);
      console.log('');
    });

    console.log('🔗 LINKS DE CHECKOUT REAIS:');
    console.log('');

    // Gerar links reais para cada plano
    const TEST_USER_ID = '39dc6c62-6dea-4222-adb5-7075fd704189';
    
    for (const [planName, planId] of Object.entries(PLANS)) {
      try {
        const checkout = await perfectPayService.createCheckoutLink(TEST_USER_ID, planId, 'new');
        console.log(`🛒 ${planName}:`);
        console.log(`   URL: ${checkout.checkoutUrl}`);
        console.log(`   Preço: R$ ${checkout.plan.price}`);
        console.log(`   Operação: ${checkout.operationType}`);
        console.log('');
      } catch (error) {
        console.log(`❌ ${planName}: ${error.message}`);
      }
    }

    console.log('📝 COMO USAR:');
    console.log('1. Copie qualquer URL acima');
    console.log('2. Cole no navegador');
    console.log('3. Complete o pagamento');
    console.log('4. Webhook será processado automaticamente');
    console.log('');
    console.log('⚠️ IMPORTANTE:');
    console.log('- URLs são válidas por 24 horas');
    console.log('- Cada URL é única (timestamp)');
    console.log('- Após pagamento, webhook atualiza o banco');
    console.log('');
    console.log('🎯 PRODUTOS PERFECT PAY CONFIGURADOS:');
    console.log('✅ Start - R$ 197,00 (1000 leads)');
    console.log('✅ Scale - R$ 497,00 (4000 leads)');
    console.log('✅ Enterprise - R$ 997,00 (10000 leads)');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

showProducts();








