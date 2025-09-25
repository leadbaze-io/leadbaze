const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lsvwjyhnnzeewuuuykmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'
);

console.log('🎯 ===== LINKS DIRETOS PARA SEUS PRODUTOS PERFECT PAY =====\n');

// Códigos dos produtos que você configurou no Perfect Pay
const PRODUCT_CODES = {
  START: 'PPLQQNG92',    // Código do produto Start
  SCALE: 'PPLQQNG90',    // Código do produto Scale  
  ENTERPRISE: 'PPLQQNG91' // Código do produto Enterprise
};

async function generateDirectLinks() {
  try {
    // Buscar planos no banco
    const { data: plans } = await supabase
      .from('payment_plans')
      .select('*')
      .order('price_cents', { ascending: true });

    console.log('📋 SEUS PRODUTOS CONFIGURADOS NO PERFECT PAY:');
    console.log('');

    plans.forEach((plan, index) => {
      const productCode = Object.values(PRODUCT_CODES)[index];
      const price = (plan.price_cents / 100).toFixed(2);
      
      console.log(`✅ ${plan.display_name}:`);
      console.log(`   - Código do Produto: ${productCode}`);
      console.log(`   - Preço: R$ ${price}`);
      console.log(`   - Leads: ${plan.leads_included}`);
      console.log('');
    });

    console.log('🔗 COMO CRIAR LINKS DIRETOS:');
    console.log('');
    console.log('📝 FORMATO DA URL:');
    console.log('https://perfectpay.com.br/checkout/[CODIGO_DO_PRODUTO]?email=[EMAIL]&external_reference=[REFERENCIA]');
    console.log('');

    // Gerar exemplos de links diretos
    const TEST_EMAIL = 'creaty123456@gmail.com';
    const TEST_USER_ID = '39dc6c62-6dea-4222-adb5-7075fd704189';

    console.log('🛒 EXEMPLOS DE LINKS DIRETOS:');
    console.log('');

    Object.entries(PRODUCT_CODES).forEach(([planName, productCode]) => {
      const timestamp = Date.now();
      const externalRef = `direct_${TEST_USER_ID}_${productCode}_${timestamp}`;
      
      const directLink = `https://perfectpay.com.br/checkout/${productCode}?email=${TEST_EMAIL}&external_reference=${externalRef}`;
      
      console.log(`🛒 ${planName}:`);
      console.log(`   ${directLink}`);
      console.log('');
    });

    console.log('📝 COMO USAR:');
    console.log('1. Copie qualquer link acima');
    console.log('2. Cole no navegador');
    console.log('3. Complete o pagamento');
    console.log('4. Perfect Pay enviará webhook para seu sistema');
    console.log('');
    console.log('⚠️ IMPORTANTE:');
    console.log('- Substitua [EMAIL] pelo email do cliente');
    console.log('- Substitua [REFERENCIA] por uma referência única');
    console.log('- Os códigos dos produtos são os que você configurou');
    console.log('');
    console.log('🎯 VANTAGENS DOS LINKS DIRETOS:');
    console.log('✅ Não dependem de API');
    console.log('✅ Funcionam imediatamente');
    console.log('✅ Redirecionam para seus produtos reais');
    console.log('✅ Webhooks funcionam normalmente');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

generateDirectLinks();


