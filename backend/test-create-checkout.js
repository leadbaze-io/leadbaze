const { createClient } = require('@supabase/supabase-js');
const PerfectPayService = require('./services/perfectPayService');

const supabase = createClient(
  'https://lsvwjyhnnzeewuuuykmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'
);

const perfectPayService = new PerfectPayService(supabase);
const TEST_USER_ID = '39dc6c62-6dea-4222-adb5-7075fd704189';

async function testCreateCheckout() {
  console.log('🚀 ===== TESTE: CREATE CHECKOUT =====\n');

  try {
    // Testar criação de checkout para plano Start
    console.log('1️⃣ Testando criação de checkout para plano Start...');
    
    const checkoutResult = await perfectPayService.createCheckoutLink(
      TEST_USER_ID, 
      '460a8b88-f828-4b18-9d42-4b8ad5333d61', // ID do plano Start
      'new'
    );

    console.log('✅ Checkout criado com sucesso:');
    console.log(JSON.stringify(checkoutResult, null, 2));

    // Testar endpoint via API
    console.log('\n2️⃣ Testando endpoint da API...');
    const apiResponse = await fetch('http://localhost:3001/api/perfect-pay/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        planId: '460a8b88-f828-4b18-9d42-4b8ad5333d61'
      })
    });

    const apiData = await apiResponse.json();
    console.log('✅ API Response:');
    console.log(JSON.stringify(apiData, null, 2));

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testCreateCheckout();










