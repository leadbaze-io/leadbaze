const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lsvwjyhnnzeewuuuykmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'
);

console.log('🔧 ===== CORRIGINDO LINKS DO PERFECT PAY =====\n');

// Códigos dos produtos que você configurou no Perfect Pay
const PRODUCT_CODES = {
  START: 'PPLQQNG92',    // Código do produto Start
  SCALE: 'PPLQQNG90',    // Código do produto Scale  
  ENTERPRISE: 'PPLQQNG91' // Código do produto Enterprise
};

async function generateCorrectLinks() {
  try {
    // Buscar planos no banco
    const { data: plans } = await supabase
      .from('payment_plans')
      .select('*')
      .order('price_cents', { ascending: true });

    console.log('📋 SEUS PRODUTOS CONFIGURADOS:');
    console.log('');

    plans.forEach((plan, index) => {
      const productCode = Object.values(PRODUCT_CODES)[index];
      const price = (plan.price_cents / 100).toFixed(2);
      
      console.log(`✅ ${plan.display_name}:`);
      console.log(`   - Código: ${productCode}`);
      console.log(`   - Preço: R$ ${price}`);
      console.log(`   - Leads: ${plan.leads_included}`);
      console.log('');
    });

    console.log('🔍 TESTANDO DIFERENTES DOMÍNIOS:');
    console.log('');

    // Testar diferentes domínios possíveis
    const possibleDomains = [
      'https://app.perfectpay.com.br',
      'https://checkout.perfectpay.com.br', 
      'https://pay.perfectpay.com.br',
      'https://perfectpay.com.br',
      'https://www.perfectpay.com.br'
    ];

    const TEST_USER_ID = '39dc6c62-6dea-4222-adb5-7075fd704189';
    const TEST_EMAIL = 'creaty123456@gmail.com';

    console.log('🛒 LINKS ALTERNATIVOS PARA TESTAR:');
    console.log('');

    Object.entries(PRODUCT_CODES).forEach(([planName, productCode]) => {
      const timestamp = Date.now();
      const externalRef = `test_${TEST_USER_ID}_${productCode}_${timestamp}`;
      
      console.log(`🛒 ${planName} (${productCode}):`);
      
      possibleDomains.forEach(domain => {
        const link = `${domain}/checkout/${productCode}?email=${TEST_EMAIL}&external_reference=${externalRef}`;
        console.log(`   ${link}`);
      });
      
      console.log('');
    });

    console.log('📝 COMO TESTAR:');
    console.log('1. Copie cada link acima');
    console.log('2. Teste no navegador');
    console.log('3. Veja qual domínio funciona');
    console.log('4. Use apenas os links que funcionam');
    console.log('');
    console.log('🎯 SOLUÇÃO ALTERNATIVA:');
    console.log('Se nenhum domínio funcionar, podemos:');
    console.log('✅ Implementar checkout direto no seu site');
    console.log('✅ Usar iframe do Perfect Pay');
    console.log('✅ Integrar com outra gateway de pagamento');
    console.log('✅ Criar sistema de pagamento próprio');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

generateCorrectLinks();










