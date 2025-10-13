require('dotenv').config({ path: './config.env' });

async function testReturnUrls() {
  console.log('🔍 ===== TESTANDO URLs DE RETORNO =====\n');

  try {
    // 1. Verificar variáveis de ambiente
    console.log('1️⃣ Verificando variáveis de ambiente...');
    console.log(`   NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL || 'NÃO DEFINIDA'}`);
    console.log(`   BACKEND_URL: ${process.env.BACKEND_URL || 'NÃO DEFINIDA'}`);
    console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'NÃO DEFINIDA'}`);

    // 2. URLs que serão usadas
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://leadbaze.io';
    
    console.log('\n2️⃣ URLs de retorno configuradas:');
    console.log(`   ✅ Success URL: ${baseUrl}/profile`);
    console.log(`   ✅ Cancel URL: ${baseUrl}/profile`);
    console.log(`   ✅ Lead Packages Success: ${baseUrl}/profile?tab=lead-packages&success=true`);
    console.log(`   ✅ Lead Packages Cancel: ${baseUrl}/profile?tab=lead-packages&cancel=true`);

    // 3. Simular criação de checkout
    console.log('\n3️⃣ Simulando criação de checkout...');
    
    const checkoutData = {
      customer_email: 'teste@leadbaze.io',
      customer_name: 'Usuário Teste',
      external_reference: 'test_subscription_123',
      amount: 197,
      description: 'Assinatura Start - LeadBaze',
      recurring: true,
      period: 'monthly',
      success_url: `${baseUrl}/profile`,
      cancel_url: `${baseUrl}/profile`,
      webhook_url: `${process.env.BACKEND_URL || 'https://api.leadbaze.io'}/api/perfect-pay/webhook`,
      plan_id: '460a8b88-f828-4b18-9d42-4b8ad5333d61',
      plan_name: 'start'
    };

    console.log('📋 Dados do checkout:');
    console.log(`   Customer Email: ${checkoutData.customer_email}`);
    console.log(`   Amount: R$ ${checkoutData.amount}`);
    console.log(`   Success URL: ${checkoutData.success_url}`);
    console.log(`   Cancel URL: ${checkoutData.cancel_url}`);
    console.log(`   Webhook URL: ${checkoutData.webhook_url}`);

    // 4. Simular parâmetros da URL
    console.log('\n4️⃣ Parâmetros que serão enviados ao Perfect Pay:');
    const params = new URLSearchParams({
      email: checkoutData.customer_email,
      external_reference: checkoutData.external_reference,
      customer_name: checkoutData.customer_name,
      notification_url: checkoutData.webhook_url,
      success_url: checkoutData.success_url,
      cancel_url: checkoutData.cancel_url
    });

    console.log('📋 Parâmetros da URL:');
    console.log(`   ${params.toString()}`);

    // 5. URL completa simulada
    console.log('\n5️⃣ URL completa simulada:');
    const baseLink = 'https://perfectpay.com.br/checkout/start'; // Link fictício
    const checkoutUrl = `${baseLink}?${params.toString()}`;
    console.log(`   ${checkoutUrl}`);

    // 6. Verificar se as URLs são válidas
    console.log('\n6️⃣ Validação das URLs:');
    
    const isValidUrl = (url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    const urls = [
      checkoutData.success_url,
      checkoutData.cancel_url,
      checkoutData.webhook_url
    ];

    urls.forEach((url, index) => {
      const isValid = isValidUrl(url);
      const status = isValid ? '✅' : '❌';
      console.log(`   ${status} URL ${index + 1}: ${url}`);
    });

    console.log('\n🎉 TESTE CONCLUÍDO!');
    console.log('💡 Após o pagamento no Perfect Pay, o usuário será redirecionado para:');
    console.log(`   🔗 ${baseUrl}/profile`);
    console.log('\n📝 Para configurar em produção, defina a variável:');
    console.log(`   NEXT_PUBLIC_APP_URL=https://leadbaze.io`);

  } catch (err) {
    console.error('❌ Erro inesperado:', err.message);
  }
}

testReturnUrls();






