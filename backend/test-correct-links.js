const PerfectPayService = require('./services/perfectPayService');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const perfectPayService = new PerfectPayService(supabase);

async function testCorrectLinks() {
  console.log('🧪 [TESTE] ===== TESTANDO LINKS CORRETOS =====');
  
  // IDs dos planos no banco
  const PLANS = {
    START: '460a8b88-f828-4b18-9d42-4b8ad5333d61',
    SCALE: 'e9004fad-85ab-41b8-9416-477e41e8bcc9', 
    ENTERPRISE: 'a961e361-75d0-40cf-9461-62a7802a1948'
  };
  
  const TEST_USER_ID = '4b518881-21e6-42d5-9958-c794b63d460e';
  
  console.log('📋 [TESTE] Links esperados:');
  console.log('  - Start: https://go.perfectpay.com.br/PPU38CQ17OT');
  console.log('  - Scale: https://go.perfectpay.com.br/PPU38CQ17OP');
  console.log('  - Enterprise: https://go.perfectpay.com.br/PPU38CQ17OS');
  console.log('');
  
  for (const [planName, planId] of Object.entries(PLANS)) {
    try {
      console.log(`🔄 [TESTE] Testando ${planName}...`);
      
      const result = await perfectPayService.createCheckoutLink(TEST_USER_ID, planId, 'new');
      
      console.log(`✅ [TESTE] ${planName}:`);
      console.log(`   URL gerada: ${result.checkoutUrl}`);
      console.log(`   Preço: R$ ${result.plan.price}`);
      console.log(`   Leads: ${result.plan.leads}`);
      console.log(`   Operação: ${result.operationType}`);
      
      // Verificar se o link está correto
      const expectedLinks = {
        START: 'https://go.perfectpay.com.br/PPU38CQ17OT',
        SCALE: 'https://go.perfectpay.com.br/PPU38CQ17OP',
        ENTERPRISE: 'https://go.perfectpay.com.br/PPU38CQ17OS'
      };
      
      const expectedLink = expectedLinks[planName];
      if (result.checkoutUrl === expectedLink) {
        console.log(`   ✅ Link correto!`);
      } else {
        console.log(`   ❌ Link incorreto! Esperado: ${expectedLink}`);
      }
      
      console.log('');
      
    } catch (error) {
      console.error(`❌ [TESTE] ${planName}: ${error.message}`);
      console.log('');
    }
  }
  
  console.log('🎯 [TESTE] ===== CONCLUSÃO =====');
  console.log('✅ [TESTE] Teste de links concluído');
  console.log('💡 [TESTE] Verifique se todos os links estão corretos acima');
}

testCorrectLinks().catch(console.error);

