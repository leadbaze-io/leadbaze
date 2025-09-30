const fetch = require('node-fetch');

async function testWebhook() {
  try {
    console.log('🧪 Testando webhook manualmente...');
    
    // Dados do webhook baseados na assinatura PENDING
    const webhookData = {
      type: 'subscription_preapproval',
      action: 'authorized',
      data: {
        id: '1fed983470234086a7da9dbaca47deef' // gateway_subscription_id da assinatura PENDING
      }
    };

    const response = await fetch('http://localhost:3001/api/recurring-subscription/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookData)
    });

    const result = await response.json();
    
    console.log('📊 Status:', response.status);
    console.log('📊 Resposta:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Webhook processado com sucesso!');
    } else {
      console.log('❌ Erro no webhook:', result.message);
    }

  } catch (error) {
    console.error('❌ Erro ao testar webhook:', error);
  }
}

testWebhook();

